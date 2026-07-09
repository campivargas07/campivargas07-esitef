<?php
/**
 * Cart page — Polar layout (parity with preview-checkout.html).
 *
 * @package esitef-minimal
 * @version 9.0.0
 */

defined( 'ABSPATH' ) || exit;

if ( WC()->cart->is_empty() ) {
	wc_get_template( 'cart/cart-empty.php' );
	return;
}

do_action( 'woocommerce_before_cart' );

$logo_url = 'https://esitef.com/online/wp-content/uploads/2026/05/Esitef_logo_icon_preloadeer.png';
if ( function_exists( 'has_custom_logo' ) && has_custom_logo() ) {
	$logo_id = (int) get_theme_mod( 'custom_logo' );
	if ( $logo_id ) {
		$src = wp_get_attachment_image_url( $logo_id, 'full' );
		if ( $src ) {
			$logo_url = $src;
		}
	}
}

$presencial_line = esitef_cart_get_presencial_line();
$is_presencial   = (bool) $presencial_line;
$layout_class    = $is_presencial ? 'cart-layout cart-layout--presencial' : 'cart-layout';

$first_product = null;
foreach ( WC()->cart->get_cart() as $cart_item ) {
	$first_product = $cart_item['data'] ?? null;
	break;
}
?>

<div class="esitef-checkout esitef-checkout--cart">
	<form class="woocommerce-cart-form" action="<?php echo esc_url( wc_get_cart_url() ); ?>" method="post">
		<?php do_action( 'woocommerce_before_cart_table' ); ?>

		<div class="<?php echo esc_attr( $layout_class ); ?>">
			<?php if ( $is_presencial ) : ?>
				<?php
				$instance_slug = (string) $presencial_line['esitef_presencial_instance'];
				$current_plan  = (string) ( $presencial_line['esitef_payment_plan'] ?? '' );
				$config        = esitef_get_presencial_checkout_config( $instance_slug );
				?>
				<div class="cart-col cart-col--plans">
					<?php
					if ( $config && ! empty( $config['plans'] ) ) {
						get_template_part(
							'template-parts/checkout/presencial-plan-selector',
							null,
							array(
								'instance'     => $instance_slug,
								'current_plan' => $current_plan,
								'config'       => $config,
							)
						);
					}
					?>
				</div>
			<?php endif; ?>

			<div class="cart-col cart-col--summary">
				<div class="polar-brand">
					<a href="<?php echo esc_url( home_url( '/' ) ); ?>">
						<img class="polar-brand__logo" src="<?php echo esc_url( $logo_url ); ?>" alt="ESITEF" width="28" height="28">
					</a>
				</div>

				<h1 class="cart-title"><?php esc_html_e( 'Tu carrito', 'esitef-minimal' ); ?></h1>

				<?php if ( $first_product ) : ?>
					<div class="polar-product">
						<?php echo $first_product->get_image( 'thumbnail', array( 'class' => 'polar-product__thumb' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
						<span class="polar-product__name"><?php echo esc_html( $first_product->get_name() ); ?></span>
					</div>
				<?php endif; ?>

				<p class="polar-price"><?php echo wp_kses_post( WC()->cart->get_total() ); ?></p>

				<div class="polar-lines">
					<div class="polar-line">
						<span><?php esc_html_e( 'Subtotal', 'esitef-minimal' ); ?></span>
						<span><?php echo wp_kses_post( WC()->cart->get_cart_subtotal() ); ?></span>
					</div>
					<?php foreach ( WC()->cart->get_coupons() as $code => $coupon ) : ?>
						<div class="polar-line polar-line--discount">
							<span><?php wc_cart_totals_coupon_label( $coupon ); ?></span>
							<span class="polar-line__val"><?php wc_cart_totals_coupon_html( $coupon ); ?></span>
						</div>
					<?php endforeach; ?>
					<div class="polar-line polar-line--total">
						<span><?php esc_html_e( 'Total hoy', 'esitef-minimal' ); ?></span>
						<span><?php echo wp_kses_post( WC()->cart->get_total() ); ?></span>
					</div>
				</div>

				<?php if ( $is_presencial && ! empty( $presencial_line['esitef_payment_plan'] ) ) : ?>
					<?php
					$cfg  = esitef_get_presencial_checkout_config( (string) $presencial_line['esitef_presencial_instance'] );
					$pkey = (string) $presencial_line['esitef_payment_plan'];
					$note = $cfg['plans'][ $pkey ]['period'] ?? '';
					?>
					<?php if ( $note ) : ?>
						<p class="polar-note"><?php echo esc_html( $note ); ?></p>
					<?php endif; ?>
				<?php endif; ?>

				<div class="cart-actions">
					<?php do_action( 'woocommerce_cart_actions' ); ?>
					<?php wp_nonce_field( 'woocommerce-cart', 'woocommerce-cart-nonce' ); ?>
					<a href="<?php echo esc_url( wc_get_checkout_url() ); ?>" class="cart-continue-btn">
						<?php esc_html_e( 'Ir al checkout', 'esitef-minimal' ); ?>
					</a>
					<a href="<?php echo esc_url( home_url( '/courses/' ) ); ?>" class="cart-back">
						<?php esc_html_e( 'Seguir explorando', 'esitef-minimal' ); ?>
					</a>
				</div>
			</div>
		</div>

		<?php do_action( 'woocommerce_after_cart_table' ); ?>
	</form>

	<div class="checkout-summary-bar">
		<div class="checkout-summary-bar__inner">
			<div class="checkout-summary-bar__total">
				<span><?php esc_html_e( 'Total hoy', 'esitef-minimal' ); ?></span>
				<strong><?php echo wp_kses_post( WC()->cart->get_total() ); ?></strong>
			</div>
			<a href="<?php echo esc_url( wc_get_checkout_url() ); ?>" class="cart-continue-btn">
				<?php esc_html_e( 'Continuar', 'esitef-minimal' ); ?>
			</a>
		</div>
	</div>
</div>

<?php do_action( 'woocommerce_after_cart' ); ?>
