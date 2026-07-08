<?php
/**
 * Template Name: Contacto
 * Template Post Type: page
 *
 * @package esitef-minimal
 */

$success = isset( $_GET['enviado'] ) && '1' === $_GET['enviado']; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
$error   = isset( $_GET['error'] ) && '1' === $_GET['error']; // phpcs:ignore WordPress.Security.NonceVerification.Recommended

get_header();
?>
<main id="main" class="site-wrapper contacto-page">
<?php
get_template_part(
	'template-parts/pages/contacto',
	'content',
	array(
		'success' => $success,
		'error'   => $error,
	)
);
?>
</main>
<?php
get_footer();
