<?php
/**
 * Empty cart — Polar.
 *
 * @package esitef-minimal
 * @version 9.0.0
 */

defined( 'ABSPATH' ) || exit;

$logo_url = 'https://esitef.com/online/wp-content/uploads/2026/05/Esitef_logo_icon_preloadeer.png';
?>

<div class="esitef-checkout esitef-checkout--empty">
	<div class="polar-brand" style="justify-content:center;margin-bottom:32px">
		<a href="<?php echo esc_url( home_url( '/' ) ); ?>">
			<img class="polar-brand__logo" src="<?php echo esc_url( $logo_url ); ?>" alt="ESITEF" width="28" height="28">
		</a>
	</div>
	<div style="font-size:40px;margin-bottom:16px;opacity:0.3" aria-hidden="true">🛒</div>
	<h1 class="checkout-empty__title"><?php esc_html_e( 'Tu carrito está vacío', 'esitef-minimal' ); ?></h1>
	<p class="checkout-empty__text"><?php esc_html_e( 'Explora nuestras formaciones online y presenciales.', 'esitef-minimal' ); ?></p>
	<a class="success-cta" href="<?php echo esc_url( home_url( '/courses/' ) ); ?>" style="max-width:280px;margin:0 auto">
		<?php esc_html_e( 'Explorar formaciones', 'esitef-minimal' ); ?>
	</a>
</div>
