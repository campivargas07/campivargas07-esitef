<?php
/**
 * Tutor LMS → login ESITEF (/ingresar/) en lugar del modal nativo.
 *
 * @package esitef-minimal
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Redirect after login: ?redirect_to= or dashboard.
 */
function esitef_get_auth_redirect_url() {
	if ( ! empty( $_GET['redirect_to'] ) ) {
		$redirect = wp_validate_redirect( wp_unslash( $_GET['redirect_to'] ), false );
		if ( $redirect ) {
			return $redirect;
		}
	}

	return esitef_get_dashboard_url();
}

/**
 * Login URL with optional return path.
 */
function esitef_get_login_url_with_redirect( $redirect = '' ) {
	$url = esitef_get_login_url();
	if ( $redirect ) {
		$url = add_query_arg( 'redirect_to', rawurlencode( $redirect ), $url );
	}
	return $url;
}

/**
 * Disable Tutor native login modal (defaults to on when option missing).
 */
function esitef_tutor_disable_native_login() {
	if ( ! function_exists( 'tutor_utils' ) ) {
		return;
	}

	$options = get_option( 'tutor_option', array() );
	if ( ! is_array( $options ) ) {
		$options = array();
	}

	if ( ! array_key_exists( 'enable_tutor_native_login', $options ) || $options['enable_tutor_native_login'] ) {
		$options['enable_tutor_native_login'] = false;
		update_option( 'tutor_option', $options );
	}
}
add_action( 'init', 'esitef_tutor_disable_native_login', 5 );

/**
 * WordPress login links → /ingresar/.
 */
function esitef_filter_login_url( $login_url, $redirect = '', $force_reauth = false ) {
	unset( $force_reauth );
	return esitef_get_login_url_with_redirect( $redirect );
}
add_filter( 'login_url', 'esitef_filter_login_url', 10, 3 );

/**
 * Guest enroll / add-to-cart → custom login redirect class (handled in JS).
 */
function esitef_tutor_custom_login_redirect_class( $class_name ) {
	if ( is_user_logged_in() ) {
		return '';
	}

	return 'esitef-tutor-login-redirect';
}
add_filter( 'tutor_enroll_required_login_class', 'esitef_tutor_custom_login_redirect_class', 20 );
add_filter( 'tutor_popup_login_class', 'esitef_tutor_custom_login_redirect_class', 20 );
add_filter( 'tutor_native_add_to_cart_btn_class', 'esitef_tutor_custom_login_redirect_class', 20 );

/**
 * Pass login URL to login-transition.js (also handles Tutor buttons).
 */
function esitef_tutor_login_script_data() {
	wp_localize_script(
		'esitef-login-transition',
		'esitefAuth',
		array(
			'loginUrl' => esitef_get_login_url(),
		)
	);
}
add_action( 'wp_enqueue_scripts', 'esitef_tutor_login_script_data', 20 );

/**
 * Hide Tutor login modal fallback (JS should redirect before it opens).
 */
function esitef_tutor_hide_login_modal_css() {
	if ( ! function_exists( 'tutor' ) ) {
		return;
	}
	echo '<style>.tutor-login-modal{display:none!important}</style>';
}
add_action( 'wp_head', 'esitef_tutor_hide_login_modal_css', 100 );
