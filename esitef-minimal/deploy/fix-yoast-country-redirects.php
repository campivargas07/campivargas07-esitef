<?php
/**
 * WP-CLI: fix /argentina/ and /mexico/ when flag SVG attachments hijack the slug.
 *
 * Usage (on staging):
 *   wp eval-file wp-content/themes/esitef-minimal/deploy/fix-yoast-country-redirects.php
 *
 * @package esitef-minimal
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit( 1 );
}

require_once get_template_directory() . '/inc/paises.php';
require_once get_template_directory() . '/inc/yoast-country-redirects.php';

delete_option( 'esitef_yoast_redirects_cleaned' );
delete_option( 'esitef_country_pages_version' );

esitef_cleanup_bad_yoast_country_redirects();
esitef_sync_country_pages();

$paises = esitef_get_paises();
$slugs  = array( 'argentina', 'mexico' );

foreach ( $slugs as $slug ) {
	$title = isset( $paises[ $slug ]['title'] ) ? $paises[ $slug ]['title'] : ucfirst( $slug );
	$page  = get_page_by_path( $slug, OBJECT, 'page' );

	if ( $page instanceof WP_Post && 'page' === $page->post_type ) {
		WP_CLI::log( "OK page: /{$slug}/ → ID {$page->ID}" );
		continue;
	}

	$page_id = esitef_ensure_country_page( $slug, $title );
	if ( $page_id ) {
		WP_CLI::log( "Created page: /{$slug}/ → ID {$page_id}" );
	} else {
		WP_CLI::warning( "Could not create page: {$slug}" );
	}
}

flush_rewrite_rules( false );
WP_CLI::success( 'Country pages fixed (attachments unblocked + redirects cleaned).' );
