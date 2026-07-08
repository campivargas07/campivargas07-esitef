<?php
/**
 * Codespace: URLs correctas cuando el navegador externo usa el puerto reenviado (github.dev).
 *
 * @package esitef-minimal
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @return string
 */
function esitef_codespace_public_base() {
	$host = isset( $_SERVER['HTTP_X_FORWARDED_HOST'] ) ? (string) $_SERVER['HTTP_X_FORWARDED_HOST'] : '';
	if ( '' === $host && ! empty( $_SERVER['HTTP_HOST'] ) && false !== strpos( (string) $_SERVER['HTTP_HOST'], 'github.dev' ) ) {
		$host = (string) $_SERVER['HTTP_HOST'];
	}
	if ( '' === $host || 'localhost:8080' === $host || '127.0.0.1:8080' === $host ) {
		return '';
	}
	$proto = isset( $_SERVER['HTTP_X_FORWARDED_PROTO'] ) ? (string) $_SERVER['HTTP_X_FORWARDED_PROTO'] : 'https';
	return $proto . '://' . $host;
}

/**
 * @param string $value Option value.
 */
function esitef_codespace_filter_url( $value ) {
	$base = esitef_codespace_public_base();
	return $base ? $base : $value;
}
add_filter( 'option_home', 'esitef_codespace_filter_url' );
add_filter( 'option_siteurl', 'esitef_codespace_filter_url' );

/**
 * @param string $redirect_url Redirect target.
 */
function esitef_codespace_disable_bad_canonical( $redirect_url ) {
	if ( esitef_codespace_public_base() && $redirect_url && false !== strpos( $redirect_url, '://localhost' ) ) {
		return false;
	}
	return $redirect_url;
}
add_filter( 'redirect_canonical', 'esitef_codespace_disable_bad_canonical' );

/**
 * @param string $src Asset URL.
 */
function esitef_codespace_fix_asset_url( $src ) {
	$base = esitef_codespace_public_base();
	if ( ! $base || ! is_string( $src ) ) {
		return $src;
	}
	foreach ( array( 'http://localhost:8080', 'https://localhost:8080' ) as $local ) {
		if ( false !== strpos( $src, $local ) ) {
			return str_replace( $local, $base, $src );
		}
	}
	return $src;
}
add_filter( 'style_loader_src', 'esitef_codespace_fix_asset_url' );
add_filter( 'script_loader_src', 'esitef_codespace_fix_asset_url' );
