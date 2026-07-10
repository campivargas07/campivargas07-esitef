<?php
/**
 * Polar card fields shell — parity with preview-checkout.html.
 * Stripe Elements mount into #polarGatewayMount; shell hidden when native fields load.
 *
 * @package esitef-minimal
 */

defined( 'ABSPATH' ) || exit;
?>
<div class="polar-card-fields" id="polarCardFieldsShell" aria-hidden="false">
	<div class="polar-field" id="fieldCard">
		<label for="polar_card_number"><?php esc_html_e( 'Número de tarjeta', 'esitef-minimal' ); ?></label>
		<div class="polar-card-number-wrap">
			<input type="text" id="polar_card_number" inputmode="numeric" autocomplete="cc-number" placeholder="1234 1234 1234 1234" maxlength="19" />
			<div class="polar-card-brands" aria-hidden="true">
				<span class="polar-card-brand">VISA</span>
				<span class="polar-card-brand">MC</span>
				<span class="polar-card-brand">AMEX</span>
			</div>
		</div>
	</div>
	<div class="polar-row">
		<div class="polar-field" id="fieldExpiry">
			<label for="polar_card_expiry"><?php esc_html_e( 'Vencimiento', 'esitef-minimal' ); ?></label>
			<input type="text" id="polar_card_expiry" inputmode="numeric" autocomplete="cc-exp" placeholder="MM / AA" maxlength="7" />
		</div>
		<div class="polar-field" id="fieldCvc">
			<label for="polar_card_cvc"><?php esc_html_e( 'Código de seguridad', 'esitef-minimal' ); ?></label>
			<input type="text" id="polar_card_cvc" inputmode="numeric" autocomplete="cc-csc" placeholder="CVC" maxlength="4" />
		</div>
	</div>
	<div class="polar-field">
		<label for="polar_card_name"><?php esc_html_e( 'Titular de la tarjeta', 'esitef-minimal' ); ?></label>
		<input type="text" id="polar_card_name" autocomplete="cc-name" placeholder="<?php esc_attr_e( 'MARÍA GARCÍA', 'esitef-minimal' ); ?>" />
	</div>
</div>
<div class="polar-gateway-mount" id="polarGatewayMount" aria-live="polite"></div>
