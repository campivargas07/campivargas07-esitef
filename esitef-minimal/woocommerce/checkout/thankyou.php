<?php
/**
 * Thank you page — Polar layout (parity with preview-checkout.html).
 *
 * @package esitef-minimal
 * @version 9.0.0
 */

defined( 'ABSPATH' ) || exit;

$first_item    = null;
$product_title = '';
$product_meta  = '';
$product_thumb = '';

if ( $order ) {
	foreach ( $order->get_items() as $item ) {
		$product = $item->get_product();
		if ( ! $product ) {
			continue;
		}
		$first_item    = $item;
		$product_title = $product->get_name();
		$product_thumb = wp_get_attachment_image_url( $product->get_image_id(), 'thumbnail' );
		$instance      = $item->get_meta( '_esitef_presencial_instance' );
		if ( $instance && function_exists( 'esitef_get_presencial_by_slug' ) ) {
			$inst = esitef_get_presencial_by_slug( (string) $instance );
			if ( $inst && ! empty( $inst['fecha'] ) ) {
				$product_meta = $inst['fecha'];
			}
		}
		if ( ! $product_meta ) {
			$product_meta = __( 'Acceso de por vida', 'esitef-minimal' );
		}
		break;
	}
}
?>

<div class="esitef-checkout esitef-checkout--thankyou">
	<div class="success-page">
		<?php if ( $order ) : ?>
			<?php do_action( 'woocommerce_before_thankyou', $order->get_id() ); ?>

			<?php if ( $order->has_status( 'failed' ) ) : ?>
				<div class="success-icon" aria-hidden="true">!</div>
				<h1 class="success-title"><?php esc_html_e( 'No pudimos procesar tu pago', 'esitef-minimal' ); ?></h1>
				<p class="success-sub"><?php esc_html_e( 'Revisa los datos o prueba otro método de pago.', 'esitef-minimal' ); ?></p>
				<a href="<?php echo esc_url( $order->get_checkout_payment_url() ); ?>" class="success-cta">
					<?php esc_html_e( 'Reintentar pago', 'esitef-minimal' ); ?>
				</a>
			<?php else : ?>
				<div class="success-icon" aria-hidden="true">✓</div>
				<h1 class="success-title"><?php esc_html_e( '¡Compra confirmada!', 'esitef-minimal' ); ?></h1>

				<?php
				$presencial_notice = esitef_get_presencial_thankyou_notice( $order );
				$success_sub       = $presencial_notice && ! empty( $presencial_notice['message'] )
					? $presencial_notice['message']
					: __( 'Tu acceso al curso ya está disponible.', 'esitef-minimal' );
				?>
				<p class="success-sub"><?php echo esc_html( $success_sub ); ?></p>
				<p class="success-order">
					<?php
					printf(
						/* translators: 1: order number, 2: billing email */
						esc_html__( 'Pedido #%1$s · Confirmación enviada a %2$s', 'esitef-minimal' ),
						esc_html( $order->get_order_number() ),
						esc_html( $order->get_billing_email() )
					);
					?>
				</p>

				<?php if ( $presencial_notice && ! empty( $presencial_notice['dates'] ) && 'installments' === ( $presencial_notice['type'] ?? '' ) ) : ?>
					<div class="success-installments">
						<h4><?php esc_html_e( 'Calendario de cuotas', 'esitef-minimal' ); ?></h4>
						<?php foreach ( $presencial_notice['dates'] as $row ) : ?>
							<div class="success-inst-row<?php echo ! empty( $row['done'] ) ? ' success-inst-row--paid' : ''; ?>">
								<span><?php echo esc_html( $row['label'] ); ?></span>
								<span><?php echo esc_html( $row['date'] ); ?></span>
							</div>
						<?php endforeach; ?>
					</div>
				<?php endif; ?>

				<?php if ( $first_item && $product_title ) : ?>
					<div class="success-product">
						<?php if ( $product_thumb ) : ?>
							<img src="<?php echo esc_url( $product_thumb ); ?>" alt="" width="44" height="44">
						<?php endif; ?>
						<div>
							<h3><?php echo esc_html( $product_title ); ?></h3>
							<p><?php echo esc_html( $product_meta ); ?></p>
						</div>
					</div>
				<?php endif; ?>

				<?php do_action( 'woocommerce_thankyou_' . $order->get_payment_method(), $order->get_id() ); ?>
				<?php do_action( 'woocommerce_thankyou', $order->get_id() ); ?>
			<?php endif; ?>

		<?php else : ?>
			<div class="success-icon" aria-hidden="true">✓</div>
			<h1 class="success-title"><?php esc_html_e( '¡Gracias!', 'esitef-minimal' ); ?></h1>
			<p class="success-sub"><?php esc_html_e( 'Tu pedido ha sido recibido.', 'esitef-minimal' ); ?></p>
		<?php endif; ?>

		<a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="success-ghost">
			<?php esc_html_e( 'Volver al inicio', 'esitef-minimal' ); ?>
		</a>
	</div>
</div>
