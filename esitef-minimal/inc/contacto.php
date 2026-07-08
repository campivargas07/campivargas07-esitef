<?php
/**
 * Contacto — envío del formulario general.
 *
 * @package esitef-minimal
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * URL de la página de contacto.
 */
function esitef_get_contacto_url() {
	return esitef_get_page_url( 'contacto', '/contacto/' );
}

/**
 * Procesa el envío del formulario de contacto.
 */
function esitef_handle_contacto() {
	$redirect = esitef_get_contacto_url();

	if ( ! isset( $_POST['esitef_contacto_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['esitef_contacto_nonce'] ) ), 'esitef_contacto' ) ) {
		wp_safe_redirect( add_query_arg( 'error', '1', $redirect ) );
		exit;
	}

	$nombre  = isset( $_POST['nombre'] ) ? sanitize_text_field( wp_unslash( $_POST['nombre'] ) ) : '';
	$email   = isset( $_POST['email'] ) ? sanitize_email( wp_unslash( $_POST['email'] ) ) : '';
	$mensaje = isset( $_POST['mensaje'] ) ? sanitize_textarea_field( wp_unslash( $_POST['mensaje'] ) ) : '';

	if ( '' === $nombre || ! is_email( $email ) || '' === $mensaje ) {
		wp_safe_redirect( add_query_arg( 'error', '1', $redirect ) );
		exit;
	}

	$body = sprintf(
		"Nombre: %s\nEmail: %s\n\nMensaje:\n%s\n",
		$nombre,
		$email,
		$mensaje
	);

	wp_mail(
		get_option( 'admin_email' ),
		sprintf( '[ESITEF] Contacto: %s', $nombre ),
		$body,
		array( 'Reply-To: ' . $email )
	);

	wp_safe_redirect( add_query_arg( 'enviado', '1', $redirect ) );
	exit;
}
add_action( 'admin_post_nopriv_esitef_contacto', 'esitef_handle_contacto' );
add_action( 'admin_post_esitef_contacto', 'esitef_handle_contacto' );
