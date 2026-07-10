<?php
/**
 * Cart page — Stripe-style Polar layout (parity with checkout).
 *
 * @package esitef-minimal
 * @version 10.1.0
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
$plan_config     = array();
$current_plan    = '';
$instance_slug   = '';
$plan_note       = '';

$first_product = null;
foreach ( WC()->cart->get_cart() as $cart_item ) {
	$first_product = $cart_item['data'] ?? null;
	break;
}

if ( $is_presencial ) {
	$instance_slug = (string) $presencial_line['esitef_presencial_instance'];
	$current_plan  = (string) ( $presencial_line['esitef_payment_plan'] ?? '' );
	$plan_config   = esitef_get_presencial_checkout_config( $instance_slug );
	if ( $current_plan && ! empty( $plan_config['plans'][ $current_plan ]['period'] ) ) {
		$plan_note = (string) $plan_config['plans'][ $current_plan ]['period'];
	}
}

$product_badge = $is_presencial
	? __( 'Presencial', 'esitef-minimal' )
	: __( 'Acceso de por vida', 'esitef-minimal' );

$total_label = $is_presencial
	? __( 'Total hoy', 'esitef-minimal' )
	: __( 'Total', 'esitef-minimal' );

$tax_total = WC()->cart->get_total_tax();

$cart_layout_class = 'polar polar--split polar--cart';
if ( $is_presencial ) {
	$cart_layout_class .= ' polar--cart-presencial';
}
?>

<div class="esitef-checkout esitef-checkout--cart esitef-checkout--stripe">
	<form class="woocommerce-cart-form polar-cart-form" action="<?php echo esc_url( wc_get_cart_url() ); ?>" method="post">
		<?php do_action( 'woocommerce_before_cart_table' ); ?>

		<div class="<?php echo esc_attr( $cart_layout_class ); ?>">

			<div class="cart-col cart-col--left">
				<div class="cart-block cart-block--brand">
					<div class="polar-brand">
						<a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="polar-brand__link">
							<img class="polar-brand__logo" src="<?php echo esc_url( $logo_url ); ?>" alt="" width="32" height="32">
							<span class="polar-brand__name">ESITEF</span>
						</a>
					</div>
				</div>

				<div class="cart-block cart-block--product">
					<?php if ( $first_product ) : ?>
						<div class="polar-product">
							<div class="polar-product__media">
								<?php echo $first_product->get_image( 'thumbnail', array( 'class' => 'polar-product__thumb' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
							</div>
							<div class="polar-product__info">
								<span class="polar-product__badge"><?php echo esc_html( $product_badge ); ?></span>
								<span class="polar-product__name"><?php echo esc_html( $first_product->get_name() ); ?></span>
							</div>
						</div>
					<?php endif; ?>
				</div>

				<div class="cart-block cart-block--summary" id="cartSummary" aria-live="polite">
					<p class="polar-price polar-price--cart"><?php echo wp_kses_post( WC()->cart->get_total() ); ?></p>

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
						<?php foreach ( WC()->cart->get_coupons() as $code => $coupon ) : ?>
							<div class="polar-line polar-line--discount">
								<span><?php wc_cart_totals_coupon_label( $coupon ); ?></span>
								<span class="polar-line__val"><?php wc_cart_totals_coupon_html( $coupon ); ?></span>
							</div>
						<?php endforeach; ?>
						<div class="polar-line polar-line--total">
							<span><?php echo esc_html( $total_label ); ?></span>
							<span class="cart-total-value"><?php echo wp_kses_post( WC()->cart->get_total() ); ?></span>
						</div>
					</div>

					<?php if ( $plan_note ) : ?>
						<p class="polar-note polar-note--plan"><?php echo esc_html( $plan_note ); ?></p>
					<?php endif; ?>
				</div>

				<div class="cart-block cart-block--extra">
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
						<?php esc_html_e( 'Por la naturaleza digital de nuestros contenidos formativos, las compras no son reembolsables salvo error técnico comprobado.', 'esitef-minimal' ); ?>
					</p>
				</div>
			</div>

			<div class="cart-col cart-col--right">
				<div class="cart-block cart-block--heading">
					<h1 class="cart-title"><?php esc_html_e( 'Tu carrito', 'esitef-minimal' ); ?></h1>
					<p class="cart-subtitle"><?php esc_html_e( 'Revisa tu pedido y continúa al pago seguro.', 'esitef-minimal' ); ?></p>
				</div>

				<?php if ( $is_presencial && ! empty( $plan_config['plans'] ) ) : ?>
					<div class="cart-block cart-block--plans">
						<div class="checkout-plan-block checkout-plan-block--cart">
							<?php
							get_template_part(
								'template-parts/checkout/presencial-plan-selector',
								null,
								array(
									'instance'     => $instance_slug,
									'current_plan' => $current_plan,
									'config'       => $plan_config,
									'title'        => __( 'Forma de pago', 'esitef-minimal' ),
								)
							);
							?>
						</div>
					</div>
				<?php endif; ?>

				<div class="cart-block cart-block--actions">
					<div class="cart-actions">
						<?php do_action( 'woocommerce_cart_actions' ); ?>
						<?php wp_nonce_field( 'woocommerce-cart', 'woocommerce-cart-nonce' ); ?>
						<a href="<?php echo esc_url( wc_get_checkout_url() ); ?>" class="cart-continue-btn cart-continue-btn--primary">
							<?php esc_html_e( 'Continuar al pago', 'esitef-minimal' ); ?>
						</a>
						<a href="<?php echo esc_url( home_url( '/courses/' ) ); ?>" class="cart-back">
							<?php esc_html_e( 'Seguir explorando', 'esitef-minimal' ); ?>
						</a>
					</div>
				</div>
			</div>
		</div>

		<?php do_action( 'woocommerce_after_cart_table' ); ?>
	</form>
</div>

<?php do_action( 'woocommerce_after_cart' ); ?>
