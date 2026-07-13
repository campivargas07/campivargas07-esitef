<?php
/**
 * Plugin Name: ESITEF Cutover Read-Only
 * Description: Bloquea escrituras en WP durante el corte a Next.js. Activar solo en ventana go-live.
 * Version: 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! defined( 'ESITEF_CUTOVER_READONLY' ) || ! ESITEF_CUTOVER_READONLY ) {
	return;
}

/**
 * Allow login, REST auth bridge, and read-only browsing.
 */
function esitef_readonly_allowed() {
	if ( defined( 'WP_CLI' ) && WP_CLI ) {
		return true;
	}
	if ( defined( 'REST_REQUEST' ) && REST_REQUEST ) {
		return true;
	}
	if ( is_admin() && ! wp_doing_ajax() ) {
		return false;
	}
	return false;
}

add_action(
	'init',
	function () {
		if ( esitef_readonly_allowed() ) {
			return;
		}
		if ( 'POST' !== ( $_SERVER['REQUEST_METHOD'] ?? '' ) ) {
			return;
		}
		$uri = isset( $_SERVER['REQUEST_URI'] ) ? (string) $_SERVER['REQUEST_URI'] : '';
		if ( str_contains( $uri, '/wp-json/esitef/' ) ) {
			return;
		}
		if ( str_contains( $uri, 'wp-login.php' ) ) {
			return;
		}
		status_header( 503 );
		header( 'Content-Type: text/plain; charset=utf-8' );
		echo 'ESITEF: sitio en mantenimiento durante migración. Intenta de nuevo en unos minutos.';
		exit;
	},
	0
);

add_filter(
	'woocommerce_cart_ready_to_calc_shipping',
	function ( $ready ) {
		return false;
	}
);

add_filter(
	'woocommerce_add_to_cart_validation',
	function () {
		wc_add_notice( __( 'Compras temporalmente desactivadas durante la migración.', 'esitef-minimal' ), 'error' );
		return false;
	},
	99
);
