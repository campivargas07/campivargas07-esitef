<?php
/**
 * Template Name: Curso Presencial
 * Template Post Type: page
 *
 * @package esitef-minimal
 */

$queried   = get_queried_object();
$formacion = ( $queried instanceof WP_Post ) ? esitef_get_presencial_by_slug( $queried->post_name ) : null;

if ( ! $formacion ) {
	wp_safe_redirect( home_url( '/' ) );
	exit;
}

get_header();
?>
<main id="main" class="site-wrapper presencial-page">
<?php
get_template_part(
	'template-parts/pages/presencial',
	'content',
	array(
		'formacion' => $formacion,
	)
);
?>
</main>
<?php
get_footer();
