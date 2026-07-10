<?php
/**
 * Empty cart — Stripe-style Polar.
 *
 * @package esitef-minimal
 * @version 10.0.0
 */

defined( 'ABSPATH' ) || exit;

$logo_url = 'https://esitef.com/online/wp-content/uploads/2026/05/Esitef_logo_icon_preloadeer.png';
?>

<div class="esitef-checkout esitef-checkout--empty esitef-checkout--stripe">
	<div class="polar-empty">
		<div class="polar-brand polar-brand--center">
			<a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="polar-brand__link">
				<img class="polar-brand__logo" src="<?php echo esc_url( $logo_url ); ?>" alt="" width="32" height="32">
				<span class="polar-brand__name">ESITEF</span>
			</a>
		</div>
		<div class="empty-page">
			<div class="empty-page__icon" aria-hidden="true">🛒</div>
			<h2 class="checkout-empty__title"><?php esc_html_e( 'Tu carrito está vacío', 'esitef-minimal' ); ?></h2>
			<p class="checkout-empty__text"><?php esc_html_e( 'Explora nuestras formaciones online y presenciales.', 'esitef-minimal' ); ?></p>
			<a class="cart-continue-btn cart-continue-btn--primary cart-continue-btn--empty" href="<?php echo esc_url( home_url( '/courses/' ) ); ?>">
				<?php esc_html_e( 'Explorar formaciones', 'esitef-minimal' ); ?>
			</a>
		</div>
	</div>
</div>
