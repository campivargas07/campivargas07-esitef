<?php
/**
 * Country-based payment gateway routing.
 *
 * @package esitef-minimal
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Gateway IDs grouped by role (filterable — adjust after plugin install).
 *
 * @return array<string, string[]>
 */
function esitef_get_gateway_groups() {
	return apply_filters(
		'esitef_gateway_groups',
		array(
			'card'        => array(
				'stripe',
				'stripe_cc',
				'woocommerce_payments',
				'cod',
			),
			'paypal'      => array( 'ppcp-gateway', 'paypal', 'ppec_paypal' ),
			'mercadopago' => array(
				'woo-mercado-pago-basic',
				'woo-mercado-pago-custom',
				'woo-mercado-pago-credits',
				'woo-mercado-pago-ticket',
				'woo-mercado-pago-pix',
			),
			'bacs'        => array( 'bacs' ),
			'test'        => array( 'cod', 'cheque', 'bacs' ),
		)
	);
}

/**
 * Resolve billing country for gateway filtering.
 */
function esitef_get_checkout_billing_country() {
	if ( ! function_exists( 'WC' ) || ! WC()->customer ) {
		return '';
	}

	// phpcs:ignore WordPress.Security.NonceVerification.Recommended
	if ( ! empty( $_POST['billing_country'] ) ) {
		return sanitize_text_field( wp_unslash( $_POST['billing_country'] ) );
	}

	$country = WC()->customer->get_billing_country();
	if ( $country ) {
		return $country;
	}

	return WC()->countries->get_base_country();
}

/**
 * Whether Mercado Pago should be offered (Argentina billing).
 */
function esitef_checkout_uses_mercadopago( $country = '' ) {
	if ( '' === $country ) {
		$country = esitef_get_checkout_billing_country();
	}
	return 'AR' === $country;
}

/**
 * Whether we're on local Docker dev (localhost:8080).
 */
function esitef_is_local_dev() {
	if ( defined( 'WP_ENVIRONMENT_TYPE' ) && 'local' === WP_ENVIRONMENT_TYPE ) {
		return true;
	}
	$host = isset( $_SERVER['HTTP_HOST'] ) ? (string) $_SERVER['HTTP_HOST'] : '';
	return false !== strpos( $host, 'localhost' ) || false !== strpos( $host, '127.0.0.1' );
}

/**
 * Local dev: use COD only to avoid PayPal/Stripe JS loops without sandbox keys.
 */
function esitef_is_local_cod_only_checkout() {
	if ( ! esitef_is_local_dev() || ! defined( 'WP_DEBUG' ) || ! WP_DEBUG ) {
		return false;
	}
	return (bool) apply_filters( 'esitef_local_cod_only_checkout', false );
}

/**
 * Filter available gateways by billing country.
 *
 * @param array<string, WC_Payment_Gateway> $gateways Active gateways.
 * @return array<string, WC_Payment_Gateway>
 */
function esitef_filter_payment_gateways_by_country( $gateways ) {
	if ( is_admin() && ! wp_doing_ajax() ) {
		return $gateways;
	}

	if ( ! is_checkout() && ! is_cart() && ! ( defined( 'WOOCOMMERCE_CHECKOUT' ) && WOOCOMMERCE_CHECKOUT ) ) {
		return $gateways;
	}

	if ( esitef_is_local_cod_only_checkout() ) {
		$cod = isset( $gateways['cod'] ) ? array( 'cod' => $gateways['cod'] ) : array();
		return $cod;
	}

	$groups  = esitef_get_gateway_groups();
	$country = esitef_get_checkout_billing_country();

	if ( esitef_checkout_uses_mercadopago( $country ) ) {
		$allowed = array_merge( $groups['mercadopago'], $groups['bacs'], $groups['test'] );
	} else {
		$allowed = array_merge( $groups['card'], $groups['paypal'], $groups['bacs'], $groups['test'] );
	}

	$allowed = apply_filters( 'esitef_allowed_gateways_for_country', $allowed, $country );

	foreach ( array_keys( $gateways ) as $gateway_id ) {
		if ( ! in_array( $gateway_id, $allowed, true ) ) {
			unset( $gateways[ $gateway_id ] );
		}
	}

	return $gateways;
}
add_filter( 'woocommerce_available_payment_gateways', 'esitef_filter_payment_gateways_by_country', 20 );

/**
 * Polar checkout: one gateway per tab — Stripe (card) + PayPal redirect + MP.
 * Drops PayPal card/DCC sub-gateways so WC stays invisible behind Polar UI.
 *
 * @param array<string, WC_Payment_Gateway> $gateways Active gateways.
 * @return array<string, WC_Payment_Gateway>
 */
function esitef_polar_consolidate_checkout_gateways( $gateways ) {
	if ( is_admin() && ! wp_doing_ajax() ) {
		return $gateways;
	}

	if ( ! is_checkout() && ! ( defined( 'WOOCOMMERCE_CHECKOUT' ) && WOOCOMMERCE_CHECKOUT ) ) {
		return $gateways;
	}

	if ( function_exists( 'esitef_is_local_cod_only_checkout' ) && esitef_is_local_cod_only_checkout() ) {
		return $gateways;
	}

	$strip = array(
		'ppcp-credit-card-gateway',
		'ppcp-card-button-gateway',
		'ppcp-googlepay',
		'ppcp-applepay',
	);
	foreach ( $strip as $gateway_id ) {
		unset( $gateways[ $gateway_id ] );
	}

	$groups        = esitef_get_gateway_groups();
	$card_priority = array( 'stripe', 'stripe_cc', 'woocommerce_payments', 'cod' );
	$card_winner   = null;

	foreach ( $card_priority as $gateway_id ) {
		if ( isset( $gateways[ $gateway_id ] ) ) {
			$card_winner = $gateway_id;
			break;
		}
	}

	if ( $card_winner ) {
		foreach ( array_keys( $gateways ) as $gateway_id ) {
			if ( in_array( $gateway_id, $groups['card'], true ) && $gateway_id !== $card_winner ) {
				unset( $gateways[ $gateway_id ] );
			}
		}
	}

	$paypal_priority = array( 'ppcp-gateway', 'paypal', 'ppec_paypal' );
	$paypal_winner   = null;
	foreach ( $paypal_priority as $gateway_id ) {
		if ( isset( $gateways[ $gateway_id ] ) ) {
			$paypal_winner = $gateway_id;
			break;
		}
	}
	if ( $paypal_winner ) {
		foreach ( $paypal_priority as $gateway_id ) {
			if ( $gateway_id !== $paypal_winner ) {
				unset( $gateways[ $gateway_id ] );
			}
		}
	}

	return $gateways;
}
add_filter( 'woocommerce_available_payment_gateways', 'esitef_polar_consolidate_checkout_gateways', 35 );

/**
 * Default billing country from presencial cart line (Argentina courses → AR).
 */
function esitef_presencial_default_billing_country( $country ) {
	if ( $country || ! function_exists( 'WC' ) || ! WC()->cart ) {
		return $country;
	}

	foreach ( WC()->cart->get_cart() as $item ) {
		if ( empty( $item['esitef_presencial_instance'] ) ) {
			continue;
		}
		$instance = esitef_get_presencial_by_slug( (string) $item['esitef_presencial_instance'] );
		if ( $instance && ! empty( $instance['pais'] ) && 'argentina' === $instance['pais'] ) {
			return 'AR';
		}
	}

	return $country;
}
add_filter( 'default_checkout_billing_country', 'esitef_presencial_default_billing_country' );

/**
 * Localize gateway metadata for checkout UI.
 *
 * @return array<string, mixed>
 */
function esitef_get_checkout_gateway_ui_config() {
	$country = esitef_get_checkout_billing_country();
	$groups  = esitef_get_gateway_groups();

	return array(
		'billingCountry' => $country,
		'sessionCurrency' => function_exists( 'esitef_geo_get_session_currency' ) ? esitef_geo_get_session_currency() : '',
		'useMercadoPago' => esitef_checkout_uses_mercadopago( $country ),
		'localCodOnly'   => esitef_is_local_cod_only_checkout(),
		'cardGateways'   => $groups['card'],
		'paypalGateways' => $groups['paypal'],
		'mpGateways'     => $groups['mercadopago'],
		'labels'         => array(
			'card'        => __( 'Pagar con tarjeta', 'esitef-minimal' ),
			'paypal'      => __( 'PayPal', 'esitef-minimal' ),
			'mercadopago' => __( 'Mercado Pago', 'esitef-minimal' ),
		),
	);
}
