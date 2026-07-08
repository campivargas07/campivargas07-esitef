<?php
/**
 * Template Name: Formación Online Hub
 * Template Post Type: page
 *
 * @package esitef-minimal
 */

$queried = get_queried_object();
$slug    = ( $queried instanceof WP_Post ) ? $queried->post_name : '';
$hub     = esitef_get_formacion_hub( $slug );

if ( ! $hub ) {
	wp_safe_redirect( home_url( '/' ) );
	exit;
}

$grid_style  = isset( $hub['grid_style'] ) ? (string) $hub['grid_style'] : '';
$theme_slug  = esitef_get_hub_theme_slug( $hub, $slug );
$style_class = ( 'masterclass' === $grid_style ) ? ' formacion-hub-page--masterclass' : '';

get_header();
?>
<main id="main" class="site-wrapper formacion-hub-page formacion-hub-page--<?php echo esc_attr( $theme_slug ); ?> formacion-hub-page--<?php echo esc_attr( $slug ); ?><?php echo esc_attr( $style_class ); ?>">
<?php
get_template_part(
	'template-parts/pages/formacion-hub/content',
	null,
	array(
		'hub'  => $hub,
		'slug' => $slug,
	)
);
?>
</main>
<?php
get_footer();
