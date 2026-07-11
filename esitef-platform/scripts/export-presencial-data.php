<?php
/**
 * Export content data from esitef-minimal theme to JSON for Next.js.
 * Usage: php scripts/export-presencial-data.php
 */

define( 'ABSPATH', true );

function apply_filters( $tag, $value ) {
	return $value;
}

function add_action() {}
function add_filter() {}
function get_option() { return array(); }
function __( $text ) { return $text; }

function esitef_online_only_sales() {
	return false;
}

function get_template_directory() {
	global $theme_inc;
	return dirname( $theme_inc );
}

function esitef_asset_uri( $path ) {
	return 'https://esitef.com/online/wp-content/themes/esitef-minimal/assets/' . ltrim( $path, '/' );
}

$theme_inc = dirname( __DIR__, 2 ) . '/esitef-minimal/inc';
$out_dir   = dirname( __DIR__ ) . '/apps/web/src/data';
if ( ! is_dir( $out_dir ) ) {
	mkdir( $out_dir, 0755, true );
}

require $theme_inc . '/paises.php';
require $theme_inc . '/formaciones-presenciales.php';
require $theme_inc . '/presencial-checkout.php';
require $theme_inc . '/libros.php';
require $theme_inc . '/articulos.php';

$paises = esitef_get_paises();
$slugs  = array_keys( esitef_get_presenciales() );
$presenciales = array();
foreach ( $slugs as $slug ) {
	$row = esitef_get_presencial_by_slug( $slug );
	if ( $row ) {
		$presenciales[ $slug ] = $row;
	}
}

$redirects = esitef_get_presencial_redirects();

$checkout = array();
foreach ( $slugs as $slug ) {
	$config = esitef_get_presencial_checkout_config( $slug );
	if ( is_array( $config ) && ! empty( $config['checkout_enabled'] ) ) {
		$checkout[ $slug ] = $config;
	}
}

$libros = esitef_get_libros();
foreach ( $libros as $key => &$book ) {
	$book['key'] = $key;
	$book['form_path'] = '/' . $book['form_slug'];
	$book['pdf_url'] = esitef_get_libro_pdf_url( $key );
}
unset( $book );

$articulos = esitef_get_articulos();
foreach ( $articulos as $key => &$item ) {
	$item['key'] = $key;
	$item['pdf_url'] = esitef_get_articulo_pdf_url( $key );
}
unset( $item );

$write = static function ( $file, $data ) use ( $out_dir ) {
	file_put_contents(
		$out_dir . '/' . $file,
		json_encode( $data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES )
	);
};

$write( 'paises.json', $paises );
$write( 'presenciales.json', $presenciales );
$write( 'presencial-checkout.json', $checkout );
$write( 'presencial-redirects.json', $redirects );
$write( 'libros.json', $libros );
$write( 'articulos.json', $articulos );

echo 'Exported ' . count( $paises ) . ' países, ' . count( $presenciales ) . ' presenciales, ';
echo count( $libros ) . ' libros, ' . count( $articulos ) . " artículos\n";
