<?php
/**
 * Thank you page — ESITEF branded.
 *
 * @package esitef-minimal
 * @version 8.0.0
 */

defined( 'ABSPATH' ) || exit;
?>

<div class="esitef-checkout esitef-checkout--thankyou">
	<?php esitef_checkout_render_breadcrumb(); ?>

	<div class="checkout-thankyou esitef-module-shell">
		<div class="esitef-module-card checkout-thankyou__card">
			<div class="checkout-thankyou__icon" aria-hidden="true">
				<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M20 6 9 17l-5-5"/>
				</svg>
			</div>

			<?php if ( $order ) : ?>
				<?php do_action( 'woocommerce_before_thankyou', $order->get_id() ); ?>

				<?php if ( $order->has_status( 'failed' ) ) : ?>
					<h1 class="checkout-thankyou__title checkout-thankyou__title--error">
						<?php esc_html_e( 'No pudimos procesar tu pago', 'esitef-minimal' ); ?>
					</h1>
					<p><?php esc_html_e( 'Revisa los datos o prueba otro método de pago.', 'esitef-minimal' ); ?></p>
					<a href="<?php echo esc_url( $order->get_checkout_payment_url() ); ?>" class="checkout-btn checkout-btn--primary">
						<?php esc_html_e( 'Reintentar pago', 'esitef-minimal' ); ?>
					</a>
				<?php else : ?>
					<h1 class="checkout-thankyou__title"><?php esc_html_e( '¡Compra confirmada!', 'esitef-minimal' ); ?></h1>
					<p class="checkout-thankyou__meta">
						<?php
						printf(
							/* translators: 1: order number, 2: billing email */
							esc_html__( 'Pedido #%1$s · Confirmación enviada a %2$s', 'esitef-minimal' ),
							esc_html( $order->get_order_number() ),
							esc_html( $order->get_billing_email() )
						);
						?>
					</p>

					<?php
					$presencial_notice = esitef_get_presencial_thankyou_notice( $order );
					if ( $presencial_notice ) :
						?>
						<div class="checkout-thankyou__notice checkout-thankyou__notice--<?php echo esc_attr( $presencial_notice['type'] ); ?>">
							<p><?php echo esc_html( $presencial_notice['message'] ); ?></p>
							<?php if ( ! empty( $presencial_notice['dates'] ) ) : ?>
								<table class="checkout-installments-table">
									<thead>
										<tr>
											<th><?php esc_html_e( 'Cuota', 'esitef-minimal' ); ?></th>
											<th><?php esc_html_e( 'Fecha', 'esitef-minimal' ); ?></th>
										</tr>
									</thead>
									<tbody>
										<?php foreach ( $presencial_notice['dates'] as $row ) : ?>
											<tr<?php echo ! empty( $row['done'] ) ? ' class="is-done"' : ''; ?>>
												<td><?php echo esc_html( $row['label'] ); ?></td>
												<td><?php echo esc_html( $row['date'] ); ?></td>
											</tr>
										<?php endforeach; ?>
									</tbody>
								</table>
							<?php endif; ?>
						</div>
					<?php endif; ?>

					<?php do_action( 'woocommerce_thankyou_' . $order->get_payment_method(), $order->get_id() ); ?>
					<?php do_action( 'woocommerce_thankyou', $order->get_id() ); ?>
				<?php endif; ?>

			<?php else : ?>
				<h1 class="checkout-thankyou__title"><?php esc_html_e( '¡Gracias!', 'esitef-minimal' ); ?></h1>
				<p><?php esc_html_e( 'Tu pedido ha sido recibido.', 'esitef-minimal' ); ?></p>
			<?php endif; ?>

			<a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="checkout-btn checkout-btn--ghost">
				<?php esc_html_e( 'Volver al inicio', 'esitef-minimal' ); ?>
			</a>
		</div>
	</div>
</div>
