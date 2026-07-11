<?php
/**
 * Plugin Name: ESITEF Auth Bridge
 * Description: Endpoint seguro para verificación de contraseñas durante migración a Next.js.
 * Version: 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action(
	'rest_api_init',
	function () {
		register_rest_route(
			'esitef/v1',
			'/verify-password',
			array(
				'methods'             => 'POST',
				'callback'            => 'esitef_auth_bridge_verify',
				'permission_callback' => '__return_true',
			)
		);
	}
);

/**
 * Verify credentials for progressive migration.
 *
 * @param WP_REST_Request $request Request.
 * @return WP_REST_Response
 */
function esitef_auth_bridge_verify( WP_REST_Request $request ) {
	$secret = getenv( 'ESITEF_AUTH_BRIDGE_SECRET' );
	if ( ! $secret ) {
		$secret = defined( 'ESITEF_AUTH_BRIDGE_SECRET' ) ? ESITEF_AUTH_BRIDGE_SECRET : '';
	}

	$header = $request->get_header( 'x-esitef-auth-secret' );
	if ( ! $secret || ! hash_equals( $secret, (string) $header ) ) {
		return new WP_REST_Response( array( 'valid' => false ), 401 );
	}

	$params   = $request->get_json_params();
	$email    = isset( $params['email'] ) ? sanitize_email( $params['email'] ) : '';
	$password = isset( $params['password'] ) ? (string) $params['password'] : '';

	if ( ! $email || ! $password ) {
		return new WP_REST_Response( array( 'valid' => false ), 400 );
	}

	$user = get_user_by( 'email', $email );
	if ( ! $user ) {
		return new WP_REST_Response( array( 'valid' => false ), 200 );
	}

	$valid = wp_check_password( $password, $user->user_pass, $user->ID );

	return new WP_REST_Response(
		array(
			'valid'   => (bool) $valid,
			'user_id' => (int) $user->ID,
		),
		200
	);
}
