<?php
/**
 * CFDI / fiscal billing hooks — per line item on parent order + renewal orders.
 *
 * Integrate with Facturama, SW, or other emitter via filters.
 *
 * @package esitef-minimal
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Meta key marking CFDI emitted for an order line.
 */
function esitef_cfdi_line_meta_key() {
	return '_esitef_cfdi_emitted';
}

/**
 * Whether CFDI was already emitted for this line.
 *
 * @param WC_Order_Item_Product $item Order line.
 * @return bool
 */
function esitef_cfdi_line_already_emitted( $item ) {
	return (bool) $item->get_meta( esitef_cfdi_line_meta_key(), true );
}

/**
 * Mark line as CFDI emitted.
 *
 * @param WC_Order_Item_Product $item Order line.
 */
function esitef_cfdi_mark_line_emitted( $item ) {
	$item->update_meta_data( esitef_cfdi_line_meta_key(), 'yes' );
	$item->save();
}

/**
 * Emit CFDI for digital / online course line.
 *
 * @param WC_Order              $order Order.
 * @param WC_Order_Item_Product $item  Line item.
 * @return bool
 */
function esitef_cfdi_emit_digital( $order, $item ) {
	/**
	 * Hook for external CFDI emitter — digital goods.
	 *
	 * @param WC_Order              $order Order.
	 * @param WC_Order_Item_Product $item  Line item.
	 */
	return (bool) apply_filters( 'esitef_cfdi_emit_digital', false, $order, $item );
}

/**
 * Emit CFDI for presencial inscription line.
 *
 * @param WC_Order              $order Order.
 * @param WC_Order_Item_Product $item  Line item.
 * @return bool
 */
function esitef_cfdi_emit_presencial( $order, $item ) {
	/**
	 * Hook for external CFDI emitter — presencial inscription / deposit / cuota 1.
	 *
	 * @param WC_Order              $order Order.
	 * @param WC_Order_Item_Product $item  Line item.
	 */
	return (bool) apply_filters( 'esitef_cfdi_emit_presencial', false, $order, $item );
}

/**
 * Emit CFDI for subscription renewal (cuotas 2-3).
 *
 * @param WC_Subscription $subscription Subscription.
 * @param WC_Order        $order        Renewal order.
 * @return bool
 */
function esitef_cfdi_emit_renewal( $subscription, $order ) {
	/**
	 * Hook for external CFDI emitter — installment renewals.
	 *
	 * @param WC_Subscription $subscription Subscription.
	 * @param WC_Order        $order        Renewal order.
	 */
	return (bool) apply_filters( 'esitef_cfdi_emit_renewal', false, $subscription, $order );
}

/**
 * Process parent / standard orders — one CFDI per qualifying line.
 *
 * @param int $order_id Order ID.
 */
function esitef_cfdi_emit_per_line_item( $order_id ) {
	$order = wc_get_order( $order_id );
	if ( ! $order || ! $order->is_paid() ) {
		return;
	}

	foreach ( $order->get_items() as $item ) {
		if ( ! $item instanceof WC_Order_Item_Product || esitef_cfdi_line_already_emitted( $item ) ) {
			continue;
		}

		$product_id = $item->get_product_id();
		$emitted    = false;

		if ( $product_id && function_exists( 'esitef_wc_is_tutor_course_product' ) && esitef_wc_is_tutor_course_product( $product_id ) ) {
			$emitted = esitef_cfdi_emit_digital( $order, $item );
		} elseif ( $item->get_meta( '_esitef_presencial_instance' ) ) {
			$emitted = esitef_cfdi_emit_presencial( $order, $item );
		}

		if ( $emitted ) {
			esitef_cfdi_mark_line_emitted( $item );
		}
	}
}
add_action( 'woocommerce_order_status_completed', 'esitef_cfdi_emit_per_line_item', 20 );
add_action( 'woocommerce_order_status_processing', 'esitef_cfdi_emit_per_line_item', 20 );

/**
 * Renewal payment complete — CFDI for cuota 2 / 3.
 *
 * @param WC_Subscription $subscription Subscription object.
 * @param WC_Order        $order        Renewal order.
 */
function esitef_cfdi_on_renewal_payment_complete( $subscription, $order ) {
	if ( ! $order instanceof WC_Order ) {
		return;
	}

	$emitted = esitef_cfdi_emit_renewal( $subscription, $order );
	if ( $emitted ) {
		$order->update_meta_data( '_esitef_cfdi_renewal_emitted', 'yes' );
		$order->save();
	}
}

if ( function_exists( 'wcs_order_contains_renewal' ) ) {
	add_action( 'woocommerce_subscription_renewal_payment_complete', 'esitef_cfdi_on_renewal_payment_complete', 10, 2 );
}
