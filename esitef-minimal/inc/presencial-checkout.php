<?php
/**
 * Presencial courses — WooCommerce plans, cart meta, subscriptions.
 *
 * @package esitef-minimal
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Plan keys used across presencial checkout.
 */
function esitef_presencial_plan_keys() {
	return array( 'reserva', '3-cuotas', 'completo' );
}

/**
 * Payment plan definitions per instance (amounts for display + WC seeding).
 *
 * @param string $instance_slug Page slug.
 * @return array<string, mixed>|null
 */
function esitef_get_presencial_checkout_config( $instance_slug ) {
	$configs = array(
		'dolor-y-movimiento-cordoba' => array(
			'checkout_enabled' => true,
			'currency'         => 'ARS',
			'default_plan'     => '3-cuotas',
			'plans'            => array(
				'reserva'    => array(
					'name'           => __( 'Reserva', 'esitef-minimal' ),
					'price'          => 100000,
					'amount_display' => '$100.000 ARS',
					'period'         => __( 'Hoy: depósito · Resto: $350 USD en sede', 'esitef-minimal' ),
					'features'       => array(
						__( 'Reserva tu plaza', 'esitef-minimal' ),
						__( 'Saldo en el día del curso', 'esitef-minimal' ),
					),
					'subscription'   => false,
				),
				'3-cuotas'   => array(
					'name'           => __( '3 cuotas mensuales', 'esitef-minimal' ),
					'price'          => 150000,
					'amount_display' => '3 × $150.000 ARS',
					'period'         => __( 'Cobro hoy: 1ª cuota', 'esitef-minimal' ),
					'highlight'      => true,
					'features'       => array(
						__( 'Cuotas 2 y 3 automáticas cada 30 días', 'esitef-minimal' ),
						__( 'Total: $450.000 ARS', 'esitef-minimal' ),
					),
					'subscription'   => true,
					'billing_period' => 'month',
					'billing_interval' => 1,
					'billing_length' => 3,
				),
				'completo'   => array(
					'name'           => __( 'Pago completo', 'esitef-minimal' ),
					'price'          => 400000,
					'amount_display' => '$400.000 ARS',
					'period'         => __( '5% de ahorro vs cuotas', 'esitef-minimal' ),
					'features'       => array(
						__( 'Inscripción completa', 'esitef-minimal' ),
						__( 'Sin cuotas pendientes', 'esitef-minimal' ),
					),
					'subscription'   => false,
				),
			),
		),
		'pedagogia-aplicada-montevideo' => array(
			'checkout_enabled' => true,
			'currency'         => 'USD',
			'default_plan'     => '3-cuotas',
			'plans'            => array(
				'reserva'    => array(
					'name'           => __( 'Reserva', 'esitef-minimal' ),
					'price'          => 100,
					'amount_display' => '100 USD',
					'period'         => __( 'Saldo según tarifa vigente en sede', 'esitef-minimal' ),
					'features'       => array( __( 'Reserva tu plaza', 'esitef-minimal' ) ),
					'subscription'   => false,
				),
				'3-cuotas'   => array(
					'name'           => __( '3 cuotas mensuales', 'esitef-minimal' ),
					'price'          => 125,
					'amount_display' => '3 × 125 USD',
					'period'         => __( 'Cobro hoy: 1ª cuota', 'esitef-minimal' ),
					'highlight'      => true,
					'features'       => array(
						__( 'Cuotas 2 y 3 automáticas', 'esitef-minimal' ),
						__( 'Total: 375 USD', 'esitef-minimal' ),
					),
					'subscription'   => true,
					'billing_period' => 'month',
					'billing_interval' => 1,
					'billing_length' => 3,
				),
				'completo'   => array(
					'name'           => __( 'Pago completo', 'esitef-minimal' ),
					'price'          => 325,
					'amount_display' => '325 USD',
					'period'         => __( 'Pronto pago', 'esitef-minimal' ),
					'features'       => array( __( 'Inscripción completa', 'esitef-minimal' ) ),
					'subscription'   => false,
				),
			),
		),
		'dolor-y-movimiento-arbucies' => array(
			'checkout_enabled' => true,
			'currency'         => 'EUR',
			'default_plan'     => 'completo',
			'plans'            => array(
				'reserva'    => array(
					'name'           => __( 'Reserva', 'esitef-minimal' ),
					'price'          => 100,
					'amount_display' => '100 EUR',
					'period'         => __( '+ 325 EUR día del curso', 'esitef-minimal' ),
					'features'       => array( __( 'Reserva tu plaza', 'esitef-minimal' ) ),
					'subscription'   => false,
				),
				'3-cuotas'   => array(
					'name'           => __( '3 cuotas mensuales', 'esitef-minimal' ),
					'price'          => 142,
					'amount_display' => '3 × 142 EUR',
					'period'         => __( 'Cobro hoy: 1ª cuota', 'esitef-minimal' ),
					'highlight'      => true,
					'features'       => array( __( 'Cuotas automáticas', 'esitef-minimal' ) ),
					'subscription'   => true,
					'billing_period' => 'month',
					'billing_interval' => 1,
					'billing_length' => 3,
				),
				'completo'   => array(
					'name'           => __( 'Pago completo', 'esitef-minimal' ),
					'price'          => 425,
					'amount_display' => '425 EUR',
					'period'         => __( 'Inscripción completa', 'esitef-minimal' ),
					'features'       => array( __( 'Sin cuotas pendientes', 'esitef-minimal' ) ),
					'subscription'   => false,
				),
			),
		),
		'evaluacion-dinamica-funcional-gdl' => array(
			'checkout_enabled' => true,
			'currency'         => 'MXN',
			'default_plan'     => 'completo',
			'plans'            => array(
				'reserva'    => array(
					'name'           => __( 'Reserva', 'esitef-minimal' ),
					'price'          => 1000,
					'amount_display' => '$1.000 MXN',
					'period'         => __( '+ $4.900 MXN día del curso', 'esitef-minimal' ),
					'features'       => array( __( 'Reserva tu plaza', 'esitef-minimal' ) ),
					'subscription'   => false,
				),
				'3-cuotas'   => array(
					'name'           => __( '3 cuotas mensuales', 'esitef-minimal' ),
					'price'          => 1967,
					'amount_display' => '3 × $1.967 MXN',
					'period'         => __( 'Cobro hoy: 1ª cuota', 'esitef-minimal' ),
					'highlight'      => true,
					'features'       => array( __( 'Total: $5.900 MXN', 'esitef-minimal' ) ),
					'subscription'   => true,
					'billing_period' => 'month',
					'billing_interval' => 1,
					'billing_length' => 3,
				),
				'completo'   => array(
					'name'           => __( 'Pago completo', 'esitef-minimal' ),
					'price'          => 5900,
					'amount_display' => '$5.900 MXN',
					'period'         => __( 'Inscripción completa', 'esitef-minimal' ),
					'features'       => array( __( 'Sin cuotas pendientes', 'esitef-minimal' ) ),
					'subscription'   => false,
				),
			),
		),
	);

	$config = isset( $configs[ $instance_slug ] ) ? $configs[ $instance_slug ] : null;
	return apply_filters( 'esitef_presencial_checkout_config', $config, $instance_slug );
}

/**
 * Whether instance supports online checkout.
 */
function esitef_presencial_checkout_enabled( $instance_slug ) {
	$config = esitef_get_presencial_checkout_config( $instance_slug );
	return is_array( $config ) && ! empty( $config['checkout_enabled'] );
}

/**
 * Stored WC product map: option esitef_presencial_wc_products[slug][plan] => variation_id.
 *
 * @param string $instance_slug Instance slug.
 * @param string $plan_key      Plan key.
 * @return int Variation or simple product ID.
 */
function esitef_presencial_get_product_id( $instance_slug, $plan_key ) {
	$map = get_option( 'esitef_presencial_wc_products', array() );
	if ( isset( $map[ $instance_slug ][ $plan_key ] ) ) {
		return (int) $map[ $instance_slug ][ $plan_key ];
	}
	return 0;
}

/**
 * Parent variable product ID for an instance.
 */
function esitef_presencial_get_parent_product_id( $instance_slug ) {
	$map = get_option( 'esitef_presencial_wc_products', array() );
	if ( isset( $map[ $instance_slug ]['_parent'] ) ) {
		return (int) $map[ $instance_slug ]['_parent'];
	}
	return 0;
}

/**
 * Add-to-cart URL for presencial instance + plan.
 */
function esitef_presencial_get_add_to_cart_url( $instance_slug, $plan_key = '' ) {
	$config = esitef_get_presencial_checkout_config( $instance_slug );
	if ( ! $config ) {
		return '';
	}

	if ( '' === $plan_key ) {
		$plan_key = isset( $config['default_plan'] ) ? (string) $config['default_plan'] : '3-cuotas';
	}

	$variation_id = esitef_presencial_get_product_id( $instance_slug, $plan_key );
	$parent_id    = esitef_presencial_get_parent_product_id( $instance_slug );

	if ( ! $variation_id && ! $parent_id ) {
		return '';
	}

	$product_id = $parent_id ? $parent_id : $variation_id;
	$args       = array(
		'add-to-cart'                 => $product_id,
		'esitef_presencial_instance'  => $instance_slug,
		'esitef_payment_plan'         => $plan_key,
	);

	if ( $variation_id ) {
		$args['variation_id'] = $variation_id;
	}

	return add_query_arg( $args, wc_get_cart_url() );
}

/**
 * Persist presencial meta in cart.
 */
function esitef_presencial_add_cart_item_data( $cart_item_data, $product_id, $variation_id ) {
	// phpcs:ignore WordPress.Security.NonceVerification.Recommended
	if ( empty( $_REQUEST['esitef_presencial_instance'] ) ) {
		return $cart_item_data;
	}

	// phpcs:ignore WordPress.Security.NonceVerification.Recommended
	$instance = sanitize_key( wp_unslash( $_REQUEST['esitef_presencial_instance'] ) );
	// phpcs:ignore WordPress.Security.NonceVerification.Recommended
	$plan = isset( $_REQUEST['esitef_payment_plan'] ) ? sanitize_key( wp_unslash( $_REQUEST['esitef_payment_plan'] ) ) : '';

	if ( ! esitef_presencial_checkout_enabled( $instance ) ) {
		return $cart_item_data;
	}

	$cart_item_data['esitef_presencial_instance'] = $instance;
	$cart_item_data['esitef_payment_plan']        = $plan;
	$cart_item_data['unique_key']                 = md5( $instance . '|' . $plan . '|' . $variation_id );

	return $cart_item_data;
}
add_filter( 'woocommerce_add_cart_item_data', 'esitef_presencial_add_cart_item_data', 10, 3 );

/**
 * Display plan in cart / checkout line item.
 */
function esitef_presencial_get_cart_item_data( $item_data, $cart_item ) {
	if ( empty( $cart_item['esitef_payment_plan'] ) || empty( $cart_item['esitef_presencial_instance'] ) ) {
		return $item_data;
	}

	$config = esitef_get_presencial_checkout_config( (string) $cart_item['esitef_presencial_instance'] );
	$plan   = (string) $cart_item['esitef_payment_plan'];
	$label  = $plan;

	if ( $config && isset( $config['plans'][ $plan ]['name'] ) ) {
		$label = (string) $config['plans'][ $plan ]['name'];
	}

	$item_data[] = array(
		'key'   => __( 'Plan de pago', 'esitef-minimal' ),
		'value' => $label,
	);

	$item_data[] = array(
		'key'   => __( 'Modalidad', 'esitef-minimal' ),
		'value' => __( 'Presencial', 'esitef-minimal' ),
	);

	return $item_data;
}
add_filter( 'woocommerce_get_item_data', 'esitef_presencial_get_cart_item_data', 10, 2 );

/**
 * Save order line meta.
 */
function esitef_presencial_checkout_create_order_line_item( $item, $cart_item_key, $values, $order ) {
	unset( $cart_item_key, $order );

	if ( ! empty( $values['esitef_presencial_instance'] ) ) {
		$item->add_meta_data( '_esitef_presencial_instance', sanitize_key( $values['esitef_presencial_instance'] ), true );
	}
	if ( ! empty( $values['esitef_payment_plan'] ) ) {
		$item->add_meta_data( '_esitef_payment_plan', sanitize_key( $values['esitef_payment_plan'] ), true );
	}
}
add_action( 'woocommerce_checkout_create_order_line_item', 'esitef_presencial_checkout_create_order_line_item', 10, 4 );

/**
 * Only one presencial line per instance in cart.
 */
function esitef_presencial_replace_cart_line( $cart_item_key, $product_id, $quantity, $variation_id, $variation, $cart_item_data ) {
	unset( $product_id, $quantity, $variation_id, $variation );

	if ( empty( $cart_item_data['esitef_presencial_instance'] ) || ! function_exists( 'WC' ) || ! WC()->cart ) {
		return $cart_item_key;
	}

	$instance = (string) $cart_item_data['esitef_presencial_instance'];

	foreach ( WC()->cart->get_cart() as $key => $item ) {
		if ( $key === $cart_item_key ) {
			continue;
		}
		if ( ! empty( $item['esitef_presencial_instance'] ) && $item['esitef_presencial_instance'] === $instance ) {
			WC()->cart->remove_cart_item( $key );
		}
	}

	return $cart_item_key;
}
add_filter( 'woocommerce_add_to_cart', 'esitef_presencial_replace_cart_line', 10, 6 );

/**
 * AJAX: switch presencial plan in cart.
 */
function esitef_ajax_presencial_switch_plan() {
	check_ajax_referer( 'esitef_checkout', 'nonce' );

	$instance = isset( $_POST['instance'] ) ? sanitize_key( wp_unslash( $_POST['instance'] ) ) : '';
	$plan     = isset( $_POST['plan'] ) ? sanitize_key( wp_unslash( $_POST['plan'] ) ) : '';

	if ( ! $instance || ! $plan || ! esitef_presencial_checkout_enabled( $instance ) ) {
		wp_send_json_error( array( 'message' => __( 'Plan no válido.', 'esitef-minimal' ) ), 400 );
	}

	$variation_id = esitef_presencial_get_product_id( $instance, $plan );
	$parent_id    = esitef_presencial_get_parent_product_id( $instance );

	if ( ! $variation_id && ! $parent_id ) {
		wp_send_json_error( array( 'message' => __( 'Producto no configurado. Ejecuta el seed en WP Admin.', 'esitef-minimal' ) ), 400 );
	}

	if ( function_exists( 'WC' ) && WC()->cart ) {
		foreach ( WC()->cart->get_cart() as $key => $item ) {
			if ( ! empty( $item['esitef_presencial_instance'] ) && $item['esitef_presencial_instance'] === $instance ) {
				WC()->cart->remove_cart_item( $key );
			}
		}
	}

	$product_id = $parent_id ? $parent_id : $variation_id;
	$cart_key   = WC()->cart->add_to_cart(
		$product_id,
		1,
		$variation_id ? $variation_id : 0,
		array(),
		array(
			'esitef_presencial_instance' => $instance,
			'esitef_payment_plan'        => $plan,
			'unique_key'                 => md5( $instance . '|' . $plan . '|' . $variation_id ),
		)
	);

	if ( ! $cart_key ) {
		wp_send_json_error( array( 'message' => __( 'No se pudo actualizar el carrito.', 'esitef-minimal' ) ), 500 );
	}

	wp_send_json_success( array( 'redirect' => wc_get_cart_url() ) );
}
add_action( 'wp_ajax_esitef_presencial_switch_plan', 'esitef_ajax_presencial_switch_plan' );
add_action( 'wp_ajax_nopriv_esitef_presencial_switch_plan', 'esitef_ajax_presencial_switch_plan' );

/**
 * Require phone for presencial checkout.
 */
function esitef_presencial_require_billing_phone( $fields ) {
	if ( ! function_exists( 'WC' ) || ! WC()->cart ) {
		return $fields;
	}

	foreach ( WC()->cart->get_cart() as $item ) {
		if ( ! empty( $item['esitef_presencial_instance'] ) ) {
			if ( isset( $fields['billing']['billing_phone'] ) ) {
				$fields['billing']['billing_phone']['required'] = true;
			}
			break;
		}
	}

	return $fields;
}
add_filter( 'woocommerce_checkout_fields', 'esitef_presencial_require_billing_phone' );

/**
 * Thank-you page: plan-specific messaging.
 *
 * @param WC_Order $order Order.
 * @return array<string, string>|null
 */
function esitef_get_presencial_thankyou_notice( $order ) {
	if ( ! $order instanceof WC_Order ) {
		return null;
	}

	foreach ( $order->get_items() as $item ) {
		$instance = $item->get_meta( '_esitef_presencial_instance' );
		$plan     = $item->get_meta( '_esitef_payment_plan' );
		if ( ! $instance || ! $plan ) {
			continue;
		}

		$config = esitef_get_presencial_checkout_config( $instance );
		$plan_data = $config['plans'][ $plan ] ?? array();

		if ( 'reserva' === $plan ) {
			return array(
				'type'    => 'info',
				'message' => __( 'Has reservado tu plaza. Recuerda completar el pago restante según las condiciones del curso.', 'esitef-minimal' ),
			);
		}

		if ( '3-cuotas' === $plan ) {
			$dates = array();
			for ( $i = 1; $i <= 3; $i++ ) {
				$dates[] = array(
					'label' => sprintf(
						/* translators: %d: installment number */
						__( 'Cuota %d', 'esitef-minimal' ),
						$i
					),
					'date'  => 1 === $i ? __( 'Hoy ✓', 'esitef-minimal' ) : gmdate( 'd M Y', strtotime( '+' . ( $i - 1 ) . ' month' ) ),
					'done'  => 1 === $i,
				);
			}
			return array(
				'type'    => 'installments',
				'message' => __( 'Tu primera cuota fue procesada. Las siguientes se cobrarán automáticamente cada 30 días.', 'esitef-minimal' ),
				'dates'   => $dates,
				'plan'    => $plan_data['name'] ?? $plan,
			);
		}

		return array(
			'type'    => 'success',
			'message' => __( '¡Inscripción completa! Te enviaremos los detalles logísticos por email.', 'esitef-minimal' ),
		);
	}

	return null;
}

/**
 * Require login before presencial add-to-cart.
 */
function esitef_presencial_require_login_for_cart() {
	if ( is_user_logged_in() ) {
		return;
	}

	// phpcs:ignore WordPress.Security.NonceVerification.Recommended
	if ( empty( $_REQUEST['esitef_presencial_instance'] ) ) {
		return;
	}

	wp_safe_redirect(
		add_query_arg(
			'redirect_to',
			rawurlencode( wc_get_cart_url() ),
			esitef_get_login_url()
		)
	);
	exit;
}
add_action( 'template_redirect', 'esitef_presencial_require_login_for_cart', 4 );

/**
 * Whether a plan uses WooCommerce Subscriptions.
 */
function esitef_presencial_is_subscription_plan( $instance_slug, $plan_key ) {
	$config = esitef_get_presencial_checkout_config( $instance_slug );
	if ( ! $config || empty( $config['plans'][ $plan_key ]['subscription'] ) ) {
		return false;
	}
	return true;
}
