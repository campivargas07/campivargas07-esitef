<?php
/**
 * Template Name: País
 * Template Post Type: page
 *
 * @package esitef-minimal
 */

$queried = get_queried_object();
$pais    = ( $queried instanceof WP_Post ) ? esitef_get_pais_by_slug( $queried->post_name ) : null;

if ( ! $pais ) {
	wp_safe_redirect( home_url( '/' ) );
	exit;
}

get_header();
?>
<main id="main" class="site-wrapper pais-page">
<?php
get_template_part(
	'template-parts/pages/pais',
	'content',
	array(
		'pais' => $pais,
	)
);
?>
</main>
<?php
get_footer();
