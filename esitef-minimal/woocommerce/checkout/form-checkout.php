<?php
/**
 * Checkout form — Stripe-style Polar layout.
 *
 * @package esitef-minimal
 * @version 10.0.0
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

$cart_product        = null;
$is_presencial       = false;
$plan_name           = '';
$plan_note           = '';
$presencial_instance = '';
$plan_config         = array();
$plan_key            = '';

foreach ( WC()->cart->get_cart() as $cart_item ) {
	$cart_product = $cart_item['data'] ?? null;
	if ( ! empty( $cart_item['esitef_payment_plan'] ) && ! empty( $cart_item['esitef_presencial_instance'] ) ) {
		$is_presencial       = true;
		$presencial_instance = (string) $cart_item['esitef_presencial_instance'];
		$plan_config         = esitef_get_presencial_checkout_config( $presencial_instance );
		$plan_key            = (string) $cart_item['esitef_payment_plan'];
		$plan_name           = $plan_config['plans'][ $plan_key ]['name'] ?? $plan_key;
		$plan_note           = $plan_config['plans'][ $plan_key ]['period'] ?? '';
	}
	break;
}

$product_badge = $is_presencial
	? __( 'Presencial', 'esitef-minimal' )
	: __( 'Acceso de por vida', 'esitef-minimal' );

$tax_total = WC()->cart->get_total_tax();
?>

<div class="esitef-checkout esitef-checkout--form esitef-checkout--stripe">
	<div class="polar-loading-overlay" id="polarLoadingOverlay" aria-live="polite" hidden>
		<div class="polar-spinner" aria-hidden="true"></div>
		<span class="polar-loading-overlay__text"><?php esc_html_e( 'Procesando pago…', 'esitef-minimal' ); ?></span>
	</div>

	<form name="checkout" method="post" class="checkout woocommerce-checkout polar-checkout" action="<?php echo esc_url( wc_get_checkout_url() ); ?>" enctype="multipart/form-data" aria-label="<?php echo esc_attr__( 'Checkout', 'woocommerce' ); ?>">

		<?php if ( $checkout->get_checkout_fields() ) : ?>
			<div class="polar polar--split">

				<!-- LEFT: Order summary -->
				<aside class="polar-order" aria-label="<?php esc_attr_e( 'Resumen del pedido', 'esitef-minimal' ); ?>">
					<div class="polar-order__inner">
						<div class="polar-order__main">
							<div class="polar-brand">
								<a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="polar-brand__link">
									<img class="polar-brand__logo" src="<?php echo esc_url( $logo_url ); ?>" alt="" width="28" height="28">
									<span class="polar-brand__name">ESITEF</span>
								</a>
							</div>

							<?php if ( $cart_product ) : ?>
								<div class="polar-product">
									<div class="polar-product__media">
										<?php echo $cart_product->get_image( 'thumbnail', array( 'class' => 'polar-product__thumb' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
									</div>
									<div class="polar-product__info">
										<span class="polar-product__badge"><?php echo esc_html( $product_badge ); ?></span>
										<span class="polar-product__name"><?php echo esc_html( $cart_product->get_name() ); ?></span>
									</div>
								</div>
							<?php endif; ?>

							<p class="polar-price" aria-live="polite"><?php echo wp_kses_post( WC()->cart->get_total() ); ?></p>

							<div class="polar-lines">
								<div class="polar-line">
									<span><?php esc_html_e( 'Subtotal', 'esitef-minimal' ); ?></span>
									<span><?php echo wp_kses_post( WC()->cart->get_cart_subtotal() ); ?></span>
								</div>
								<?php if ( wc_tax_enabled() ) : ?>
									<div class="polar-line polar-line--muted">
										<span><?php esc_html_e( 'Impuestos', 'esitef-minimal' ); ?></span>
										<span><?php echo wp_kses_post( $tax_total > 0 ? wc_price( $tax_total ) : wc_price( 0 ) ); ?></span>
									</div>
								<?php endif; ?>
								<div class="polar-line polar-line--total">
									<span><?php esc_html_e( 'Total', 'esitef-minimal' ); ?></span>
									<span><?php echo wp_kses_post( WC()->cart->get_total() ); ?></span>
								</div>
							</div>

							<div class="polar-discount-row">
								<button type="button" class="polar-discount-btn" id="polarCouponToggle" aria-expanded="false" aria-controls="polarCouponForm">
									<?php esc_html_e( 'Añadir código de descuento', 'esitef-minimal' ); ?>
								</button>
							</div>
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
								<p class="polar-features-label"><?php esc_html_e( 'Qué incluye', 'esitef-minimal' ); ?></p>
								<ul class="polar-features">
									<li><?php esc_html_e( 'Formación presencial con docentes ESITEF', 'esitef-minimal' ); ?></li>
									<li><?php esc_html_e( 'Material didáctico incluido', 'esitef-minimal' ); ?></li>
									<li><?php esc_html_e( 'Certificado ESITEF', 'esitef-minimal' ); ?></li>
									<li><?php esc_html_e( 'Acceso a comunidad de alumnos', 'esitef-minimal' ); ?></li>
								</ul>
							<?php else : ?>
								<div class="polar-pitch">
									<p class="polar-pitch__title"><?php esc_html_e( 'Compra una vez, aprende para siempre.', 'esitef-minimal' ); ?></p>
									<p class="polar-pitch__text"><?php esc_html_e( 'Pago único para acceso completo al programa, sin mensualidades ni límites de tiempo.', 'esitef-minimal' ); ?></p>
								</div>
								<p class="polar-features-label"><?php esc_html_e( 'Qué obtienes', 'esitef-minimal' ); ?></p>
								<ul class="polar-features">
									<li><?php esc_html_e( 'Acceso de por vida al contenido', 'esitef-minimal' ); ?></li>
									<li><?php esc_html_e( 'Aprendizaje a tu propio ritmo', 'esitef-minimal' ); ?></li>
									<li><?php esc_html_e( 'Certificado de finalización', 'esitef-minimal' ); ?></li>
									<li><?php esc_html_e( 'Soporte de la comunidad ESITEF', 'esitef-minimal' ); ?></li>
								</ul>
							<?php endif; ?>

							<a class="polar-catalog-link" href="<?php echo esc_url( home_url( '/courses/' ) ); ?>">
								<?php esc_html_e( 'Ver todas las formaciones en esitef.com', 'esitef-minimal' ); ?>
							</a>

							<p class="polar-refund">
								<strong><?php esc_html_e( 'Política de reembolso:', 'esitef-minimal' ); ?></strong>
								<?php esc_html_e( 'Por la naturaleza digital de nuestros contenidos formativos, las compras no son reembolsables salvo error técnico comprobado. Consulta los términos completos antes de pagar.', 'esitef-minimal' ); ?>
							</p>
						</div>
					</div>
				</aside>

				<!-- RIGHT: Payment form -->
				<section class="polar-payment" aria-label="<?php esc_attr_e( 'Pago', 'esitef-minimal' ); ?>">
					<div class="polar-payment__inner">
						<div class="polar-alert" id="polarErrorBanner" role="alert">
							<?php esc_html_e( 'No pudimos procesar tu pago. Revisa los datos o prueba otro método.', 'esitef-minimal' ); ?>
						</div>

						<?php if ( $is_presencial && ! empty( $plan_config['plans'] ) ) : ?>
							<div class="checkout-plan-block checkout-plan-block--checkout">
								<?php
								get_template_part(
									'template-parts/checkout/presencial-plan-selector',
									null,
									array(
										'instance'     => $presencial_instance,
										'current_plan' => $plan_key,
										'config'       => $plan_config,
										'title'        => __( 'Plan de inscripción', 'esitef-minimal' ),
									)
								);
								?>
							</div>
						<?php endif; ?>

						<?php do_action( 'woocommerce_checkout_before_customer_details' ); ?>

						<div id="customer_details" class="checkout-billing-fields polar-billing-wc">
							<?php do_action( 'woocommerce_checkout_billing' ); ?>
						</div>

						<?php do_action( 'woocommerce_checkout_after_customer_details' ); ?>

						<div class="checkout-payment-wrap checkout-payment-native">
							<p class="polar-section-label"><?php esc_html_e( 'Método de pago', 'esitef-minimal' ); ?></p>
							<div class="checkout-method-tabs polar-tabs polar-tabs--stripe" role="radiogroup" aria-label="<?php esc_attr_e( 'Método de pago', 'esitef-minimal' ); ?>"></div>

							<div class="polar-card-panel" id="polarPanelCard">
								<?php get_template_part( 'template-parts/checkout/polar-card-fields' ); ?>
							</div>

							<div class="polar-card-panel" id="polarPanelPaypal" hidden>
								<p class="polar-hint polar-paypal-hint"><?php esc_html_e( 'Serás redirigido a PayPal para completar el pago de forma segura.', 'esitef-minimal' ); ?></p>
							</div>

							<div class="polar-card-panel" id="polarPanelMercadopago" hidden>
								<p class="polar-hint polar-mp-hint"><?php esc_html_e( 'Pago seguro con Mercado Pago. Disponible cuando el país de facturación es Argentina.', 'esitef-minimal' ); ?></p>
							</div>

							<?php do_action( 'woocommerce_checkout_before_order_review_heading' ); ?>
							<div id="order_review" class="woocommerce-checkout-review-order polar-gateway-host">
								<?php do_action( 'woocommerce_checkout_before_order_review' ); ?>
								<?php do_action( 'woocommerce_checkout_order_review' ); ?>
								<?php do_action( 'woocommerce_checkout_after_order_review' ); ?>
							</div>
						</div>
					</div>
				</section>
			</div>
		<?php endif; ?>

	</form>

	<div class="checkout-summary-bar checkout-summary-bar--checkout">
		<div class="checkout-summary-bar__inner">
			<div class="checkout-summary-bar__total">
				<span><?php esc_html_e( 'Total', 'esitef-minimal' ); ?></span>
				<strong><?php echo wp_kses_post( WC()->cart->get_total() ); ?></strong>
			</div>
			<button type="button" class="cart-continue-btn checkout-summary-bar__submit">
				<?php esc_html_e( 'Pagar ahora', 'esitef-minimal' ); ?>
			</button>
		</div>
	</div>
</div>

<?php do_action( 'woocommerce_after_checkout_form', $checkout ); ?>
