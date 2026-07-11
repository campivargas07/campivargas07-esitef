<?php
/**
 * Yoast SEO — quitar redirects legacy de /argentina/ y /mexico/ hacia SVG de banderas.
 *
 * @package esitef-minimal
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Country slugs that must resolve to page-pais.php, not media attachments.
 *
 * @return string[]
 */
function esitef_get_country_page_slugs() {
	if ( ! function_exists( 'esitef_get_paises' ) ) {
		return array( 'argentina', 'mexico' );
	}

	return array_keys( esitef_get_paises() );
}

/**
 * Whether a redirect target is a legacy flag SVG for a country landing.
 *
 * @param string $redirect_url Target URL.
 */
function esitef_is_legacy_country_flag_redirect( $redirect_url ) {
	return is_string( $redirect_url ) && (bool) preg_match( '#/wp-content/uploads/.*\.svg$#i', $redirect_url );
}

/**
 * Whether the current request targets a country landing slug.
 *
 * @param string $request_url Optional request URL/path.
 */
function esitef_is_country_landing_request( $request_url = '' ) {
	if ( ! $request_url ) {
		$request_url = isset( $_SERVER['REQUEST_URI'] ) ? wp_unslash( $_SERVER['REQUEST_URI'] ) : '';
	}

	$path = trim( (string) wp_parse_url( $request_url, PHP_URL_PATH ), '/' );
	if ( '' === $path ) {
		return false;
	}

	$parts = explode( '/', $path );
	$slug  = sanitize_title( (string) end( $parts ) );

	return in_array( $slug, esitef_get_country_page_slugs(), true );
}

/**
 * Rename media attachments that block a country page slug (e.g. argentina.svg → slug argentina).
 *
 * @param string $slug Country page slug.
 * @return int Number of attachments renamed.
 */
function esitef_release_country_slug_from_attachments( $slug ) {
	$attachments = get_posts(
		array(
			'name'           => $slug,
			'post_type'      => 'attachment',
			'post_status'    => 'inherit',
			'posts_per_page' => 10,
			'fields'         => 'ids',
		)
	);

	$renamed = 0;
	foreach ( $attachments as $attachment_id ) {
		$new_slug = $slug . '-flag';
		$updated  = wp_update_post(
			array(
				'ID'        => (int) $attachment_id,
				'post_name' => $new_slug,
			),
			true
		);

		if ( ! is_wp_error( $updated ) ) {
			++$renamed;
		}
	}

	return $renamed;
}

/**
 * Ensure a published country page exists and uses page-pais.php.
 *
 * @param string $slug  Country slug.
 * @param string $title Page title.
 * @return int|false Page ID or false.
 */
function esitef_ensure_country_page( $slug, $title ) {
	esitef_release_country_slug_from_attachments( $slug );

	$page = get_page_by_path( $slug, OBJECT, 'page' );
	if ( $page instanceof WP_Post && 'page' === $page->post_type ) {
		update_post_meta( $page->ID, '_wp_page_template', 'page-templates/page-pais.php' );
		return (int) $page->ID;
	}

	$page_id = wp_insert_post(
		array(
			'post_title'  => $title,
			'post_name'   => $slug,
			'post_status' => 'publish',
			'post_type'   => 'page',
		),
		true
	);

	if ( is_wp_error( $page_id ) || ! $page_id ) {
		return false;
	}

	update_post_meta( $page_id, '_wp_page_template', 'page-templates/page-pais.php' );
	return (int) $page_id;
}

/**
 * One-time fix: release slugs hijacked by flag SVGs and create country pages.
 */
function esitef_sync_country_pages() {
	$version = '1.0.1';
	if ( get_option( 'esitef_country_pages_version' ) === $version ) {
		return;
	}

	if ( ! function_exists( 'esitef_get_paises' ) ) {
		return;
	}

	$changed = false;
	foreach ( esitef_get_paises() as $slug => $pais ) {
		$before = get_page_by_path( $slug, OBJECT, 'page' );
		$page_id = esitef_ensure_country_page( $slug, $pais['title'] );
		if ( $page_id && ( ! $before || (int) $before->ID !== $page_id ) ) {
			$changed = true;
		}
	}

	if ( $changed ) {
		flush_rewrite_rules( false );
	}

	update_option( 'esitef_country_pages_version', $version );
}
add_action( 'init', 'esitef_sync_country_pages', 6 );

/**
 * Delete Yoast Premium redirect rows that hijack country landings.
 */
function esitef_cleanup_bad_yoast_country_redirects() {
	$version = '1.0.1';
	if ( get_option( 'esitef_yoast_redirects_cleaned' ) === $version ) {
		return;
	}

	global $wpdb;

	$table = $wpdb->prefix . 'yoast_seo_redirects';
	if ( $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $table ) ) !== $table ) {
		update_option( 'esitef_yoast_redirects_cleaned', $version );
		return;
	}

	foreach ( esitef_get_country_page_slugs() as $slug ) {
		$like_slug = '%' . $wpdb->esc_like( $slug ) . '%';
		$like_svg  = '%' . $wpdb->esc_like( $slug ) . '.svg%';

		$wpdb->query(
			$wpdb->prepare(
				"DELETE FROM {$table} WHERE origin LIKE %s OR target LIKE %s",
				$like_slug,
				$like_svg
			)
		);
	}

	delete_transient( 'yoast_seo_redirects' );
	wp_cache_delete( 'wpseo-premium-redirects-export', 'options' );

	update_option( 'esitef_yoast_redirects_cleaned', $version );
}
add_action( 'init', 'esitef_cleanup_bad_yoast_country_redirects', 5 );

/**
 * Cancel Yoast Premium redirect when it points a country landing to a flag SVG.
 *
 * @param string|false $redirect_url Redirect target.
 * @param string       $request_url  Requested URL.
 */
function esitef_block_yoast_country_flag_redirect( $redirect_url, $request_url = '' ) {
	if ( ! $redirect_url || ! esitef_is_legacy_country_flag_redirect( $redirect_url ) ) {
		return $redirect_url;
	}

	if ( esitef_is_country_landing_request( $request_url ) ) {
		return false;
	}

	return $redirect_url;
}
add_filter( 'wpseo_premium_redirect_url', 'esitef_block_yoast_country_flag_redirect', 10, 2 );

/**
 * Yoast SEO (free) uses a different filter name on some installs.
 *
 * @param string|false $redirect_url Redirect target.
 */
function esitef_block_yoast_free_country_flag_redirect( $redirect_url ) {
	if ( ! $redirect_url || ! esitef_is_legacy_country_flag_redirect( $redirect_url ) ) {
		return $redirect_url;
	}

	if ( esitef_is_country_landing_request() ) {
		return false;
	}

	return $redirect_url;
}
add_filter( 'wpseo_redirect', 'esitef_block_yoast_free_country_flag_redirect' );
