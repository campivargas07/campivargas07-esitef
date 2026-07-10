<?php
/**
 * Stripe-style card fields shell.
 * Native Stripe Elements mount into #polarGatewayMount when available.
 *
 * @package esitef-minimal
 */

defined( 'ABSPATH' ) || exit;
?>
<div class="polar-secure-notice" id="polarSecureNotice">
	<span class="polar-secure-notice__icon" aria-hidden="true">🔒</span>
	<span class="polar-secure-notice__text"><?php esc_html_e( 'Pago seguro y rápido con encriptación SSL', 'esitef-minimal' ); ?></span>
	<span class="polar-secure-notice__chev" aria-hidden="true">▾</span>
</div>

<div class="polar-card-fields" id="polarCardFieldsShell" aria-hidden="false">
	<div class="polar-field polar-field--card" id="fieldCard">
		<label for="polar_card_number"><?php esc_html_e( 'Número de tarjeta', 'esitef-minimal' ); ?></label>
		<div class="polar-card-number-wrap">
			<input type="text" id="polar_card_number" inputmode="numeric" autocomplete="cc-number" placeholder="1234 1234 1234 1234" maxlength="19" />
			<div class="polar-card-brands" aria-hidden="true">
				<span class="polar-card-brand polar-card-brand--visa">VISA</span>
				<span class="polar-card-brand polar-card-brand--mc">MC</span>
				<span class="polar-card-brand polar-card-brand--amex">AMEX</span>
				<span class="polar-card-brand polar-card-brand--disc">DISC</span>
			</div>
		</div>
	</div>

	<div class="polar-row polar-row--card">
		<div class="polar-field" id="fieldExpiry">
			<label for="polar_card_expiry"><?php esc_html_e( 'Fecha de vencimiento', 'esitef-minimal' ); ?></label>
			<input type="text" id="polar_card_expiry" inputmode="numeric" autocomplete="cc-exp" placeholder="MM / AA" maxlength="7" />
		</div>
		<div class="polar-field polar-field--cvc" id="fieldCvc">
			<label for="polar_card_cvc"><?php esc_html_e( 'Código de seguridad', 'esitef-minimal' ); ?></label>
			<div class="polar-cvc-wrap">
				<input type="text" id="polar_card_cvc" inputmode="numeric" autocomplete="cc-csc" placeholder="CVC" maxlength="4" />
				<span class="polar-cvc-hint" aria-hidden="true" title="CVC">💳</span>
			</div>
		</div>
	</div>

	<label class="polar-checkbox">
		<input type="checkbox" id="polarSaveInfo" name="polar_save_info" value="1" />
		<span><?php esc_html_e( 'Guardar mis datos para un checkout más rápido', 'esitef-minimal' ); ?></span>
	</label>

	<div class="polar-field">
		<label for="polar_card_name"><?php esc_html_e( 'Titular de la tarjeta', 'esitef-minimal' ); ?></label>
		<input type="text" id="polar_card_name" autocomplete="cc-name" placeholder="<?php esc_attr_e( 'Nombre completo', 'esitef-minimal' ); ?>" />
	</div>
</div>

<div class="polar-gateway-mount" id="polarGatewayMount" aria-live="polite"></div>

<div class="polar-billing-extra" id="polarBillingExtra">
	<div class="polar-field polar-field--billing" id="polarBillingCountryWrap">
		<label for="billing_country"><?php esc_html_e( 'Dirección de facturación', 'esitef-minimal' ); ?></label>
	</div>
	<label class="polar-checkbox">
		<input type="checkbox" id="polarBusinessPurchase" name="polar_business" value="1" />
		<span><?php esc_html_e( 'Compro como empresa', 'esitef-minimal' ); ?></span>
	</label>
</div>
