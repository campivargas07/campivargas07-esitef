<?php
/**
 * Empty cart — Polar (parity with preview-checkout.html).
 *
 * @package esitef-minimal
 * @version 9.0.0
 */

defined( 'ABSPATH' ) || exit;
?>

<div class="esitef-checkout esitef-checkout--empty">
	<div class="empty-page">
		<div class="empty-page__icon" aria-hidden="true">🛒</div>
		<h2 class="checkout-empty__title"><?php esc_html_e( 'Tu carrito está vacío', 'esitef-minimal' ); ?></h2>
		<p class="checkout-empty__text"><?php esc_html_e( 'Explora nuestras formaciones online y presenciales.', 'esitef-minimal' ); ?></p>
		<a class="success-cta" href="<?php echo esc_url( home_url( '/courses/' ) ); ?>" style="max-width:280px;margin:0 auto;display:flex">
			<?php esc_html_e( 'Explorar formaciones', 'esitef-minimal' ); ?>
		</a>
	</div>
</div>
