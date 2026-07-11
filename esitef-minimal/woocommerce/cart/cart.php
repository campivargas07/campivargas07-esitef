<?php
/**
 * Cart page — Stripe-style Polar layout (parity with checkout).
 *
 * @package esitef-minimal
 * @version 10.2.0
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

$presencial_line = function_exists( 'esitef_cart_get_presencial_line' ) ? esitef_cart_get_presencial_line() : null;
$presencial_lines = function_exists( 'esitef_cart_get_presencial_lines' ) ? esitef_cart_get_presencial_lines() : array();
$online_lines     = function_exists( 'esitef_cart_get_online_lines' ) ? esitef_cart_get_online_lines() : array();
$is_mixed         = function_exists( 'esitef_cart_is_mixed' ) && esitef_cart_is_mixed();
$is_presencial    = ! empty( $presencial_lines );
$plan_config      = array();
$current_plan     = '';
$instance_slug    = '';
$plan_note        = '';

if ( $presencial_line ) {
	$instance_slug = (string) $presencial_line['esitef_presencial_instance'];
	$current_plan  = (string) ( $presencial_line['esitef_payment_plan'] ?? '' );
	$plan_config   = esitef_get_presencial_checkout_config( $instance_slug );
	if ( $current_plan && ! empty( $plan_config['plans'][ $current_plan ]['period'] ) ) {
		$plan_note = (string) $plan_config['plans'][ $current_plan ]['period'];
	}
}

$cart_items = array();
foreach ( WC()->cart->get_cart() as $cart_key => $cart_item ) {
	$product = $cart_item['data'] ?? null;
	if ( ! $product || ! $product->exists() ) {
		continue;
	}
	$type = function_exists( 'esitef_cart_line_type' ) ? esitef_cart_line_type( $cart_item ) : 'other';
	$cart_items[] = array(
		'key'     => $cart_key,
		'item'    => $cart_item,
		'product' => $product,
		'type'    => $type,
	);
}

$total_label = function_exists( 'esitef_cart_total_label' ) ? esitef_cart_total_label() : __( 'Total', 'esitef-minimal' );
$tax_total   = WC()->cart->get_total_tax();
$pending     = function_exists( 'esitef_get_pending_purchase' ) ? esitef_get_pending_purchase() : null;

$cart_layout_class = 'polar polar--split polar--cart';
if ( $is_presencial ) {
	$cart_layout_class .= ' polar--cart-presencial';
}
if ( $is_mixed ) {
	$cart_layout_class .= ' polar--cart-mixed';
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
					<?php if ( count( $cart_items ) > 1 ) : ?>
						<div class="polar-products polar-products--mixed">
							<?php foreach ( $cart_items as $row ) : ?>
								<?php
								$badge = 'presencial' === $row['type']
									? __( 'Presencial', 'esitef-minimal' )
									: ( 'online' === $row['type'] ? __( 'Online', 'esitef-minimal' ) : '' );
								?>
								<div class="polar-product polar-product--mixed">
									<div class="polar-product__media">
										<?php echo $row['product']->get_image( 'thumbnail', array( 'class' => 'polar-product__thumb' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
									</div>
									<div class="polar-product__info">
										<?php if ( $badge ) : ?>
											<span class="polar-product__badge"><?php echo esc_html( $badge ); ?></span>
										<?php endif; ?>
										<span class="polar-product__name"><?php echo esc_html( $row['product']->get_name() ); ?></span>
										<span class="polar-product__price"><?php echo wp_kses_post( WC()->cart->get_product_price( $row['product'] ) ); ?></span>
										<?php echo wp_kses_post( esitef_cart_item_remove_link( $row['key'], $row['product'] ) ); ?>
									</div>
								</div>
							<?php endforeach; ?>
						</div>
					<?php elseif ( ! empty( $cart_items[0] ) ) : ?>
						<?php
						$row         = $cart_items[0];
						$product_badge = $is_presencial
							? __( 'Presencial', 'esitef-minimal' )
							: __( 'Acceso de por vida', 'esitef-minimal' );
						?>
						<div class="polar-product">
							<div class="polar-product__media">
								<?php echo $row['product']->get_image( 'thumbnail', array( 'class' => 'polar-product__thumb' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
							</div>
							<div class="polar-product__info">
								<span class="polar-product__badge"><?php echo esc_html( $product_badge ); ?></span>
								<span class="polar-product__name"><?php echo esc_html( $row['product']->get_name() ); ?></span>
								<?php echo wp_kses_post( esitef_cart_item_remove_link( $row['key'], $row['product'] ) ); ?>
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

					<?php if ( $is_mixed ) : ?>
						<p class="polar-note polar-note--mixed"><?php esc_html_e( 'Incluye curso online (pago único) e inscripción presencial en un solo checkout.', 'esitef-minimal' ); ?></p>
					<?php endif; ?>
				</div>

				<div class="cart-block cart-block--extra">
					<hr class="polar-divider">

					<?php if ( $is_mixed ) : ?>
						<div class="polar-pitch">
							<p class="polar-pitch__title"><?php esc_html_e( 'Combo online + presencial', 'esitef-minimal' ); ?></p>
							<p class="polar-pitch__text"><?php esc_html_e( 'Acceso digital inmediato más tu plaza en el curso presencial. Un solo pago hoy.', 'esitef-minimal' ); ?></p>
						</div>
					<?php elseif ( $is_presencial ) : ?>
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

				<?php if ( $is_mixed && function_exists( 'esitef_cart_can_checkout_mixed' ) && ! esitef_cart_can_checkout_mixed() ) : ?>
					<div class="cart-pending-banner cart-pending-banner--error">
						<?php echo esc_html( function_exists( 'esitef_cart_mixed_block_reason' ) ? esitef_cart_mixed_block_reason() : '' ); ?>
					</div>
				<?php endif; ?>

				<?php if ( $pending && ! empty( $pending['label'] ) ) : ?>
					<div class="cart-pending-banner">
						<?php
						echo esc_html(
							sprintf(
								/* translators: %s: product name */
								__( 'Tienes guardado: %s', 'esitef-minimal' ),
								(string) $pending['label']
							)
						);
						?>
						<?php if ( is_user_logged_in() ) : ?>
							<a href="<?php echo esc_url( wp_nonce_url( add_query_arg( 'esitef_restore_pending', '1', home_url( '/' ) ), 'esitef_restore_pending' ) ); ?>">
								<?php esc_html_e( 'Añadir al carrito', 'esitef-minimal' ); ?>
							</a>
						<?php endif; ?>
					</div>
				<?php endif; ?>

				<?php if ( $is_presencial && ! empty( $plan_config['plans'] ) && $presencial_line ) : ?>
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
