<?php
/**
 * Breadcrumb — Formaciones → hub.
 *
 * @package esitef-minimal
 *
 * @var array<string, mixed> $args
 */

$hub = isset( $args['hub'] ) ? $args['hub'] : array();
$title = isset( $hub['title'] ) ? (string) $hub['title'] : '';

$formaciones_url = function_exists( 'esitef_get_formaciones_url' )
	? esitef_get_formaciones_url()
	: home_url( '/formaciones/' );
?>
<nav class="hub-breadcrumb" aria-label="<? esc_attr_e( 'Navegación', 'esitef-minimal' ); ?>">
  <div class="hub-breadcrumb__inner">
    <a href="<?php echo esc_url( $formaciones_url ); ?>"><? esc_html_e( 'Formaciones Online', 'esitef-minimal' ); ?></a>
    <span class="hub-breadcrumb__sep" aria-hidden="true">/</span>
    <span class="hub-breadcrumb__current"><?php echo esc_html( $title ); ?></span>
  </div>
</nav>
