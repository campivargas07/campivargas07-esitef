<?php
/**
 * WP-CLI: crear productos WooCommerce para formaciones presenciales con planes.
 *
 * Uso (en staging o local):
 *   wp eval-file wp-content/themes/esitef-minimal/deploy/seed-presencial-products.php
 *
 * @package esitef-minimal
 */

if ( ! defined( 'ABSPATH' ) ) {
	// phpcs:ignore WordPress.Security.ValidatedSanitizedInput
	$load = getenv( 'WP_LOAD_PATH' );
	if ( $load && file_exists( $load ) ) {
		require_once $load;
	} else {
		// Typical paths when run via wp eval-file from theme dir.
		$candidates = array(
			dirname( __DIR__, 4 ) . '/wp-load.php',
			dirname( __DIR__, 3 ) . '/wp-load.php',
		);
		foreach ( $candidates as $candidate ) {
			if ( file_exists( $candidate ) ) {
				require_once $candidate;
				break;
			}
		}
	}
}

if ( ! function_exists( 'wc_get_product' ) ) {
	fwrite( STDERR, "WooCommerce no está activo.\n" );
	exit( 1 );
}

require_once dirname( __DIR__ ) . '/inc/presencial-checkout.php';

$instances = array(
	'dolor-y-movimiento-cordoba',
	'pedagogia-aplicada-montevideo',
	'dolor-y-movimiento-arbucies',
	'evaluacion-dinamica-funcional-gdl',
);

$has_subscriptions = class_exists( 'WC_Subscriptions_Product' );
$product_map       = get_option( 'esitef_presencial_wc_products', array() );

foreach ( $instances as $slug ) {
	$config = esitef_get_presencial_checkout_config( $slug );
	if ( ! $config || empty( $config['plans'] ) ) {
		continue;
	}

	$formacion = esitef_get_presencial_by_slug( $slug );
	$title     = $formacion['page_title'] ?? $slug;

	$parent_id = esitef_presencial_get_parent_product_id( $slug );
	$parent    = $parent_id ? wc_get_product( $parent_id ) : null;

	if ( ! $parent ) {
		$has_sub_variation = false;
		foreach ( $config['plans'] as $plan ) {
			if ( ! empty( $plan['subscription'] ) && $has_subscriptions ) {
				$has_sub_variation = true;
				break;
			}
		}

		if ( $has_sub_variation && class_exists( 'WC_Product_Variable_Subscription' ) ) {
			$parent = new WC_Product_Variable_Subscription();
		} else {
			$parent = new WC_Product_Variable();
		}
		$parent->set_name( $title );
		$parent->set_status( 'publish' );
		$parent->set_catalog_visibility( 'hidden' );
		$parent->set_sold_individually( true );
		$parent->set_virtual( true );
		$parent->set_manage_stock( false );
		$parent->update_meta_data( '_esitef_presencial_instance', $slug );
		$parent_id = $parent->save();

		$attribute = new WC_Product_Attribute();
		$attribute->set_name( 'plan' );
		$attribute->set_options( array_keys( $config['plans'] ) );
		$attribute->set_visible( true );
		$attribute->set_variation( true );
		$parent->set_attributes( array( $attribute ) );
		$parent->save();
	}

	$product_map[ $slug ]['_parent'] = $parent_id;

	foreach ( $config['plans'] as $plan_key => $plan ) {
		$existing_variation = esitef_presencial_get_product_id( $slug, $plan_key );
		if ( $existing_variation && wc_get_product( $existing_variation ) ) {
			$product_map[ $slug ][ $plan_key ] = $existing_variation;
			continue;
		}

		$is_subscription = ! empty( $plan['subscription'] ) && $has_subscriptions;

		if ( $is_subscription && class_exists( 'WC_Product_Subscription_Variation' ) ) {
			$variation = new WC_Product_Subscription_Variation();
		} else {
			$variation = new WC_Product_Variation();
		}

		$variation->set_parent_id( $parent_id );
		$variation->set_regular_price( (string) $plan['price'] );
		$variation->set_virtual( true );
		$variation->set_attributes( array( 'plan' => $plan_key ) );
		$variation->update_meta_data( '_esitef_payment_plan', $plan_key );
		$variation->update_meta_data( '_esitef_presencial_instance', $slug );

		if ( $is_subscription ) {
			$variation->update_meta_data( '_subscription_price', (string) $plan['price'] );
			$variation->update_meta_data( '_subscription_period', $plan['billing_period'] ?? 'month' );
			$variation->update_meta_data( '_subscription_period_interval', (string) ( $plan['billing_interval'] ?? 1 ) );
			$variation->update_meta_data( '_subscription_length', (string) ( $plan['billing_length'] ?? 3 ) );
		}

		$variation_id = $variation->save();
		$product_map[ $slug ][ $plan_key ] = $variation_id;

		WP_CLI::log( sprintf( '✓ %s / %s → variation #%d', $slug, $plan_key, $variation_id ) );
	}

	// Sync variable product.
	WC_Product_Variable::sync( $parent_id );
}

update_option( 'esitef_presencial_wc_products', $product_map, false );

if ( class_exists( 'WP_CLI' ) ) {
	WP_CLI::success( 'Productos presenciales creados/actualizados. Mapa guardado en esitef_presencial_wc_products.' );
} else {
	echo "OK — esitef_presencial_wc_products actualizado.\n";
}
