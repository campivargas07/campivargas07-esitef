<?php
/**
 * Primary nav — URLs helpers + sync menú WP (staging/prod).
 *
 * @package esitef-minimal
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Formaciones online archive/page URL.
 */
function esitef_get_formaciones_url() {
	$page = get_page_by_path( 'formaciones' );
	if ( $page ) {
		return get_permalink( $page );
	}

	$archive = get_post_type_archive_link( 'courses' );
	return $archive ? $archive : home_url( '/courses/' );
}

/**
 * La Escuela page URL.
 */
function esitef_get_escuela_url() {
	foreach ( array( 'la-escuela', 'escuela-2' ) as $slug ) {
		$page = get_page_by_path( $slug );
		if ( $page ) {
			return get_permalink( $page );
		}
	}

	return home_url( '/la-escuela/' );
}

/**
 * Permalink for a theme page slug (custom URL fallback).
 */
function esitef_get_page_url( $slug, $fallback_path = '' ) {
	$page = get_page_by_path( $slug );
	if ( $page ) {
		return get_permalink( $page );
	}

	return home_url( $fallback_path ? $fallback_path : '/' . trim( $slug, '/' ) . '/' );
}

/**
 * Insert or update one nav menu item.
 *
 * @return int Menu item post ID.
 */
function esitef_nav_insert_item( $menu_id, $title, $url, $parent_id = 0 ) {
	return (int) wp_update_nav_menu_item(
		$menu_id,
		0,
		array(
			'menu-item-title'     => $title,
			'menu-item-url'       => $url,
			'menu-item-status'    => 'publish',
			'menu-item-type'      => 'custom',
			'menu-item-parent-id' => (int) $parent_id,
		)
	);
}

/**
 * Rebuild Primary menu to match theme prototype (sin Ingresar/Carrito duplicados).
 */
function esitef_sync_primary_nav_menu() {
	$version = '1.0.1';
	if ( get_option( 'esitef_nav_menu_version' ) === $version ) {
		return;
	}

	$menu_name = 'Primary';
	$menu      = wp_get_nav_menu_object( $menu_name );

	if ( ! $menu ) {
		$menu_id = wp_create_nav_menu( $menu_name );
	} else {
		$menu_id = (int) $menu->term_id;
		$items   = wp_get_nav_menu_items( $menu_id );
		if ( is_array( $items ) ) {
			foreach ( $items as $item ) {
				wp_delete_post( (int) $item->ID, true );
			}
		}
	}

	if ( is_wp_error( $menu_id ) || ! $menu_id ) {
		return;
	}

	$locations            = get_theme_mod( 'nav_menu_locations', array() );
	$locations['menu-1']  = $menu_id;
	set_theme_mod( 'nav_menu_locations', $locations );

	$escuela_id = esitef_nav_insert_item( $menu_id, __( 'Escuela', 'esitef-minimal' ), esitef_get_escuela_url() );

	$online_id = esitef_nav_insert_item( $menu_id, __( 'Online', 'esitef-minimal' ), '#' );
	esitef_nav_insert_item( $menu_id, __( 'Formaciones', 'esitef-minimal' ), esitef_get_formaciones_url(), $online_id );
	esitef_nav_insert_item( $menu_id, __( 'Libros', 'esitef-minimal' ), esitef_get_page_url( 'libros' ), $online_id );
	esitef_nav_insert_item( $menu_id, __( 'Artículos', 'esitef-minimal' ), esitef_get_page_url( 'articulos' ), $online_id );
	esitef_nav_insert_item( $menu_id, __( 'Mentorías', 'esitef-minimal' ), esitef_get_page_url( 'mentorias' ), $online_id );

	$presencial_id = esitef_nav_insert_item( $menu_id, __( 'Presenciales', 'esitef-minimal' ), '#' );
	if ( function_exists( 'esitef_get_paises' ) ) {
		foreach ( esitef_get_paises() as $slug => $pais ) {
			esitef_nav_insert_item(
				$menu_id,
				$pais['title'],
				esitef_get_page_url( $slug ),
				$presencial_id
			);
		}
	}

	esitef_nav_insert_item( $menu_id, __( 'Contacto', 'esitef-minimal' ), esitef_get_page_url( 'contacto' ) );
	esitef_nav_insert_item( $menu_id, __( 'FAQs', 'esitef-minimal' ), esitef_get_page_url( 'faqs' ) );

	update_option( 'esitef_nav_menu_version', $version );
}
add_action( 'init', 'esitef_sync_primary_nav_menu', 20 );

/**
 * Runtime fixes for stale menu items (href vacío, URLs legacy).
 */
function esitef_fix_nav_menu_items( $items, $args ) {
	if ( ! isset( $args->theme_location ) || 'menu-1' !== $args->theme_location || ! is_array( $items ) ) {
		return $items;
	}

	$title_urls = array(
		'formaciones'  => esitef_get_formaciones_url(),
		'libros'       => esitef_get_page_url( 'libros' ),
		'artículos'    => esitef_get_page_url( 'articulos' ),
		'articulos'    => esitef_get_page_url( 'articulos' ),
		'mentorías'    => esitef_get_page_url( 'mentorias' ),
		'mentorias'    => esitef_get_page_url( 'mentorias' ),
		'escuela'      => esitef_get_escuela_url(),
		'contacto'     => esitef_get_page_url( 'contacto' ),
		'faqs'         => esitef_get_page_url( 'faqs' ),
	);

	$pais_urls = array();
	if ( function_exists( 'esitef_get_paises' ) ) {
		foreach ( esitef_get_paises() as $slug => $pais ) {
			$pais_urls[ mb_strtolower( $pais['title'] ) ] = esitef_get_page_url( $slug );
		}
	}

	$filtered = array();

	foreach ( $items as $item ) {
		$classes = (array) $item->classes;
		if ( in_array( 'item-movil-entrar', $classes, true ) || in_array( 'item-movil', $classes, true ) ) {
			continue;
		}

		$title_key = mb_strtolower( trim( wp_strip_all_tags( $item->title ) ) );

		if ( isset( $title_urls[ $title_key ] ) ) {
			$item->url = $title_urls[ $title_key ];
		} elseif ( isset( $pais_urls[ $title_key ] ) ) {
			$item->url = $pais_urls[ $title_key ];
		} elseif ( 'presenciales' === $title_key && ( ! $item->url || '#' === $item->url ) ) {
			$item->url = '#';
		} elseif ( 'online' === $title_key && ( ! $item->url || '#' === $item->url ) ) {
			$item->url = '#';
		}

		$filtered[] = $item;
	}

	return $filtered;
}
add_filter( 'wp_nav_menu_objects', 'esitef_fix_nav_menu_items', 20, 2 );
