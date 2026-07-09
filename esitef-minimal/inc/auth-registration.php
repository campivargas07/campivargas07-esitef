<?php
/**
 * Registro de clientes en /ingresar/#registro (evita /register/ de plugins legacy).
 *
 * @package esitef-minimal
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * URL del panel de registro en la página de auth del tema.
 */
function esitef_get_register_url( $redirect = '' ) {
	$url = esitef_get_login_url() . '#registro';
	if ( $redirect ) {
		$url = add_query_arg( 'redirect_to', rawurlencode( $redirect ), esitef_get_login_url() ) . '#registro';
	}
	return $url;
}

/**
 * Enlaces de registro de WordPress → /ingresar/#registro.
 */
function esitef_filter_register_url( $register_url ) {
	unset( $register_url );
	return esitef_get_register_url();
}
add_filter( 'register_url', 'esitef_filter_register_url' );

/**
 * Redirigir la página legacy /register/ al formulario del tema.
 */
function esitef_redirect_legacy_register_page() {
	if ( is_admin() || wp_doing_ajax() ) {
		return;
	}

	if ( is_page( 'register' ) ) {
		wp_safe_redirect( esitef_get_register_url( esitef_get_auth_redirect_url() ) );
		exit;
	}
}
add_action( 'template_redirect', 'esitef_redirect_legacy_register_page', 1 );

/**
 * wp-login.php?action=register (GET) → /ingresar/#registro.
 */
function esitef_redirect_wp_login_register() {
	if ( 'register' !== ( $_REQUEST['action'] ?? '' ) ) {
		return;
	}

	if ( 'POST' === ( $_SERVER['REQUEST_METHOD'] ?? '' ) ) {
		return;
	}

	wp_safe_redirect( esitef_get_register_url( esitef_get_auth_redirect_url() ) );
	exit;
}
add_action( 'login_init', 'esitef_redirect_wp_login_register', 1 );

/**
 * URL de vuelta al formulario con error de registro.
 */
function esitef_register_error_url( $code, $redirect = '' ) {
	$url = add_query_arg( 'reg_error', sanitize_key( $code ), esitef_get_login_url() );
	if ( $redirect ) {
		$url = add_query_arg( 'redirect_to', rawurlencode( $redirect ), $url );
	}
	return $url . '#registro';
}

/**
 * Crear cuenta desde /ingresar/ (admin-post, sin pasar por /register/).
 */
function esitef_handle_register() {
	if ( ! isset( $_POST['esitef_register_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['esitef_register_nonce'] ) ), 'esitef_register' ) ) {
		wp_safe_redirect( esitef_register_error_url( 'invalid_nonce' ) );
		exit;
	}

	$redirect = '';
	if ( ! empty( $_POST['redirect_to'] ) ) {
		$redirect = wp_validate_redirect( wp_unslash( $_POST['redirect_to'] ), esitef_get_dashboard_url() );
	}
	if ( ! $redirect ) {
		$redirect = esitef_get_dashboard_url();
	}

	$user_login = isset( $_POST['user_login'] ) ? sanitize_user( wp_unslash( $_POST['user_login'] ) ) : '';
	$user_email = isset( $_POST['user_email'] ) ? sanitize_email( wp_unslash( $_POST['user_email'] ) ) : '';
	$user_pass  = isset( $_POST['user_pass'] ) ? (string) wp_unslash( $_POST['user_pass'] ) : '';
	$first_name = isset( $_POST['first_name'] ) ? sanitize_text_field( wp_unslash( $_POST['first_name'] ) ) : '';
	$last_name  = isset( $_POST['last_name'] ) ? sanitize_text_field( wp_unslash( $_POST['last_name'] ) ) : '';

	if ( ! $user_login || ! $user_email || ! $user_pass ) {
		wp_safe_redirect( esitef_register_error_url( 'missing_fields', $redirect ) );
		exit;
	}

	if ( ! is_email( $user_email ) ) {
		wp_safe_redirect( esitef_register_error_url( 'invalid_email', $redirect ) );
		exit;
	}

	if ( strlen( $user_pass ) <= 8 || ! preg_match( '/[^A-Za-z0-9]/', $user_pass ) ) {
		wp_safe_redirect( esitef_register_error_url( 'weak_password', $redirect ) );
		exit;
	}

	if ( username_exists( $user_login ) ) {
		wp_safe_redirect( esitef_register_error_url( 'username_exists', $redirect ) );
		exit;
	}

	if ( email_exists( $user_email ) ) {
		wp_safe_redirect( esitef_register_error_url( 'email_exists', $redirect ) );
		exit;
	}

	$user_id = wp_create_user( $user_login, $user_pass, $user_email );
	if ( is_wp_error( $user_id ) ) {
		wp_safe_redirect( esitef_register_error_url( 'failed', $redirect ) );
		exit;
	}

	wp_update_user(
		array(
			'ID'           => $user_id,
			'first_name'   => $first_name,
			'last_name'    => $last_name,
			'display_name' => trim( $first_name . ' ' . $last_name ) ?: $user_login,
		)
	);

	/**
	 * Campo legacy obligatorio en /register/ (Profile Builder u otro plugin).
	 * Valor mínimo para que el perfil no quede incompleto en staging.
	 */
	update_user_meta( $user_id, 'descripcion', __( 'Estudiante ESITEF Online', 'esitef-minimal' ) );

	wp_set_current_user( $user_id );
	wp_set_auth_cookie( $user_id, true );
	do_action( 'wp_login', $user_login, get_userdata( $user_id ) );

	wp_safe_redirect( $redirect );
	exit;
}
add_action( 'admin_post_nopriv_esitef_register', 'esitef_handle_register' );
add_action( 'admin_post_esitef_register', 'esitef_handle_register' );

/**
 * Mensajes de error de registro para la UI.
 */
function esitef_get_register_error_message( $code ) {
	$messages = array(
		'email_exists'    => __( 'Ese email ya está registrado. Inicia sesión o usa otro email.', 'esitef-minimal' ),
		'username_exists' => __( 'Ese nombre de usuario ya existe. Elige otro.', 'esitef-minimal' ),
		'invalid_email'   => __( 'Introduce un email válido.', 'esitef-minimal' ),
		'weak_password'   => __( 'La contraseña debe tener más de 8 caracteres e incluir un carácter especial.', 'esitef-minimal' ),
		'missing_fields'  => __( 'Completa todos los campos obligatorios.', 'esitef-minimal' ),
		'invalid_nonce'   => __( 'La sesión expiró. Vuelve a intentarlo.', 'esitef-minimal' ),
		'failed'          => __( 'No se pudo crear la cuenta. Inténtalo de nuevo.', 'esitef-minimal' ),
	);

	return $messages[ $code ] ?? $messages['failed'];
}
