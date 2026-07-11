<?php
/**
 * Sales mode: online-only vs full (online + presencial checkout).
 *
 * @package esitef-minimal
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * When true, WooCommerce checkout is limited to Tutor online courses.
 */
function esitef_online_only_sales() {
	return (bool) apply_filters( 'esitef_online_only_sales', true );
}

/**
 * Whether a WC product belongs to presencial checkout.
 *
 * @param int $product_id   Product ID.
 * @param int $variation_id Variation ID.
 * @return bool
 */
function esitef_is_presencial_wc_product( $product_id, $variation_id = 0 ) {
	$product_id   = (int) $product_id;
	$variation_id = (int) $variation_id;

	if ( $variation_id ) {
		$instance = get_post_meta( $variation_id, '_esitef_presencial_instance', true );
		if ( $instance ) {
			return true;
		}
	}

	if ( $product_id ) {
		$instance = get_post_meta( $product_id, '_esitef_presencial_instance', true );
		if ( $instance ) {
			return true;
		}
		$parent_id = wp_get_post_parent_id( $product_id );
		if ( $parent_id ) {
			$instance = get_post_meta( $parent_id, '_esitef_presencial_instance', true );
			if ( $instance ) {
				return true;
			}
		}
	}

	return false;
}

/**
 * Whether incoming add-to-cart request targets presencial checkout.
 *
 * @param int                  $product_id     Product ID.
 * @param int                  $variation_id   Variation ID.
 * @param array<string, mixed> $cart_item_data Cart item data.
 * @return bool
 */
function esitef_is_presencial_add_to_cart_request( $product_id, $variation_id = 0, $cart_item_data = array() ) {
	// phpcs:ignore WordPress.Security.NonceVerification.Recommended
	if ( ! empty( $_REQUEST['esitef_presencial_instance'] ) ) {
		return true;
	}

	if ( ! empty( $cart_item_data['esitef_presencial_instance'] ) ) {
		return true;
	}

	return esitef_is_presencial_wc_product( $product_id, $variation_id );
}

/**
 * Whether cart contains presencial lines.
 */
function esitef_cart_has_presencial_lines() {
	if ( ! function_exists( 'WC' ) || ! WC()->cart || WC()->cart->is_empty() ) {
		return false;
	}

	foreach ( WC()->cart->get_cart() as $item ) {
		if ( ! empty( $item['esitef_presencial_instance'] ) ) {
			return true;
		}
		$product_id   = (int) ( $item['product_id'] ?? 0 );
		$variation_id = (int) ( $item['variation_id'] ?? 0 );
		if ( esitef_is_presencial_wc_product( $product_id, $variation_id ) ) {
			return true;
		}
	}

	return false;
}

/**
 * Block presencial products from cart in online-only mode.
 *
 * @param bool                 $passed         Validation result.
 * @param int                  $product_id     Product ID.
 * @param int                  $quantity       Quantity.
 * @param int                  $variation_id   Variation ID.
 * @param array<string, mixed> $cart_item_data Cart item data.
 * @return bool
 */
function esitef_block_presencial_add_to_cart( $passed, $product_id, $quantity, $variation_id = 0, $cart_item_data = array() ) {
	unset( $quantity );

	if ( ! esitef_online_only_sales() || ! $passed ) {
		return $passed;
	}

	if ( ! esitef_is_presencial_add_to_cart_request( $product_id, $variation_id, $cart_item_data ) ) {
		return $passed;
	}

	wc_add_notice(
		__( 'Las inscripciones presenciales no están disponibles online por ahora. Reserva tu plaza desde la página del curso.', 'esitef-minimal' ),
		'error'
	);

	return false;
}
add_filter( 'woocommerce_add_to_cart_validation', 'esitef_block_presencial_add_to_cart', 5, 5 );

/**
 * Remove legacy presencial lines from cart in online-only mode.
 */
function esitef_purge_presencial_from_cart() {
	if ( ! esitef_online_only_sales() || ! function_exists( 'WC' ) || ! WC()->cart || WC()->cart->is_empty() ) {
		return;
	}

	$removed = false;
	foreach ( WC()->cart->get_cart() as $cart_key => $item ) {
		$product_id   = (int) ( $item['product_id'] ?? 0 );
		$variation_id = (int) ( $item['variation_id'] ?? 0 );
		$is_presencial = ! empty( $item['esitef_presencial_instance'] )
			|| esitef_is_presencial_wc_product( $product_id, $variation_id );

		if ( $is_presencial ) {
			WC()->cart->remove_cart_item( $cart_key );
			$removed = true;
		}
	}

	if ( $removed ) {
		wc_add_notice(
			__( 'Se retiraron inscripciones presenciales del carrito. Solo vendemos formaciones online en este momento.', 'esitef-minimal' ),
			'notice'
		);
	}
}
add_action( 'woocommerce_cart_loaded_from_session', 'esitef_purge_presencial_from_cart', 5 );

/**
 * Block checkout when presencial lines remain in cart.
 */
function esitef_block_presencial_checkout() {
	if ( ! esitef_online_only_sales() || ! esitef_cart_has_presencial_lines() ) {
		return;
	}

	wc_add_notice(
		__( 'El carrito incluye una inscripción presencial. Completa tu compra online por separado o vacía el carrito.', 'esitef-minimal' ),
		'error'
	);
}
add_action( 'woocommerce_check_cart_items', 'esitef_block_presencial_checkout' );

/**
 * Redirect presencial checkout attempts to cart.
 */
function esitef_redirect_presencial_checkout() {
	if ( ! esitef_online_only_sales() || ! function_exists( 'is_checkout' ) || ! is_checkout() || is_wc_endpoint_url( 'order-received' ) ) {
		return;
	}

	if ( ! esitef_cart_has_presencial_lines() ) {
		return;
	}

	wp_safe_redirect( wc_get_cart_url() );
	exit;
}
add_action( 'template_redirect', 'esitef_redirect_presencial_checkout', 5 );
