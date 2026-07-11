<?php
/**
 * Presencial reserve panel — deposit info + intent form (online-only sales mode).
 *
 * @package esitef-minimal
 *
 * @var array<string, mixed> $args
 */

$title        = isset( $args['title'] ) ? (string) $args['title'] : '';
$investment   = isset( $args['investment'] ) ? (string) $args['investment'] : '';
$deposit      = isset( $args['deposit'] ) ? (string) $args['deposit'] : '';
$concept      = isset( $args['concept'] ) ? (string) $args['concept'] : '';
$holder       = isset( $args['holder'] ) ? (string) $args['holder'] : '';
$accounts     = isset( $args['accounts'] ) && is_array( $args['accounts'] ) ? $args['accounts'] : array();
$discounts    = isset( $args['discounts'] ) && is_array( $args['discounts'] ) ? $args['discounts'] : array();
$whatsapp_url = isset( $args['whatsapp_url'] ) ? (string) $args['whatsapp_url'] : '';
$email_url    = isset( $args['email_url'] ) ? (string) $args['email_url'] : '';
$course_label = isset( $args['course_label'] ) ? (string) $args['course_label'] : $title;

if ( ! $deposit && ! $investment ) {
	return;
}

$panel_id = 'reservar-plaza';
?>
<section class="presencial-reserve" id="<?php echo esc_attr( $panel_id ); ?>" aria-labelledby="presencial-reserve-title">
	<div class="esitef-module-shell">
		<div class="esitef-module-card presencial-reserve__card">
			<header class="presencial-reserve__header">
				<h2 id="presencial-reserve-title"><?php esc_html_e( 'Reservar plaza', 'esitef-minimal' ); ?></h2>
				<p class="presencial-reserve__lead">
					<?php esc_html_e( 'Confirma tu interés y realiza el depósito por transferencia. Te contactaremos para confirmar tu inscripción.', 'esitef-minimal' ); ?>
				</p>
			</header>

			<div class="presencial-reserve__grid">
				<div class="presencial-reserve__info">
					<?php if ( $deposit ) : ?>
					<div class="presencial-reserve__deposit-card">
						<span class="presencial-reserve__deposit-label"><?php esc_html_e( 'Depósito para reservar', 'esitef-minimal' ); ?></span>
						<strong class="presencial-reserve__deposit-amount"><?php echo esc_html( $deposit ); ?></strong>
						<?php if ( $investment && $investment !== $deposit ) : ?>
						<p class="presencial-reserve__investment"><?php echo esc_html( $investment ); ?></p>
						<?php endif; ?>
					</div>
					<?php endif; ?>

					<?php if ( $discounts ) : ?>
					<ul class="presencial-reserve__discounts">
						<?php foreach ( $discounts as $discount ) : ?>
						<li><?php echo esc_html( (string) $discount ); ?></li>
						<?php endforeach; ?>
					</ul>
					<p class="presencial-reserve__note"><?php esc_html_e( 'Las promociones no son acumulables.', 'esitef-minimal' ); ?></p>
					<?php endif; ?>

					<?php if ( $accounts || $holder || $concept ) : ?>
					<div class="presencial-reserve__bank">
						<h3><?php esc_html_e( 'Datos para la transferencia', 'esitef-minimal' ); ?></h3>
						<?php if ( $concept ) : ?>
						<p><strong><?php esc_html_e( 'Concepto:', 'esitef-minimal' ); ?></strong> <?php echo esc_html( $concept ); ?></p>
						<?php endif; ?>
						<?php foreach ( $accounts as $account ) : ?>
							<?php
							$acc_label  = isset( $account['label'] ) ? (string) $account['label'] : '';
							$acc_number = isset( $account['number'] ) ? (string) $account['number'] : '';
							?>
							<?php if ( $acc_label && $acc_number ) : ?>
						<p><?php echo esc_html( $acc_label ); ?>: <?php echo esc_html( $acc_number ); ?></p>
							<?php endif; ?>
						<?php endforeach; ?>
						<?php if ( $holder ) : ?>
						<p><strong><?php esc_html_e( 'Titular:', 'esitef-minimal' ); ?></strong> <?php echo esc_html( $holder ); ?></p>
						<?php endif; ?>
					</div>
					<?php endif; ?>
				</div>

				<form class="presencial-reserve__form" data-presencial-reserve-form novalidate>
					<h3><?php esc_html_e( 'Datos de contacto', 'esitef-minimal' ); ?></h3>
					<div class="presencial-reserve__field">
						<label for="presencial-reserve-name"><?php esc_html_e( 'Nombre completo', 'esitef-minimal' ); ?></label>
						<input type="text" id="presencial-reserve-name" name="name" required autocomplete="name">
					</div>
					<div class="presencial-reserve__field">
						<label for="presencial-reserve-email"><?php esc_html_e( 'Email', 'esitef-minimal' ); ?></label>
						<input type="email" id="presencial-reserve-email" name="email" required autocomplete="email">
					</div>
					<div class="presencial-reserve__field">
						<label for="presencial-reserve-phone"><?php esc_html_e( 'Teléfono / WhatsApp', 'esitef-minimal' ); ?></label>
						<input type="tel" id="presencial-reserve-phone" name="phone" required autocomplete="tel">
					</div>

					<button type="submit" class="hero-btn presencial-reserve__submit">
						<?php esc_html_e( 'Enviar solicitud de reserva', 'esitef-minimal' ); ?>
					</button>

					<p class="presencial-reserve__success" data-presencial-reserve-success hidden role="status">
						<?php esc_html_e( '¡Gracias! Te contactaremos para confirmar tu plaza.', 'esitef-minimal' ); ?>
					</p>
				</form>
			</div>
		</div>
	</div>
</section>

<script type="application/json" id="presencial-reserve-data">
<?php
echo wp_json_encode(
	array(
		'course'       => $course_label,
		'deposit'      => $deposit,
		'concept'      => $concept,
		'whatsappUrl'  => $whatsapp_url,
		'emailUrl'     => $email_url,
		'contactEmail' => isset( $args['contact_email'] ) ? (string) $args['contact_email'] : 'info@esitef.com',
	),
	JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT
);
?>
</script>
