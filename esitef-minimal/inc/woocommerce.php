<?php
/**
 * WooCommerce tweaks for ESITEF course checkout.
 *
 * @package esitef-minimal
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Whether a product is already in the cart.
 */
function esitef_wc_product_in_cart( $product_id, $variation_id = 0 ) {
	if ( ! function_exists( 'WC' ) || ! WC()->cart ) {
		return false;
	}

	$product_id   = (int) $product_id;
	$variation_id = (int) $variation_id;

	foreach ( WC()->cart->get_cart() as $item ) {
		if ( (int) $item['product_id'] === $product_id || ( $variation_id && (int) $item['variation_id'] === $variation_id ) ) {
			return true;
		}
	}

	return false;
}

/**
 * Existing cart line key for a product (if any).
 */
function esitef_wc_find_cart_item_key( $product_id, $variation_id = 0, $variation = array(), $cart_item_data = array() ) {
	if ( ! function_exists( 'WC' ) || ! WC()->cart ) {
		return '';
	}

	$cart_id = WC()->cart->generate_cart_id( $product_id, $variation_id, $variation, $cart_item_data );
	return WC()->cart->find_product_in_cart( $cart_id );
}

/**
 * PayPal checkout calls add_to_cart again for course products already in cart.
 */
function esitef_wc_skip_sold_individually_duplicate_error( $found_in_cart, $product_id, $variation_id, $cart_item_data, $cart_id ) {
	unset( $cart_item_data, $cart_id );

	if ( $found_in_cart ) {
		return false;
	}

	return $found_in_cart;
}
add_filter( 'woocommerce_add_to_cart_sold_individually_found_in_cart', 'esitef_wc_skip_sold_individually_duplicate_error', 99, 5 );

/**
 * After duplicate merge, cap sold-individually course lines at qty 1 without error.
 */
function esitef_wc_cap_sold_individually_quantity( $cart_item_key, $quantity, $old_quantity ) {
	if ( ! function_exists( 'WC' ) || ! WC()->cart || ! isset( WC()->cart->cart_contents[ $cart_item_key ] ) ) {
		return;
	}

	$item    = WC()->cart->cart_contents[ $cart_item_key ];
	$product = $item['data'] ?? wc_get_product( $item['variation_id'] ? $item['variation_id'] : $item['product_id'] );

	if ( $product && $product->is_sold_individually() && $quantity > 1 ) {
		WC()->cart->set_quantity( $cart_item_key, 1, false );
		wc_clear_notices();
	}
}
add_action( 'woocommerce_after_cart_item_quantity_update', 'esitef_wc_cap_sold_individually_quantity', 10, 3 );

/**
 * Tutor posts add-to-cart to the course URL; send shoppers straight to cart.
 */
function esitef_tutor_add_to_cart_redirect_cart( $url ) {
	if ( function_exists( 'wc_get_cart_url' ) ) {
		return wc_get_cart_url();
	}

	return $url;
}
add_filter( 'tutor_course_add_to_cart_form_action', 'esitef_tutor_add_to_cart_redirect_cart' );
add_filter( 'woocommerce_add_to_cart_redirect', 'esitef_tutor_add_to_cart_redirect_cart' );

/**
 * Course products: allow only one line in cart (Tutor handles enrollment limits).
 */
function esitef_wc_is_tutor_course_product( $product_id ) {
	$product_id = (int) $product_id;
	if ( ! $product_id ) {
		return false;
	}

	if ( get_post_meta( $product_id, '_tutor_product', true ) ) {
		return true;
	}

	$courses = get_posts(
		array(
			'post_type'      => 'courses',
			'post_status'    => 'any',
			'posts_per_page' => 1,
			'fields'         => 'ids',
			'meta_key'       => '_tutor_course_product_id',
			'meta_value'     => $product_id,
		)
	);

	return ! empty( $courses );
}

/**
 * Prevent duplicate add-to-cart query args on checkout/cart (PayPal return).
 */
function esitef_wc_prevent_checkout_duplicate_add_to_cart() {
	if ( is_admin() || ! function_exists( 'WC' ) || ! WC()->cart ) {
		return;
	}

	if ( ! is_cart() && ! is_checkout() ) {
		return;
	}

	// phpcs:ignore WordPress.Security.NonceVerification.Recommended
	if ( empty( $_REQUEST['add-to-cart'] ) ) {
		return;
	}

	// phpcs:ignore WordPress.Security.NonceVerification.Recommended
	$product_id = absint( wp_unslash( $_REQUEST['add-to-cart'] ) );
	if ( ! $product_id || ! esitef_wc_product_in_cart( $product_id ) ) {
		return;
	}

	$target = is_checkout() ? wc_get_checkout_url() : wc_get_cart_url();
	wp_safe_redirect( $target );
	exit;
}
add_action( 'template_redirect', 'esitef_wc_prevent_checkout_duplicate_add_to_cart', 5 );

/**
 * Strip "cannot add another" notices when the product is already in cart (PayPal flow).
 */
function esitef_wc_filter_duplicate_cart_notices( $notices ) {
	if ( empty( $notices['error'] ) || ! function_exists( 'WC' ) || ! WC()->cart ) {
		return $notices;
	}

	$notices['error'] = array_values(
		array_filter(
			$notices['error'],
			function ( $notice ) {
				$text = isset( $notice['notice'] ) ? wp_strip_all_tags( $notice['notice'] ) : '';
				if ( false === stripos( $text, 'cannot add another' ) ) {
					return true;
				}

				return WC()->cart && WC()->cart->get_cart_contents_count() > 0;
			}
		)
	);

	return $notices;
}
add_filter( 'woocommerce_get_notices', 'esitef_wc_filter_duplicate_cart_notices', 99 );
