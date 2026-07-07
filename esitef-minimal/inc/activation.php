<?php
/**
 * On theme activation — create pages and menu hints (ponytail: run once).
 *
 * @package esitef-minimal
 */

function esitef_minimal_activation_setup() {
	esitef_minimal_sync_page_templates( true );
}
add_action( 'after_switch_theme', 'esitef_minimal_activation_setup' );

/**
 * Assign theme page templates (runs once per theme version on staging/prod).
 */
function esitef_minimal_sync_page_templates( $force = false ) {
	$version = '1.2.2';
	if ( ! $force && get_option( 'esitef_page_templates_version' ) === $version ) {
		return;
	}

	$pages = array(
		'ingresar'    => array( 'title' => 'Ingresar', 'template' => 'page-templates/page-login.php' ),
		'mentorias'   => array( 'title' => 'Mentorías', 'template' => 'page-templates/page-mentorias.php' ),
		'formaciones' => array( 'title' => 'Formaciones Online', 'template' => 'page-templates/page-formaciones.php' ),
		'libros'      => array( 'title' => 'Libros', 'template' => 'page-templates/page-libros.php' ),
		'articulos'   => array( 'title' => 'Artículos', 'template' => 'page-templates/page-articulos.php' ),
		'descarga-libro-69-ideas' => array( 'title' => 'Descarga libro 69 ideas', 'template' => 'page-templates/page-descarga-libro.php' ),
		'descarga-libro-dolor'    => array( 'title' => 'Descarga libro Dolor', 'template' => 'page-templates/page-descarga-libro.php' ),
		'descarga-libro'          => array( 'title' => 'Descarga libro Movimiento', 'template' => 'page-templates/page-descarga-libro.php' ),
		'a-mi-musa-la-invento-yo' => array( 'title' => 'A mi musa la invento yo', 'template' => 'page-templates/page-descarga-libro.php' ),
		'la-escuela'  => array( 'title' => 'La Escuela', 'template' => 'page-templates/page-la-escuela.php' ),
		'escuela-2'   => array( 'title' => 'La Escuela', 'template' => 'page-templates/page-la-escuela.php' ),
		'espana' => array(
			'title'    => 'España',
			'template' => 'page-templates/page-pais.php',
		),
		'argentina' => array(
			'title'    => 'Argentina',
			'template' => 'page-templates/page-pais.php',
		),
		'mexico' => array(
			'title'    => 'México',
			'template' => 'page-templates/page-pais.php',
		),
		'peru' => array(
			'title'    => 'Perú',
			'template' => 'page-templates/page-pais.php',
		),
		'colombia' => array(
			'title'    => 'Colombia',
			'template' => 'page-templates/page-pais.php',
		),
		'uruguay' => array(
			'title'    => 'Uruguay',
			'template' => 'page-templates/page-pais.php',
		),
	);

	$pages = array_merge( $pages, esitef_get_presencial_pages_for_activation() );
	$pages = array_merge( $pages, esitef_get_formacion_hub_pages_for_activation() );

	foreach ( $pages as $slug => $data ) {
		$page = get_page_by_path( $slug );
		if ( $page ) {
			update_post_meta( $page->ID, '_wp_page_template', $data['template'] );
			continue;
		}
		if ( in_array( $slug, array( 'escuela-2' ), true ) ) {
			continue;
		}
		$id = wp_insert_post(
			array(
				'post_title'  => $data['title'],
				'post_name'   => $slug,
				'post_status' => 'publish',
				'post_type'   => 'page',
			)
		);
		if ( $id && ! is_wp_error( $id ) ) {
			update_post_meta( $id, '_wp_page_template', $data['template'] );
		}
	}

	$home = get_page_by_path( 'inicio' );
	if ( $home ) {
		update_option( 'page_on_front', $home->ID );
		update_option( 'show_on_front', 'page' );
	}

	update_option( 'esitef_page_templates_version', $version );
}
add_action( 'init', 'esitef_minimal_sync_page_templates' );
