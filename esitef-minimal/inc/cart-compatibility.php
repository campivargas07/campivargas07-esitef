<?php
/**
 * Mixed cart (online + presencial) compatibility and fallback checkout chain.
 *
 * @package esitef-minimal
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Cart line type: online | presencial | other.
 *
 * @param array<string, mixed> $cart_item Cart line.
 * @return string
 */
function esitef_cart_line_type( $cart_item ) {
	if ( ! empty( $cart_item['esitef_presencial_instance'] ) ) {
		return 'presencial';
	}
	$product_id = (int) ( $cart_item['product_id'] ?? 0 );
	if ( $product_id && function_exists( 'esitef_wc_is_tutor_course_product' ) && esitef_wc_is_tutor_course_product( $product_id ) ) {
		return 'online';
	}
	return 'other';
}

/**
 * Unique cart line types present.
 *
 * @return string[]
 */
function esitef_cart_get_types() {
	if ( ! function_exists( 'WC' ) || ! WC()->cart || WC()->cart->is_empty() ) {
		return array();
	}

	$types = array();
	foreach ( WC()->cart->get_cart() as $item ) {
		$type = esitef_cart_line_type( $item );
		if ( 'other' !== $type ) {
			$types[ $type ] = true;
		}
	}

	return array_keys( $types );
}

/**
 * Whether cart mixes online and presencial lines.
 */
function esitef_cart_is_mixed() {
	$types = esitef_cart_get_types();
	return in_array( 'online', $types, true ) && in_array( 'presencial', $types, true );
}

/**
 * Detect type of product being added.
 *
 * @param int                  $product_id     Product ID.
 * @param array<string, mixed> $cart_item_data Cart item data.
 * @return string
 */
function esitef_detect_incoming_type( $product_id, $cart_item_data = array() ) {
	if ( ! empty( $cart_item_data['esitef_presencial_instance'] ) ) {
		return 'presencial';
	}
	// phpcs:ignore WordPress.Security.NonceVerification.Recommended
	if ( ! empty( $_REQUEST['esitef_presencial_instance'] ) ) {
		return 'presencial';
	}

	$product_id = (int) $product_id;
	if ( $product_id ) {
		$parent_id = wp_get_post_parent_id( $product_id );
		if ( $parent_id ) {
			$instance = get_post_meta( $parent_id, '_esitef_presencial_instance', true );
			if ( $instance ) {
				return 'presencial';
			}
		}
		$instance = get_post_meta( $product_id, '_esitef_presencial_instance', true );
		if ( $instance ) {
			return 'presencial';
		}
	}

	if ( function_exists( 'esitef_wc_is_tutor_course_product' ) && esitef_wc_is_tutor_course_product( $product_id ) ) {
		return 'online';
	}

	return 'other';
}

/**
 * Whether cart has a presencial subscription plan (3-cuotas).
 */
function esitef_cart_has_presencial_subscription() {
	if ( ! function_exists( 'WC' ) || ! WC()->cart ) {
		return false;
	}
	foreach ( WC()->cart->get_cart() as $item ) {
		if ( empty( $item['esitef_presencial_instance'] ) || empty( $item['esitef_payment_plan'] ) ) {
			continue;
		}
		if ( function_exists( 'esitef_presencial_is_subscription_plan' )
			&& esitef_presencial_is_subscription_plan(
				(string) $item['esitef_presencial_instance'],
				(string) $item['esitef_payment_plan']
			) ) {
			return true;
		}
	}
	return false;
}

/**
 * Gateways that support WCS tokenization for mixed cart renewals.
 *
 * @return string[]
 */
function esitef_mixed_cart_tokenizing_gateways() {
	return apply_filters(
		'esitef_mixed_cart_tokenizing_gateways',
		array( 'stripe', 'stripe_cc', 'woocommerce_payments', 'woo-mercado-pago-custom' )
	);
}

/**
 * Resolve checkout country from cart presencial lines + billing + geo.
 *
 * @return string ISO country code.
 */
function esitef_cart_resolve_checkout_country() {
	if ( function_exists( 'esitef_get_checkout_billing_country' ) ) {
		$billing = esitef_get_checkout_billing_country();
		if ( $billing ) {
			return $billing;
		}
	}

	if ( function_exists( 'WC' ) && WC()->cart ) {
		foreach ( WC()->cart->get_cart() as $item ) {
			if ( empty( $item['esitef_presencial_instance'] ) || ! function_exists( 'esitef_get_presencial_by_slug' ) ) {
				continue;
			}
			$instance = esitef_get_presencial_by_slug( (string) $item['esitef_presencial_instance'] );
			if ( ! $instance || empty( $instance['pais'] ) ) {
				continue;
			}
			$map = array(
				'argentina' => 'AR',
				'mexico'    => 'MX',
				'uruguay'   => 'UY',
				'espana'    => 'ES',
			);
			$pais = (string) $instance['pais'];
			if ( isset( $map[ $pais ] ) ) {
				return $map[ $pais ];
			}
		}
	}

	return function_exists( 'esitef_geo_detect_country' ) ? esitef_geo_detect_country() : 'US';
}

/**
 * Whether mixed online+presencial checkout is allowed.
 *
 * @param array<string, mixed>|null $incoming Optional simulated incoming line.
 * @return bool
 */
function esitef_cart_can_checkout_mixed( $incoming = null ) {
	if ( ! function_exists( 'WC' ) || ! WC()->cart ) {
		return true;
	}

	if ( function_exists( 'esitef_geo_sync_currency_from_cart' ) ) {
		esitef_geo_sync_currency_from_cart();
	}

	$session_currency = function_exists( 'esitef_geo_get_session_currency' )
		? esitef_geo_get_session_currency()
		: ( function_exists( 'get_woocommerce_currency' ) ? get_woocommerce_currency() : 'USD' );

	$lines = WC()->cart->get_cart();
	if ( $incoming ) {
		$lines['__incoming__'] = $incoming;
	}

	$types = array();
	foreach ( $lines as $item ) {
		$type = esitef_cart_line_type( $item );
		if ( 'other' !== $type ) {
			$types[ $type ] = true;
		}
	}

	if ( ! isset( $types['online'] ) || ! isset( $types['presencial'] ) ) {
		return true;
	}

	if ( function_exists( 'esitef_online_only_sales' ) && esitef_online_only_sales() ) {
		return false;
	}

	// Local dev: allow mixed cart for QA (COD / Stripe test).
	if ( function_exists( 'esitef_is_local_dev' ) && esitef_is_local_dev() ) {
		return (bool) apply_filters( 'esitef_cart_can_checkout_mixed', true, $lines, $session_currency );
	}

	foreach ( $lines as $item ) {
		$type = esitef_cart_line_type( $item );
		// Online courses are priced in store base currency and converted at totals.
		if ( 'online' === $type ) {
			continue;
		}
		if ( function_exists( 'esitef_geo_cart_line_currency' ) ) {
			$line_currency = esitef_geo_cart_line_currency( $item );
			if ( $line_currency !== $session_currency ) {
				return false;
			}
		}
	}

	$has_subscription = esitef_cart_has_presencial_subscription();
	if ( $incoming && ! empty( $incoming['esitef_presencial_instance'] ) && ! empty( $incoming['esitef_payment_plan'] ) ) {
		if ( function_exists( 'esitef_presencial_is_subscription_plan' )
			&& esitef_presencial_is_subscription_plan(
				(string) $incoming['esitef_presencial_instance'],
				(string) $incoming['esitef_payment_plan']
			) ) {
			$has_subscription = true;
		}
	}

	if ( $has_subscription ) {
		$country = esitef_cart_resolve_checkout_country();
		if ( 'AR' === $country ) {
			$mp_ok = (bool) apply_filters( 'esitef_mixed_cart_mercadopago_subscriptions_ok', false, $country );
			if ( ! $mp_ok ) {
				return false;
			}
		}
	}

	return (bool) apply_filters( 'esitef_cart_can_checkout_mixed', true, $lines, $session_currency );
}

/**
 * Build incoming cart item data for validation simulation.
 *
 * @param int $product_id     Product ID.
 * @param int $variation_id   Variation ID.
 * @return array<string, mixed>
 */
function esitef_build_incoming_cart_item_data( $product_id, $variation_id = 0 ) {
	$data = array(
		'product_id' => (int) $product_id,
	);

	// phpcs:ignore WordPress.Security.NonceVerification.Recommended
	if ( ! empty( $_REQUEST['esitef_presencial_instance'] ) ) {
		$data['esitef_presencial_instance'] = sanitize_key( wp_unslash( $_REQUEST['esitef_presencial_instance'] ) );
	}
	// phpcs:ignore WordPress.Security.NonceVerification.Recommended
	if ( ! empty( $_REQUEST['esitef_payment_plan'] ) ) {
		$data['esitef_payment_plan'] = sanitize_key( wp_unslash( $_REQUEST['esitef_payment_plan'] ) );
	}

	if ( $variation_id ) {
		$plan = get_post_meta( (int) $variation_id, '_esitef_payment_plan', true );
		if ( $plan ) {
			$data['esitef_payment_plan'] = sanitize_key( (string) $plan );
		}
		$instance = get_post_meta( (int) $variation_id, '_esitef_presencial_instance', true );
		if ( $instance ) {
			$data['esitef_presencial_instance'] = sanitize_key( (string) $instance );
		}
	}

	return $data;
}

/**
 * User meta key for deferred purchase.
 */
function esitef_pending_purchase_meta_key() {
	return 'esitef_pending_purchase';
}

/**
 * Stash incoming product for chained checkout.
 *
 * @param int                  $product_id     Product ID.
 * @param int                  $variation_id   Variation ID.
 * @param array<string, mixed> $cart_item_data Cart meta.
 */
function esitef_stash_pending_purchase( $product_id, $variation_id = 0, $cart_item_data = array() ) {
	if ( ! is_user_logged_in() ) {
		return;
	}

	$payload = array(
		'product_id'     => (int) $product_id,
		'variation_id'   => (int) $variation_id,
		'cart_item_data' => $cart_item_data,
		'created_at'     => time(),
		'label'          => '',
	);

	$product = wc_get_product( $variation_id ? $variation_id : $product_id );
	if ( $product ) {
		$payload['label'] = $product->get_name();
	}

	update_user_meta( get_current_user_id(), esitef_pending_purchase_meta_key(), $payload );
}

/**
 * Get stashed pending purchase.
 *
 * @return array<string, mixed>|null
 */
function esitef_get_pending_purchase() {
	if ( ! is_user_logged_in() ) {
		return null;
	}
	$raw = get_user_meta( get_current_user_id(), esitef_pending_purchase_meta_key(), true );
	return is_array( $raw ) ? $raw : null;
}

/**
 * Restore pending purchase into cart.
 *
 * @return bool
 */
function esitef_restore_pending_purchase() {
	$pending = esitef_get_pending_purchase();
	if ( ! $pending || empty( $pending['product_id'] ) || ! function_exists( 'WC' ) || ! WC()->cart ) {
		return false;
	}

	$product_id     = (int) $pending['product_id'];
	$variation_id   = (int) ( $pending['variation_id'] ?? 0 );
	$cart_item_data = is_array( $pending['cart_item_data'] ?? null ) ? $pending['cart_item_data'] : array();

	$key = WC()->cart->add_to_cart( $product_id, 1, $variation_id, array(), $cart_item_data );
	if ( $key ) {
		delete_user_meta( get_current_user_id(), esitef_pending_purchase_meta_key() );
		return true;
	}

	return false;
}

/**
 * Conflict message for notices / modal.
 *
 * @return string
 */
function esitef_cart_conflict_message() {
	return __( 'Los cursos online y presenciales usan formas de pago distintas. Completa tu compra actual o reemplaza el carrito para continuar.', 'esitef-minimal' );
}

/**
 * Validate add-to-cart: allow mixed when viable, else block and stash.
 *
 * @param bool                 $passed         Validation result.
 * @param int                  $product_id     Product ID.
 * @param int                  $quantity       Quantity.
 * @param int                  $variation_id   Variation ID.
 * @param array<string, mixed> $cart_item_data Cart item data.
 * @return bool
 */
function esitef_validate_cart_compatibility( $passed, $product_id, $quantity, $variation_id = 0, $cart_item_data = array() ) {
	unset( $quantity );

	if ( ! $passed || ! function_exists( 'WC' ) || ! WC()->cart ) {
		return $passed;
	}

	// phpcs:ignore WordPress.Security.NonceVerification.Recommended
	if ( ! empty( $_REQUEST['esitef_replace_cart'] ) && '1' === (string) wp_unslash( $_REQUEST['esitef_replace_cart'] ) ) {
		WC()->cart->empty_cart();
		return $passed;
	}

	if ( WC()->cart->is_empty() ) {
		return $passed;
	}

	if ( function_exists( 'esitef_geo_sync_currency_from_cart' ) ) {
		esitef_geo_sync_currency_from_cart();
	}

	$incoming_type = esitef_detect_incoming_type( $product_id, $cart_item_data );
	$cart_types    = esitef_cart_get_types();

	if ( ! $incoming_type || 'other' === $incoming_type || ! $cart_types ) {
		return $passed;
	}

	if ( in_array( $incoming_type, $cart_types, true ) ) {
		return $passed;
	}

	$incoming_line = array_merge(
		esitef_build_incoming_cart_item_data( $product_id, $variation_id ),
		$cart_item_data
	);

	if ( esitef_cart_can_checkout_mixed( $incoming_line ) ) {
		return $passed;
	}

	esitef_stash_pending_purchase( $product_id, $variation_id, $cart_item_data );

	if ( ! wp_doing_ajax() ) {
		wc_add_notice( esitef_cart_conflict_message(), 'notice' );
	}

	return false;
}
add_filter( 'woocommerce_add_to_cart_validation', 'esitef_validate_cart_compatibility', 20, 5 );

/**
 * Human-readable reason when mixed checkout is blocked (cart page notice).
 */
function esitef_cart_mixed_block_reason() {
	if ( ! esitef_cart_is_mixed() || esitef_cart_can_checkout_mixed() ) {
		return '';
	}

	if ( esitef_cart_has_presencial_subscription() ) {
		$country = esitef_cart_resolve_checkout_country();
		if ( 'AR' === $country ) {
			return __( 'En Argentina, el plan de 3 cuotas con Mercado Pago no se puede combinar con cursos online en un solo pago. Completa una compra a la vez o elige reserva / pago completo.', 'esitef-minimal' );
		}
	}

	return __( 'No puedes pagar cursos online y presenciales juntos con la configuración actual. Completa una compra a la vez.', 'esitef-minimal' );
}

/**
 * Block incompatible mixed cart at checkout.
 */
function esitef_block_mixed_cart_at_checkout() {
	if ( ! esitef_cart_is_mixed() || esitef_cart_can_checkout_mixed() ) {
		return;
	}

	$message = esitef_cart_mixed_block_reason();
	if ( $message ) {
		wc_add_notice( $message, 'error' );
	}
}
add_action( 'woocommerce_check_cart_items', 'esitef_block_mixed_cart_at_checkout' );

/**
 * Redirect incompatible mixed cart away from checkout.
 */
function esitef_redirect_mixed_cart_to_cart_page() {
	if ( ! function_exists( 'is_checkout' ) || ! is_checkout() || is_wc_endpoint_url( 'order-received' ) ) {
		return;
	}
	if ( ! esitef_cart_is_mixed() || esitef_cart_can_checkout_mixed() ) {
		return;
	}
	if ( ! function_exists( 'wc_get_cart_url' ) ) {
		return;
	}
	$message = esitef_cart_mixed_block_reason();
	if ( $message ) {
		wc_add_notice( $message, 'error' );
	}
	wp_safe_redirect( wc_get_cart_url() );
	exit;
}
add_action( 'template_redirect', 'esitef_redirect_mixed_cart_to_cart_page', 6 );

/**
 * Restore pending purchase via query arg.
 */
function esitef_handle_restore_pending_purchase() {
	// phpcs:ignore WordPress.Security.NonceVerification.Recommended
	if ( empty( $_GET['esitef_restore_pending'] ) || ! is_user_logged_in() ) {
		return;
	}
	// phpcs:ignore WordPress.Security.NonceVerification.Recommended
	if ( empty( $_GET['_wpnonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_GET['_wpnonce'] ) ), 'esitef_restore_pending' ) ) {
		return;
	}

	if ( esitef_restore_pending_purchase() && function_exists( 'wc_get_cart_url' ) ) {
		wp_safe_redirect( wc_get_cart_url() );
		exit;
	}
}
add_action( 'template_redirect', 'esitef_handle_restore_pending_purchase', 7 );

/**
 * AJAX: check cart conflict before navigating to add-to-cart URL.
 */
function esitef_ajax_cart_conflict_check() {
	check_ajax_referer( 'esitef_checkout', 'nonce' );

	$product_id   = isset( $_POST['product_id'] ) ? absint( $_POST['product_id'] ) : 0;
	$variation_id = isset( $_POST['variation_id'] ) ? absint( $_POST['variation_id'] ) : 0;

	if ( ! $product_id || ! function_exists( 'WC' ) || ! WC()->cart || WC()->cart->is_empty() ) {
		wp_send_json_success( array( 'conflict' => false ) );
	}

	if ( function_exists( 'esitef_geo_sync_currency_from_cart' ) ) {
		esitef_geo_sync_currency_from_cart();
	}

	$incoming_type = esitef_detect_incoming_type( $product_id, esitef_build_incoming_cart_item_data( $product_id, $variation_id ) );
	$cart_types    = esitef_cart_get_types();

	if ( ! $incoming_type || 'other' === $incoming_type || in_array( $incoming_type, $cart_types, true ) ) {
		wp_send_json_success( array( 'conflict' => false ) );
	}

	$incoming_line = esitef_build_incoming_cart_item_data( $product_id, $variation_id );
	$can_mix       = esitef_cart_can_checkout_mixed( $incoming_line );

	if ( $can_mix ) {
		wp_send_json_success( array( 'conflict' => false, 'mixed_allowed' => true ) );
	}

	$cart_url     = function_exists( 'wc_get_cart_url' ) ? wc_get_cart_url() : '';
	$checkout_url = function_exists( 'wc_get_checkout_url' ) ? wc_get_checkout_url() : '';

	wp_send_json_success(
		array(
			'conflict'     => true,
			'message'      => esitef_cart_conflict_message(),
			'cartUrl'      => $cart_url,
			'checkoutUrl'  => $checkout_url,
			'canSave'      => is_user_logged_in(),
			'productId'    => $product_id,
			'variationId'  => $variation_id,
		)
	);
}
add_action( 'wp_ajax_esitef_cart_conflict_check', 'esitef_ajax_cart_conflict_check' );
add_action( 'wp_ajax_nopriv_esitef_cart_conflict_check', 'esitef_ajax_cart_conflict_check' );

/**
 * AJAX: stash pending purchase without adding to cart.
 */
function esitef_ajax_cart_stash_pending() {
	check_ajax_referer( 'esitef_checkout', 'nonce' );

	if ( ! is_user_logged_in() ) {
		wp_send_json_error( array( 'message' => __( 'Debes iniciar sesión.', 'esitef-minimal' ) ) );
	}

	$product_id   = isset( $_POST['product_id'] ) ? absint( $_POST['product_id'] ) : 0;
	$variation_id = isset( $_POST['variation_id'] ) ? absint( $_POST['variation_id'] ) : 0;

	if ( ! $product_id ) {
		wp_send_json_error();
	}

	$cart_item_data = esitef_build_incoming_cart_item_data( $product_id, $variation_id );
	esitef_stash_pending_purchase( $product_id, $variation_id, $cart_item_data );

	wp_send_json_success( array( 'cartUrl' => function_exists( 'wc_get_cart_url' ) ? wc_get_cart_url() : '' ) );
}
add_action( 'wp_ajax_esitef_cart_stash_pending', 'esitef_ajax_cart_stash_pending' );

/**
 * Thank-you CTA for chained checkout.
 *
 * @param int $order_id Order ID.
 */
function esitef_offer_pending_purchase_cta( $order_id ) {
	$pending = esitef_get_pending_purchase();
	if ( ! $pending || empty( $pending['label'] ) ) {
		return;
	}

	$restore_url = wp_nonce_url(
		add_query_arg( 'esitef_restore_pending', '1', home_url( '/' ) ),
		'esitef_restore_pending'
	);
	?>
	<div class="checkout-thankyou-pending esitef-module-card">
		<h3><?php esc_html_e( '¿Continuar con tu siguiente compra?', 'esitef-minimal' ); ?></h3>
		<p><?php echo esc_html( sprintf(
			/* translators: %s: product name */
			__( 'Tienes pendiente: %s', 'esitef-minimal' ),
			(string) $pending['label']
		) ); ?></p>
		<a class="checkout-btn checkout-btn--primary" href="<?php echo esc_url( $restore_url ); ?>">
			<?php esc_html_e( 'Continuar inscripción', 'esitef-minimal' ); ?>
		</a>
	</div>
	<?php
}
add_action( 'woocommerce_thankyou', 'esitef_offer_pending_purchase_cta', 5 );

/**
 * All presencial lines in cart.
 *
 * @return array<int, array<string, mixed>>
 */
function esitef_cart_get_presencial_lines() {
	if ( ! function_exists( 'WC' ) || ! WC()->cart ) {
		return array();
	}
	$lines = array();
	foreach ( WC()->cart->get_cart() as $key => $item ) {
		if ( ! empty( $item['esitef_presencial_instance'] ) ) {
			$lines[] = array_merge( $item, array( 'cart_key' => $key ) );
		}
	}
	return $lines;
}

/**
 * All online lines in cart.
 *
 * @return array<int, array<string, mixed>>
 */
function esitef_cart_get_online_lines() {
	if ( ! function_exists( 'WC' ) || ! WC()->cart ) {
		return array();
	}
	$lines = array();
	foreach ( WC()->cart->get_cart() as $key => $item ) {
		if ( 'online' === esitef_cart_line_type( $item ) ) {
			$lines[] = array_merge( $item, array( 'cart_key' => $key ) );
		}
	}
	return $lines;
}

/**
 * Checkout total label for mixed / presencial carts.
 */
function esitef_cart_total_label() {
	if ( esitef_cart_is_mixed() || ! empty( esitef_cart_get_presencial_lines() ) ) {
		return __( 'Total hoy', 'esitef-minimal' );
	}
	return __( 'Total', 'esitef-minimal' );
}

/**
 * Enqueue cart guard script on course / presencial pages and cart.
 */
function esitef_cart_guard_enqueue() {
	$load = is_cart()
		|| is_singular( 'courses' )
		|| is_page_template( 'page-templates/page-presencial.php' )
		|| is_page_template( 'page-templates/page-formacion-hub.php' );

	if ( ! $load ) {
		return;
	}

	$uri = get_template_directory_uri();
	$ver = ESITEF_MINIMAL_VERSION;

	wp_enqueue_style(
		'esitef-checkout',
		$uri . '/assets/css/pages/checkout.css',
		array( 'esitef-minimal-style' ),
		$ver
	);

	wp_enqueue_script(
		'esitef-cart-guard',
		$uri . '/assets/js/cart-guard.js',
		array(),
		$ver,
		true
	);

	wp_localize_script(
		'esitef-cart-guard',
		'esitefCartGuard',
		array(
			'ajaxUrl'     => admin_url( 'admin-ajax.php' ),
			'nonce'       => wp_create_nonce( 'esitef_checkout' ),
			'cartUrl'     => function_exists( 'wc_get_cart_url' ) ? wc_get_cart_url() : '',
			'checkoutUrl' => function_exists( 'wc_get_checkout_url' ) ? wc_get_checkout_url() : '',
			'strings'     => array(
				'title'    => __( 'Formas de pago distintas', 'esitef-minimal' ),
				'complete' => __( 'Completar compra actual', 'esitef-minimal' ),
				'replace'  => __( 'Reemplazar carrito', 'esitef-minimal' ),
				'save'     => __( 'Guardar y continuar después', 'esitef-minimal' ),
				'cancel'   => __( 'Cancelar', 'esitef-minimal' ),
			),
		)
	);
}
add_action( 'wp_enqueue_scripts', 'esitef_cart_guard_enqueue', 35 );
