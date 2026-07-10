<?php
/**
 * Checkout form — Polar layout (parity with preview-checkout.html).
 *
 * @package esitef-minimal
 * @version 9.0.0
 */

defined( 'ABSPATH' ) || exit;

do_action( 'woocommerce_before_checkout_form', $checkout );

if ( ! $checkout->is_registration_enabled() && $checkout->is_registration_required() && ! is_user_logged_in() ) {
	echo esc_html( apply_filters( 'woocommerce_checkout_must_be_logged_in_message', __( 'You must be logged in to checkout.', 'woocommerce' ) ) );
	return;
}

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

$cart_product   = null;
$cart_item_meta = null;
$is_presencial  = false;
$plan_name      = '';
$plan_note      = '';

foreach ( WC()->cart->get_cart() as $cart_item ) {
	$cart_product = $cart_item['data'] ?? null;
	$cart_item_meta = $cart_item;
	if ( ! empty( $cart_item['esitef_payment_plan'] ) && ! empty( $cart_item['esitef_presencial_instance'] ) ) {
		$is_presencial = true;
		$plan_config   = esitef_get_presencial_checkout_config( (string) $cart_item['esitef_presencial_instance'] );
		$plan_key      = (string) $cart_item['esitef_payment_plan'];
		$plan_name     = $plan_config['plans'][ $plan_key ]['name'] ?? $plan_key;
		$plan_note     = $plan_config['plans'][ $plan_key ]['period'] ?? '';
	}
	break;
}
?>

<div class="esitef-checkout esitef-checkout--form">
	<form name="checkout" method="post" class="checkout woocommerce-checkout polar-checkout" action="<?php echo esc_url( wc_get_checkout_url() ); ?>" enctype="multipart/form-data" aria-label="<?php echo esc_attr__( 'Checkout', 'woocommerce' ); ?>">

		<?php if ( $checkout->get_checkout_fields() ) : ?>
			<div class="polar polar--split">

				<div class="polar-order">
					<div class="polar-order__inner">
						<div class="polar-order__main">
							<div class="polar-brand">
								<a href="<?php echo esc_url( home_url( '/' ) ); ?>">
									<img class="polar-brand__logo" src="<?php echo esc_url( $logo_url ); ?>" alt="ESITEF" width="28" height="28">
								</a>
							</div>

							<?php if ( $cart_product ) : ?>
								<div class="polar-product">
									<?php echo $cart_product->get_image( 'thumbnail', array( 'class' => 'polar-product__thumb' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
									<span class="polar-product__name"><?php echo esc_html( $cart_product->get_name() ); ?></span>
								</div>
							<?php endif; ?>

							<p class="polar-price" aria-live="polite"><?php echo wp_kses_post( WC()->cart->get_total() ); ?></p>

							<div class="polar-lines">
								<div class="polar-line">
									<span><?php esc_html_e( 'Subtotal', 'esitef-minimal' ); ?></span>
									<span><?php echo wp_kses_post( WC()->cart->get_cart_subtotal() ); ?></span>
								</div>
								<?php if ( wc_tax_enabled() && WC()->cart->get_total_tax() > 0 ) : ?>
									<div class="polar-line polar-line--muted">
										<span><?php echo esc_html( WC()->countries->tax_or_vat() ); ?></span>
										<span><?php echo wp_kses_post( wc_price( WC()->cart->get_total_tax() ) ); ?></span>
									</div>
								<?php endif; ?>
								<div class="polar-line polar-line--total">
									<span><?php esc_html_e( 'Total hoy', 'esitef-minimal' ); ?></span>
									<span><?php echo wp_kses_post( WC()->cart->get_total() ); ?></span>
								</div>
							</div>

							<button type="button" class="polar-discount-btn" id="polarCouponToggle" aria-expanded="false" aria-controls="polarCouponForm">
								<?php esc_html_e( 'Añadir código de descuento', 'esitef-minimal' ); ?>
							</button>
							<div class="polar-coupon-wrap" id="polarCouponWrap" hidden>
								<form class="polar-coupon-form checkout_coupon woocommerce-form-coupon" method="post" id="polarCouponForm">
									<input type="text" name="coupon_code" class="input-text" placeholder="<?php esc_attr_e( 'Código de descuento', 'esitef-minimal' ); ?>" id="coupon_code" value="" />
									<button type="submit" class="polar-coupon-apply" name="apply_coupon" value="<?php esc_attr_e( 'Aplicar', 'esitef-minimal' ); ?>">
										<?php esc_html_e( 'Aplicar', 'esitef-minimal' ); ?>
									</button>
									<?php wp_nonce_field( 'woocommerce-apply-coupon', 'woocommerce-apply-coupon-nonce' ); ?>
								</form>
							</div>
						</div>

						<div class="polar-order__extra">
							<hr class="polar-divider">

							<?php if ( $is_presencial ) : ?>
								<div class="polar-pitch">
									<p class="polar-pitch__title"><?php esc_html_e( 'Reserva tu plaza en el curso presencial.', 'esitef-minimal' ); ?></p>
									<p class="polar-pitch__text"><?php esc_html_e( 'Formación intensiva con instructores ESITEF. Elige la forma de pago que mejor se adapte a ti.', 'esitef-minimal' ); ?></p>
								</div>
								<ul class="polar-features">
									<li><?php esc_html_e( 'Formación presencial con docentes ESITEF', 'esitef-minimal' ); ?></li>
									<li><?php esc_html_e( 'Material didáctico incluido', 'esitef-minimal' ); ?></li>
									<li><?php esc_html_e( 'Certificado ESITEF', 'esitef-minimal' ); ?></li>
									<li><?php esc_html_e( 'Acceso a comunidad de alumnos', 'esitef-minimal' ); ?></li>
								</ul>
								<?php if ( $plan_name ) : ?>
									<div class="checkout-plan-readonly">
										<p style="font-size:13px;font-weight:500;margin-bottom:8px">
											<?php esc_html_e( 'Plan:', 'esitef-minimal' ); ?>
											<span><?php echo esc_html( $plan_name ); ?></span>
										</p>
										<?php if ( $plan_note ) : ?>
											<p class="polar-note"><?php echo esc_html( $plan_note ); ?></p>
										<?php endif; ?>
										<a class="polar-change-plan" href="<?php echo esc_url( wc_get_cart_url() ); ?>">
											<?php esc_html_e( 'Cambiar plan', 'esitef-minimal' ); ?>
										</a>
									</div>
								<?php endif; ?>
							<?php else : ?>
								<div class="polar-pitch">
									<p class="polar-pitch__title"><?php esc_html_e( 'Compra una vez, aprende para siempre.', 'esitef-minimal' ); ?></p>
									<p class="polar-pitch__text"><?php esc_html_e( 'Pago único para acceso completo al programa, sin mensualidades ni límites de tiempo.', 'esitef-minimal' ); ?></p>
								</div>
								<ul class="polar-features">
									<li><?php esc_html_e( 'Acceso de por vida al contenido', 'esitef-minimal' ); ?></li>
									<li><?php esc_html_e( 'Aprendizaje a tu propio ritmo', 'esitef-minimal' ); ?></li>
									<li><?php esc_html_e( 'Certificado de finalización', 'esitef-minimal' ); ?></li>
									<li><?php esc_html_e( 'Soporte de la comunidad ESITEF', 'esitef-minimal' ); ?></li>
								</ul>
							<?php endif; ?>
						</div>
					</div>
				</div>

				<div class="polar-payment">
					<div class="polar-payment__inner">
						<div class="polar-alert" id="polarErrorBanner" role="alert">
							<?php esc_html_e( 'No pudimos procesar tu pago. Revisa los datos o prueba otro método.', 'esitef-minimal' ); ?>
						</div>

						<?php do_action( 'woocommerce_checkout_before_customer_details' ); ?>

						<div id="customer_details" class="checkout-billing-fields">
							<?php do_action( 'woocommerce_checkout_billing' ); ?>
						</div>

						<?php do_action( 'woocommerce_checkout_after_customer_details' ); ?>

						<div class="checkout-payment-wrap checkout-payment-native">
							<div class="checkout-method-tabs polar-tabs" role="radiogroup" aria-label="<?php esc_attr_e( 'Método de pago', 'esitef-minimal' ); ?>"></div>
							<p class="polar-paypal-hint"><?php esc_html_e( 'Serás redirigido a PayPal para completar el pago de forma segura.', 'esitef-minimal' ); ?></p>
							<p class="polar-mp-hint" hidden><?php esc_html_e( 'Pago seguro con Mercado Pago.', 'esitef-minimal' ); ?></p>

							<?php do_action( 'woocommerce_checkout_before_order_review_heading' ); ?>
							<div id="order_review" class="woocommerce-checkout-review-order">
								<?php do_action( 'woocommerce_checkout_before_order_review' ); ?>
								<?php do_action( 'woocommerce_checkout_order_review' ); ?>
								<?php do_action( 'woocommerce_checkout_after_order_review' ); ?>
							</div>
						</div>

						<p class="polar-legal">
							<?php
							printf(
								/* translators: %1$s: terms open, %2$s: privacy open, %3$s: close */
								esc_html__( 'Al hacer clic en "Pagar ahora", autorizas el cargo del importe indicado y aceptas los %1$stérminos de compra%3$s y la %2$spolítica de privacidad%3$s.', 'esitef-minimal' ),
								'<a href="' . esc_url( home_url( '/terminos/' ) ) . '">',
								'<a href="' . esc_url( home_url( '/privacidad/' ) ) . '">',
								'</a>'
							);
							?>
						</p>
					</div>
				</div>
			</div>
		<?php endif; ?>

	</form>

	<div class="checkout-summary-bar checkout-summary-bar--checkout">
		<div class="checkout-summary-bar__inner">
			<div class="checkout-summary-bar__total">
				<span><?php esc_html_e( 'Total hoy', 'esitef-minimal' ); ?></span>
				<strong><?php echo wp_kses_post( WC()->cart->get_total() ); ?></strong>
			</div>
			<button type="button" class="cart-continue-btn checkout-summary-bar__submit">
				<?php esc_html_e( 'Pagar', 'esitef-minimal' ); ?>
			</button>
		</div>
	</div>
</div>

<?php do_action( 'woocommerce_after_checkout_form', $checkout ); ?>
