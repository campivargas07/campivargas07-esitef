<?php
/**
 * Geo-detected country and session currency for WooCommerce.
 *
 * @package esitef-minimal
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Local Docker / localhost: default USD unless geo override is active.
 */
function esitef_geo_local_usd_only() {
	$is_local = function_exists( 'esitef_is_local_dev' ) ? esitef_is_local_dev() : false;
	if ( ! $is_local ) {
		$host     = isset( $_SERVER['HTTP_HOST'] ) ? (string) $_SERVER['HTTP_HOST'] : '';
		$is_local = false !== strpos( $host, 'localhost' ) || false !== strpos( $host, '127.0.0.1' );
	}

	if ( ! $is_local ) {
		return false;
	}

	return ! esitef_geo_has_currency_override();
}

/**
 * Whether visitor explicitly chose country or currency (query or session).
 */
function esitef_geo_has_currency_override() {
	// phpcs:ignore WordPress.Security.NonceVerification.Recommended
	if ( ! empty( $_GET['currency'] ) || ! empty( $_GET['country'] ) ) {
		return true;
	}

	if ( function_exists( 'WC' ) && WC()->session ) {
		if ( WC()->session->get( 'esitef_geo_override_active' ) ) {
			return true;
		}
	}

	if ( ! empty( $_COOKIE['esitef_geo_override_active'] ) && '1' === (string) $_COOKIE['esitef_geo_override_active'] ) {
		return true;
	}

	return false;
}

/**
 * Mark geo override active for local testing persistence.
 */
function esitef_geo_mark_override_active() {
	if ( function_exists( 'WC' ) && WC()->session ) {
		WC()->session->set( 'esitef_geo_override_active', true );
	}
	if ( did_action( 'wp_loaded' ) && ! headers_sent() && function_exists( 'wc_setcookie' ) ) {
		wc_setcookie( 'esitef_geo_override_active', '1', time() + MONTH_IN_SECONDS );
	}
}

/**
 * Persist detected country in session / cookie.
 *
 * @param string $country ISO country code.
 */
function esitef_geo_set_session_country( $country ) {
	$country = strtoupper( (string) $country );
	if ( strlen( $country ) !== 2 ) {
		return;
	}

	if ( function_exists( 'WC' ) && WC()->session ) {
		WC()->session->set( 'esitef_geo_country', $country );
	}

	if ( did_action( 'wp_loaded' ) && ! headers_sent() && function_exists( 'wc_setcookie' ) ) {
		wc_setcookie( 'esitef_geo_country', $country, time() + MONTH_IN_SECONDS );
	}
}

/**
 * Session country from cookie / WC session.
 *
 * @return string
 */
function esitef_geo_get_session_country() {
	if ( function_exists( 'WC' ) && WC()->session ) {
		$stored = WC()->session->get( 'esitef_geo_country' );
		if ( $stored && strlen( (string) $stored ) === 2 ) {
			return strtoupper( (string) $stored );
		}
	}

	if ( ! empty( $_COOKIE['esitef_geo_country'] ) ) {
		$cookie = strtoupper( sanitize_text_field( wp_unslash( $_COOKIE['esitef_geo_country'] ) ) );
		if ( strlen( $cookie ) === 2 ) {
			return $cookie;
		}
	}

	return '';
}

/**
 * Supported checkout currencies.
 *
 * @return string[]
 */
function esitef_geo_supported_currencies() {
	return apply_filters(
		'esitef_geo_supported_currencies',
		array( 'USD', 'ARS', 'MXN', 'EUR' )
	);
}

/**
 * Country → currency map.
 *
 * @param string $country ISO 3166-1 alpha-2.
 * @return string
 */
function esitef_geo_currency_for_country( $country ) {
	$country = strtoupper( (string) $country );
	$map     = apply_filters(
		'esitef_checkout_currency_for_country',
		array(
			'AR' => 'ARS',
			'MX' => 'MXN',
			'ES' => 'EUR',
			'UY' => 'USD',
			'US' => 'USD',
		),
		$country
	);

	if ( isset( $map[ $country ] ) ) {
		return $map[ $country ];
	}

	$eu = array( 'DE', 'FR', 'IT', 'PT', 'BE', 'NL', 'AT', 'IE' );
	if ( in_array( $country, $eu, true ) ) {
		return 'EUR';
	}

	return apply_filters( 'esitef_geo_default_currency', 'USD', $country );
}

/**
 * Detect visitor country (GeoIP / Cloudflare / WC customer).
 *
 * @return string ISO country code.
 */
function esitef_geo_detect_country() {
	// phpcs:ignore WordPress.Security.NonceVerification.Recommended
	if ( ! empty( $_GET['country'] ) ) {
		$requested = strtoupper( sanitize_text_field( wp_unslash( $_GET['country'] ) ) );
		if ( strlen( $requested ) === 2 ) {
			esitef_geo_mark_override_active();
			esitef_geo_set_session_country( $requested );
			return $requested;
		}
	}

	$session_country = esitef_geo_get_session_country();
	if ( $session_country && esitef_geo_has_currency_override() ) {
		return $session_country;
	}

	if ( ! empty( $_SERVER['HTTP_CF_IPCOUNTRY'] ) ) {
		$cf = strtoupper( sanitize_text_field( wp_unslash( $_SERVER['HTTP_CF_IPCOUNTRY'] ) ) );
		if ( strlen( $cf ) === 2 && 'XX' !== $cf && 'T1' !== $cf ) {
			return $cf;
		}
	}

	if ( function_exists( 'WC' ) && WC()->customer ) {
		$billing = WC()->customer->get_billing_country();
		if ( $billing ) {
			return $billing;
		}
	}

	if ( class_exists( 'WC_Geolocation' ) ) {
		$location = WC_Geolocation::geolocate_ip();
		if ( ! empty( $location['country'] ) ) {
			return $location['country'];
		}
	}

	return apply_filters( 'esitef_geo_fallback_country', 'US' );
}

/**
 * Whether WooCommerce cart can be safely read.
 */
function esitef_geo_cart_is_ready() {
	return did_action( 'wp_loaded' )
		&& function_exists( 'WC' )
		&& isset( WC()->cart )
		&& WC()->cart instanceof WC_Cart;
}

/**
 * Persist currency in WC session / cookie (only when safe).
 *
 * @param string $currency Currency code.
 */
function esitef_geo_set_session_currency( $currency ) {
	$currency = strtoupper( (string) $currency );
	if ( ! in_array( $currency, esitef_geo_supported_currencies(), true ) ) {
		$currency = 'USD';
	}

	if ( function_exists( 'WC' ) && WC()->session ) {
		WC()->session->set( 'esitef_geo_currency', $currency );
	}

	if ( did_action( 'wp_loaded' ) && ! headers_sent() && function_exists( 'wc_setcookie' ) ) {
		wc_setcookie( 'esitef_geo_currency', $currency, time() + MONTH_IN_SECONDS );
	}
}

/**
 * Session currency (cookie → WC session → geo detect).
 *
 * @return string
 */
function esitef_geo_get_session_currency() {
	// phpcs:ignore WordPress.Security.NonceVerification.Recommended
	if ( ! empty( $_GET['country'] ) ) {
		$requested = strtoupper( sanitize_text_field( wp_unslash( $_GET['country'] ) ) );
		if ( strlen( $requested ) === 2 ) {
			esitef_geo_mark_override_active();
			esitef_geo_set_session_country( $requested );
			$currency = esitef_geo_currency_for_country( $requested );
			if ( did_action( 'wp_loaded' ) ) {
				esitef_geo_set_session_currency( $currency );
			}
			return $currency;
		}
	}

	// phpcs:ignore WordPress.Security.NonceVerification.Recommended
	if ( ! empty( $_GET['currency'] ) ) {
		$requested = strtoupper( sanitize_text_field( wp_unslash( $_GET['currency'] ) ) );
		if ( in_array( $requested, esitef_geo_supported_currencies(), true ) ) {
			esitef_geo_mark_override_active();
			if ( did_action( 'wp_loaded' ) ) {
				esitef_geo_set_session_currency( $requested );
			}
			return $requested;
		}
	}

	if ( esitef_geo_local_usd_only() ) {
		if ( did_action( 'wp_loaded' ) ) {
			esitef_geo_set_session_currency( 'USD' );
			esitef_geo_set_session_country( 'US' );
		}
		return 'USD';
	}

	if ( function_exists( 'WC' ) && WC()->session ) {
		$stored = WC()->session->get( 'esitef_geo_currency' );
		if ( $stored && in_array( $stored, esitef_geo_supported_currencies(), true ) ) {
			return $stored;
		}
	}

	if ( ! empty( $_COOKIE['esitef_geo_currency'] ) ) {
		$cookie = strtoupper( sanitize_text_field( wp_unslash( $_COOKIE['esitef_geo_currency'] ) ) );
		if ( in_array( $cookie, esitef_geo_supported_currencies(), true ) ) {
			return $cookie;
		}
	}

	$country  = esitef_geo_detect_country();
	$currency = esitef_geo_currency_for_country( $country );

	if ( did_action( 'wp_loaded' ) ) {
		esitef_geo_set_session_currency( $currency );
		esitef_geo_set_session_country( $country );
	}

	return $currency;
}

/**
 * Base store currency.
 *
 * @return string
 */
function esitef_geo_base_currency() {
	return function_exists( 'get_woocommerce_currency' )
		? get_option( 'woocommerce_currency', 'USD' )
		: 'USD';
}

/**
 * Exchange rates from store base currency (filterable).
 *
 * @return array<string, float>
 */
function esitef_geo_exchange_rates() {
	$base = esitef_geo_base_currency();

	$rates = array(
		'USD' => 1.0,
		'ARS' => 1300.0,
		'MXN' => 17.0,
		'EUR' => 0.92,
	);

	return apply_filters( 'esitef_geo_exchange_rates', $rates, $base );
}

/**
 * Convert amount between currencies.
 *
 * @param float  $amount   Amount in $from currency.
 * @param string $from     Source currency.
 * @param string $to       Target currency.
 * @return float
 */
function esitef_geo_convert_price( $amount, $from, $to ) {
	$from   = strtoupper( (string) $from );
	$to     = strtoupper( (string) $to );
	$amount = (float) $amount;

	if ( $from === $to ) {
		return $amount;
	}

	$rates = esitef_geo_exchange_rates();
	$base  = esitef_geo_base_currency();

	$in_base = $amount;
	if ( $from !== $base && isset( $rates[ $from ] ) && $rates[ $from ] > 0 ) {
		$in_base = $amount / $rates[ $from ];
	}
	if ( $to === $base ) {
		return round( $in_base, wc_get_price_decimals() );
	}
	if ( isset( $rates[ $to ] ) ) {
		return round( $in_base * $rates[ $to ], wc_get_price_decimals() );
	}

	return $amount;
}

/**
 * Native currency for a cart line.
 *
 * @param array<string, mixed> $cart_item Cart line.
 * @return string
 */
function esitef_geo_cart_line_currency( $cart_item ) {
	if ( ! empty( $cart_item['esitef_presencial_instance'] ) && function_exists( 'esitef_get_presencial_checkout_config' ) ) {
		$config = esitef_get_presencial_checkout_config( (string) $cart_item['esitef_presencial_instance'] );
		if ( $config && ! empty( $config['currency'] ) ) {
			return strtoupper( (string) $config['currency'] );
		}
	}

	return esitef_geo_base_currency();
}

/**
 * Sync session currency to presencial instance currency when cart has presencial lines.
 */
function esitef_geo_sync_currency_from_cart() {
	static $syncing = false;

	if ( $syncing || ! esitef_geo_cart_is_ready() || esitef_geo_local_usd_only() ) {
		return;
	}

	$syncing = true;

	$cart = WC()->cart->get_cart();
	if ( empty( $cart ) ) {
		$syncing = false;
		return;
	}

	$currencies = array();
	foreach ( $cart as $item ) {
		if ( empty( $item['esitef_presencial_instance'] ) ) {
			continue;
		}
		$currency = esitef_geo_cart_line_currency( $item );
		if ( $currency ) {
			$currencies[ $currency ] = true;
		}
	}

	if ( 1 === count( $currencies ) ) {
		$target = (string) array_key_first( $currencies );
		esitef_geo_set_session_currency( $target );
	}

	$syncing = false;
}

/**
 * After cart session is loaded (wp_loaded+).
 */
function esitef_geo_sync_currency_on_cart_loaded() {
	esitef_geo_sync_currency_from_cart();
}
add_action( 'woocommerce_cart_loaded_from_session', 'esitef_geo_sync_currency_on_cart_loaded', 99 );

/**
 * After add/remove/update cart lines (frontend).
 */
function esitef_geo_sync_currency_on_cart_change() {
	esitef_geo_sync_currency_from_cart();
}
add_action( 'woocommerce_add_to_cart', 'esitef_geo_sync_currency_on_cart_change', 99, 0 );
add_action( 'woocommerce_cart_item_removed', 'esitef_geo_sync_currency_on_cart_change', 99 );
add_action( 'woocommerce_after_cart_item_quantity_update', 'esitef_geo_sync_currency_on_cart_change', 99, 0 );

/**
 * Default session currency once WP is fully loaded (no cart access).
 */
function esitef_geo_currency_bootstrap() {
	if ( ! function_exists( 'WC' ) ) {
		return;
	}
	esitef_geo_get_session_currency();
}
add_action( 'wp_loaded', 'esitef_geo_currency_bootstrap', 5 );

/**
 * Use session currency in WooCommerce.
 *
 * @param string $currency Current currency.
 * @return string
 */
function esitef_geo_filter_woocommerce_currency( $currency ) {
	if ( is_admin() && ! wp_doing_ajax() ) {
		return $currency;
	}
	if ( ! did_action( 'wp_loaded' ) ) {
		return $currency;
	}
	return esitef_geo_get_session_currency();
}
add_filter( 'woocommerce_currency', 'esitef_geo_filter_woocommerce_currency', 20 );

/**
 * Adjust cart line prices to session currency.
 */
function esitef_geo_adjust_cart_prices() {
	if ( is_admin() && ! wp_doing_ajax() ) {
		return;
	}
	if ( ! esitef_geo_cart_is_ready() ) {
		return;
	}

	$session_currency = esitef_geo_get_session_currency();

	foreach ( WC()->cart->get_cart() as $cart_item ) {
		$product = $cart_item['data'] ?? null;
		if ( ! $product || ! $product->exists() ) {
			continue;
		}

		$line_currency = esitef_geo_cart_line_currency( $cart_item );

		if ( ! empty( $cart_item['esitef_presencial_instance'] ) && ! empty( $cart_item['esitef_payment_plan'] ) ) {
			$config = esitef_get_presencial_checkout_config( (string) $cart_item['esitef_presencial_instance'] );
			$plan   = (string) $cart_item['esitef_payment_plan'];
			if ( $config && ! empty( $config['plans'][ $plan ]['price'] ) ) {
				$native_price = (float) $config['plans'][ $plan ]['price'];
				if ( $line_currency === $session_currency ) {
					$product->set_price( $native_price );
				} else {
					$product->set_price( esitef_geo_convert_price( $native_price, $line_currency, $session_currency ) );
				}
			}
			continue;
		}

		if ( function_exists( 'esitef_wc_is_tutor_course_product' ) && esitef_wc_is_tutor_course_product( $product->get_id() ) ) {
			$base_price = (float) $product->get_regular_price( 'edit' );
			if ( ! $base_price ) {
				$base_price = (float) $product->get_price( 'edit' );
			}
			if ( $session_currency !== esitef_geo_base_currency() ) {
				$product->set_price( esitef_geo_convert_price( $base_price, esitef_geo_base_currency(), $session_currency ) );
			}
		}
	}
}
add_action( 'woocommerce_before_calculate_totals', 'esitef_geo_adjust_cart_prices', 25 );

/**
 * Default billing country from geo detect when cart has no presencial AR override.
 *
 * @param string $country Current default.
 * @return string
 */
function esitef_geo_default_billing_country( $country ) {
	if ( $country ) {
		return $country;
	}
	return esitef_geo_detect_country();
}
add_filter( 'default_checkout_billing_country', 'esitef_geo_default_billing_country', 5 );

/**
 * Local: US billing country so gateways match USD test mode.
 *
 * @param string $country Current default.
 * @return string
 */
function esitef_geo_local_billing_country( $country ) {
	if ( esitef_geo_local_usd_only() ) {
		return 'US';
	}

	$detected = esitef_geo_detect_country();
	if ( $detected ) {
		return $detected;
	}

	return $country;
}
add_filter( 'default_checkout_billing_country', 'esitef_geo_local_billing_country', 50 );

/**
 * Convert tutor course product prices for display and cart.
 *
 * @param mixed      $price   Raw price.
 * @param WC_Product $product Product.
 * @return mixed
 */
function esitef_geo_filter_product_price( $price, $product ) {
	if ( is_admin() && ! wp_doing_ajax() ) {
		return $price;
	}
	if ( ! $product || ! function_exists( 'esitef_wc_is_tutor_course_product' ) ) {
		return $price;
	}
	if ( ! esitef_wc_is_tutor_course_product( $product->get_id() ) ) {
		return $price;
	}
	if ( '' === $price || null === $price ) {
		return $price;
	}

	$session_currency = esitef_geo_get_session_currency();
	$base_currency    = esitef_geo_base_currency();
	if ( $session_currency === $base_currency ) {
		return $price;
	}

	return esitef_geo_convert_price( (float) $price, $base_currency, $session_currency );
}
add_filter( 'woocommerce_product_get_price', 'esitef_geo_filter_product_price', 20, 2 );
add_filter( 'woocommerce_product_get_regular_price', 'esitef_geo_filter_product_price', 20, 2 );
add_filter( 'woocommerce_product_get_sale_price', 'esitef_geo_filter_product_price', 20, 2 );

/**
 * Local dev: small geo debug chip.
 */
function esitef_geo_local_debug_banner() {
	if ( ! function_exists( 'esitef_is_local_dev' ) || ! esitef_is_local_dev() ) {
		return;
	}
	if ( is_admin() ) {
		return;
	}

	$country  = esitef_geo_detect_country();
	$currency = esitef_geo_get_session_currency();
	$override = esitef_geo_has_currency_override() ? ' · override' : ' · default USD';

	echo '<div style="position:fixed;bottom:8px;left:8px;z-index:999998;background:#1a1a2e;color:#fff;padding:6px 10px;border-radius:8px;font:500 11px Inconsolata,monospace;opacity:0.9;">';
	echo esc_html( 'Geo: ' . $country . ' · ' . $currency . $override );
	echo '</div>';
}
add_action( 'wp_footer', 'esitef_geo_local_debug_banner', 99 );
