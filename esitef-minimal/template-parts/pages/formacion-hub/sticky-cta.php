<?php
/**
 * CTA fijo en mobile.
 *
 * @package esitef-minimal
 *
 * @var array<string, mixed> $args
 */

$hub = isset( $args['hub'] ) ? $args['hub'] : array();
$cta = isset( $hub['cta'] ) && is_array( $hub['cta'] ) ? $hub['cta'] : array();

$url   = esitef_get_hub_cta_url( $hub );
$label = isset( $cta['label'] ) ? (string) $cta['label'] : __( 'Comprar', 'esitef-minimal' );

if ( ! $url || '#' === $url ) {
	return;
}
?>
<div class="hub-sticky-cta" aria-hidden="false">
  <a href="<?php echo esc_url( $url ); ?>" class="hub-sticky-cta__btn"><?php echo esc_html( $label ); ?></a>
</div>
