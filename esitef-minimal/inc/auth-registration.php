<?php
/**
 * Registro de clientes en /ingresar/#registro (evita /register/ de plugins legacy).
 *
 * El formulario hace POST a /ingresar/. También acepta POST legacy a
 * wp-login.php?action=register (caché antigua) para no devolver un formulario vacío.
 *
 * @package esitef-minimal
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * URL del panel de registro en la página de auth del tema.
 *
 * Sin redirect_to por defecto: evita /ingresar/?redirect_to=…#registro vacío
 * cuando solo se redirige desde /register/ o wp-login.
 */
function esitef_get_register_url( $redirect = '' ) {
	$login = esitef_get_login_url();
	if ( $redirect && esitef_get_dashboard_url() !== $redirect ) {
		$login = add_query_arg( 'redirect_to', rawurlencode( $redirect ), $login );
	}
	return $login . '#registro';
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
 * Evitar caché en la página de login/registro.
 */
function esitef_auth_nocache_headers() {
	if ( is_page( 'ingresar' ) || is_page_template( 'page-templates/page-login.php' ) ) {
		nocache_headers();
	}
}
add_action( 'template_redirect', 'esitef_auth_nocache_headers', 0 );

/**
 * ¿La petición actual es la página legacy /register/?
 */
function esitef_is_legacy_register_request() {
	if ( function_exists( 'is_page' ) && is_page( 'register' ) ) {
		return true;
	}

	$request_path = wp_parse_url( $_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH );
	if ( ! is_string( $request_path ) || '' === $request_path ) {
		return false;
	}

	$request_path = untrailingslashit( strtolower( $request_path ) );
	$home_path    = untrailingslashit( strtolower( (string) wp_parse_url( home_url( '/' ), PHP_URL_PATH ) ) );
	$legacy_path  = untrailingslashit( $home_path . '/register' );

	return $request_path === $legacy_path || str_ends_with( $request_path, '/register' );
}

/**
 * Redirigir la página legacy /register/ al formulario del tema.
 */
function esitef_redirect_legacy_register_page() {
	if ( is_admin() || wp_doing_ajax() ) {
		return;
	}

	if ( ! esitef_is_legacy_register_request() ) {
		return;
	}

	if ( 'POST' === ( $_SERVER['REQUEST_METHOD'] ?? '' ) && esitef_request_has_register_fields() ) {
		esitef_handle_register( isset( $_POST['esitef_register_nonce'] ) );
		return;
	}

	wp_safe_redirect( esitef_get_register_url( esitef_get_auth_redirect_url() ) );
	exit;
}
add_action( 'template_redirect', 'esitef_redirect_legacy_register_page', 1 );

/**
 * ¿Hay campos de registro en el POST?
 */
function esitef_request_has_register_fields() {
	return ! empty( $_POST['user_login'] ) || ! empty( $_POST['user_email'] ) || ! empty( $_POST['user_pass'] );
}

/**
 * wp-login.php?action=register.
 * GET → formulario del tema.
 * POST (nuevo o caché antigua) → crear cuenta.
 */
function esitef_redirect_wp_login_register() {
	if ( 'register' !== ( $_REQUEST['action'] ?? '' ) ) {
		return;
	}

	if ( 'POST' === ( $_SERVER['REQUEST_METHOD'] ?? '' ) && esitef_request_has_register_fields() ) {
		esitef_handle_register( isset( $_POST['esitef_register_nonce'] ) );
		return;
	}

	wp_safe_redirect( esitef_get_register_url( esitef_get_auth_redirect_url() ) );
	exit;
}
add_action( 'login_init', 'esitef_redirect_wp_login_register', 1 );

/**
 * Procesar registro en init (no depende de is_page / caché de plantilla).
 */
function esitef_maybe_handle_register_request() {
	if ( wp_doing_ajax() ) {
		return;
	}

	if ( 'POST' !== ( $_SERVER['REQUEST_METHOD'] ?? '' ) ) {
		return;
	}

	$is_our_action = ( $_POST['action'] ?? '' ) === 'esitef_register';
	$has_nonce     = isset( $_POST['esitef_register_nonce'] );

	if ( ! $is_our_action && ! $has_nonce ) {
		return;
	}

	// admin-post.php tiene sus propios hooks; evitar doble proceso ahí.
	$request_uri = $_SERVER['REQUEST_URI'] ?? '';
	if ( is_admin() && false !== strpos( $request_uri, 'admin-post.php' ) ) {
		return;
	}

	esitef_handle_register( true );
}
add_action( 'init', 'esitef_maybe_handle_register_request', 1 );

/**
 * Valores del formulario para rellenar tras un error.
 *
 * @return array<string, string>
 */
function esitef_get_register_form_values() {
	$keys   = array( 'first_name', 'last_name', 'user_login', 'user_email' );
	$values = array();

	foreach ( $keys as $key ) {
		$param = 'reg_' . $key;
		if ( isset( $_GET[ $param ] ) ) {
			$values[ $key ] = sanitize_text_field( wp_unslash( $_GET[ $param ] ) );
		}
	}

	return $values;
}

/**
 * URL de vuelta al formulario con error de registro.
 *
 * @param string               $code     Código de error.
 * @param string               $redirect Destino tras login.
 * @param array<string,string> $fields   Campos a preservar (sin contraseña).
 */
function esitef_register_error_url( $code, $redirect = '', $fields = array() ) {
	$url = add_query_arg( 'reg_error', sanitize_key( $code ), esitef_get_login_url() );
	if ( $redirect ) {
		$url = add_query_arg( 'redirect_to', rawurlencode( $redirect ), $url );
	}

	foreach ( array( 'first_name', 'last_name', 'user_login', 'user_email' ) as $key ) {
		if ( ! empty( $fields[ $key ] ) ) {
			$url = add_query_arg( 'reg_' . $key, rawurlencode( $fields[ $key ] ), $url );
		}
	}

	return $url . '#registro';
}

/**
 * Comprobar origen del POST cuando no hay nonce (formulario en caché).
 */
function esitef_register_referer_is_trusted() {
	$referer = wp_get_referer();
	if ( ! $referer ) {
		$referer = isset( $_SERVER['HTTP_REFERER'] ) ? esc_url_raw( wp_unslash( $_SERVER['HTTP_REFERER'] ) ) : '';
	}
	if ( ! $referer ) {
		return false;
	}

	$home_host = wp_parse_url( home_url(), PHP_URL_HOST );
	$ref_host  = wp_parse_url( $referer, PHP_URL_HOST );

	return $home_host && $ref_host && strtolower( $home_host ) === strtolower( $ref_host );
}

/**
 * Crear cuenta desde /ingresar/ (sin pasar por /register/ ni admin-post.php).
 *
 * @param bool $require_nonce Exigir nonce del tema (false = POST legacy con referer).
 */
function esitef_handle_register( $require_nonce = true ) {
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

	$preserve = array(
		'first_name' => $first_name,
		'last_name'  => $last_name,
		'user_login' => $user_login,
		'user_email' => $user_email,
	);

	if ( $require_nonce ) {
		if ( ! isset( $_POST['esitef_register_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['esitef_register_nonce'] ) ), 'esitef_register' ) ) {
			wp_safe_redirect( esitef_register_error_url( 'invalid_nonce', $redirect, $preserve ) );
			exit;
		}
	} elseif ( ! esitef_register_referer_is_trusted() ) {
		wp_safe_redirect( esitef_register_error_url( 'invalid_nonce', $redirect, $preserve ) );
		exit;
	}

	if ( ! $user_login || ! $user_email || ! $user_pass ) {
		wp_safe_redirect( esitef_register_error_url( 'missing_fields', $redirect, $preserve ) );
		exit;
	}

	if ( ! is_email( $user_email ) ) {
		wp_safe_redirect( esitef_register_error_url( 'invalid_email', $redirect, $preserve ) );
		exit;
	}

	if ( strlen( $user_pass ) <= 8 || ! preg_match( '/[^A-Za-z0-9]/', $user_pass ) ) {
		wp_safe_redirect( esitef_register_error_url( 'weak_password', $redirect, $preserve ) );
		exit;
	}

	if ( username_exists( $user_login ) ) {
		wp_safe_redirect( esitef_register_error_url( 'username_exists', $redirect, $preserve ) );
		exit;
	}

	if ( email_exists( $user_email ) ) {
		wp_safe_redirect( esitef_register_error_url( 'email_exists', $redirect, $preserve ) );
		exit;
	}

	$user_id = wp_create_user( $user_login, $user_pass, $user_email );
	if ( is_wp_error( $user_id ) ) {
		wp_safe_redirect( esitef_register_error_url( 'failed', $redirect, $preserve ) );
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

	nocache_headers();
	wp_safe_redirect( $redirect );
	exit;
}
// Compatibilidad si algún formulario antiguo aún apunta a admin-post.php.
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
