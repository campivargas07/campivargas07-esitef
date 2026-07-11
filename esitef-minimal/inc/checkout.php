<?php
/**
 * Branded WooCommerce cart / checkout.
 *
 * @package esitef-minimal
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Cart contains only virtual products (courses / presencial online).
 */
function esitef_cart_is_virtual_only() {
	if ( ! function_exists( 'WC' ) || ! WC()->cart || WC()->cart->is_empty() ) {
		return false;
	}
	foreach ( WC()->cart->get_cart() as $item ) {
		$product = $item['data'] ?? null;
		if ( $product && ! $product->is_virtual() ) {
			return false;
		}
	}
	return true;
}

/**
 * Whether current view uses checkout branding.
 */
function esitef_is_checkout_branded_page() {
	return function_exists( 'is_cart' ) && ( is_cart() || is_checkout() || is_wc_endpoint_url( 'order-received' ) );
}

/**
 * Body class for checkout pages.
 */
function esitef_checkout_body_class( $classes ) {
	if ( esitef_is_checkout_branded_page() ) {
		$classes[] = 'esitef-checkout-page';
	}
	if ( is_checkout() && ! is_wc_endpoint_url( 'order-received' ) ) {
		$classes[] = 'esitef-checkout-form-page';
	}
	return $classes;
}
add_filter( 'body_class', 'esitef_checkout_body_class' );

/**
 * Enqueue checkout assets.
 */
function esitef_checkout_enqueue_assets() {
	if ( ! esitef_is_checkout_branded_page() ) {
		return;
	}

	$uri = get_template_directory_uri();
	$ver = ESITEF_MINIMAL_VERSION;

	wp_enqueue_style(
		'esitef-formacion-hub',
		$uri . '/assets/css/pages/formacion-hub.css',
		array( 'esitef-minimal-style' ),
		$ver
	);

	wp_enqueue_style(
		'esitef-checkout-inter',
		'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap',
		array(),
		null
	);

	wp_enqueue_style(
		'esitef-checkout',
		$uri . '/assets/css/pages/checkout.css',
		array( 'esitef-formacion-hub', 'esitef-header', 'esitef-navbar-v2', 'esitef-checkout-inter' ),
		$ver
	);

	wp_enqueue_script(
		'esitef-checkout',
		$uri . '/assets/js/checkout.js',
		array( 'jquery', 'wc-checkout' ),
		$ver,
		true
	);

	wp_localize_script(
		'esitef-checkout',
		'esitefCheckout',
		array_merge(
			esitef_get_checkout_gateway_ui_config(),
			array(
				'ajaxUrl'      => admin_url( 'admin-ajax.php' ),
				'nonce'        => wp_create_nonce( 'esitef_checkout' ),
				'cartUrl'      => function_exists( 'wc_get_cart_url' ) ? wc_get_cart_url() : '',
				'checkoutUrl'  => function_exists( 'wc_get_checkout_url' ) ? wc_get_checkout_url() : '',
				'isCheckout'   => is_checkout() && ! is_wc_endpoint_url( 'order-received' ),
				'isCart'       => is_cart(),
				'isMixed'      => function_exists( 'esitef_cart_is_mixed' ) && esitef_cart_is_mixed(),
				'totalLabel'   => function_exists( 'esitef_cart_total_label' ) ? esitef_cart_total_label() : __( 'Total', 'esitef-minimal' ),
				'currency'     => function_exists( 'get_woocommerce_currency_symbol' ) ? get_woocommerce_currency_symbol() : '$',
			)
		)
	);
}
add_action( 'wp_enqueue_scripts', 'esitef_checkout_enqueue_assets', 30 );

/**
 * Local dev: dequeue PayPal/Stripe scripts when COD-only (prevents browser freeze).
 */
function esitef_checkout_dequeue_gateway_scripts() {
	if ( ! esitef_is_checkout_branded_page() || ! is_checkout() || is_wc_endpoint_url( 'order-received' ) ) {
		return;
	}
	if ( ! function_exists( 'esitef_is_local_dev' ) || ! esitef_is_local_dev() ) {
		return;
	}

	$handles = array(
		'ppcp-smart-button',
		'ppcp-checkout',
		'ppcp-checkout-block',
		'ppcp-button',
		'ppcp-credit-card-gateway',
		'ppcp-googlepay',
		'ppcp-applepay',
		'woocommerce_paypal_payments',
		'wc-stripe-upe-classic',
		'wc-stripe-payment-request',
		'wc-stripe-express-checkout',
		'stripe',
		'wc-stripe-elements',
		'woocommerce-mercadopago-checkout',
		'woocommerce-mercadopago',
		'wc_mercadopago_checkout',
		'wc_mercadopago_sdk',
		'wc_mercadopago_melidata',
		'wc_mercadopago_health_monitor',
	);

	foreach ( $handles as $handle ) {
		wp_dequeue_script( $handle );
		wp_deregister_script( $handle );
	}
}
add_action( 'wp_enqueue_scripts', 'esitef_checkout_dequeue_gateway_scripts', 100 );

/**
 * SiteGround Optimizer: no combinar checkout.css (el bundle cacheado lo omite).
 */
function esitef_checkout_sg_optimizer_excludes( $exclude ) {
	if ( ! esitef_is_checkout_branded_page() ) {
		return $exclude;
	}
	$exclude[] = 'esitef-checkout';
	$exclude[] = 'esitef-formacion-hub';
	return $exclude;
}
add_filter( 'sgo_css_combine_exclude', 'esitef_checkout_sg_optimizer_excludes' );
add_filter( 'sgo_javascript_combine_exclude', 'esitef_checkout_sg_optimizer_excludes' );

/**
 * WooCommerce Blocks ignoran las plantillas PHP del tema; forzar shortcodes clásicos.
 */
function esitef_sync_classic_checkout_pages() {
	if ( ! function_exists( 'wc_get_page_id' ) ) {
		return;
	}

	$option_key = 'esitef_classic_wc_pages_v';
	if ( get_option( $option_key ) === ESITEF_MINIMAL_VERSION ) {
		return;
	}

	$pages = array(
		'cart'     => '[woocommerce_cart]',
		'checkout' => '[woocommerce_checkout]',
	);

	foreach ( $pages as $wc_page => $shortcode ) {
		$page_id = (int) wc_get_page_id( $wc_page );
		if ( $page_id <= 0 ) {
			continue;
		}
		$content = (string) get_post_field( 'post_content', $page_id );
		if ( false !== strpos( $content, $shortcode ) ) {
			continue;
		}
		wp_update_post(
			array(
				'ID'           => $page_id,
				'post_content' => $shortcode,
			)
		);
	}

	update_option( $option_key, ESITEF_MINIMAL_VERSION, false );
}
add_action( 'init', 'esitef_sync_classic_checkout_pages', 5 );

/**
 * Checkout breadcrumb steps.
 *
 * @return array<int, array{label: string, url: string, current: bool}>
 */
function esitef_checkout_breadcrumb_steps() {
	$steps = array(
		array(
			'label'   => __( 'Inicio', 'esitef-minimal' ),
			'url'     => home_url( '/' ),
			'current' => false,
		),
		array(
			'label'   => __( 'Carrito', 'esitef-minimal' ),
			'url'     => wc_get_cart_url(),
			'current' => is_cart(),
		),
	);

	if ( is_checkout() || is_wc_endpoint_url( 'order-received' ) ) {
		$steps[] = array(
			'label'   => __( 'Checkout', 'esitef-minimal' ),
			'url'     => wc_get_checkout_url(),
			'current' => is_checkout() && ! is_wc_endpoint_url( 'order-received' ),
		);
	}

	if ( is_wc_endpoint_url( 'order-received' ) ) {
		$steps[] = array(
			'label'   => __( 'Confirmación', 'esitef-minimal' ),
			'url'     => '',
			'current' => true,
		);
	}

	return $steps;
}

/**
 * Render checkout breadcrumb.
 */
function esitef_checkout_render_breadcrumb() {
	$steps = esitef_checkout_breadcrumb_steps();
	if ( empty( $steps ) ) {
		return;
	}
	?>
	<nav class="checkout-breadcrumb hub-breadcrumb" aria-label="<?php esc_attr_e( 'Progreso de compra', 'esitef-minimal' ); ?>">
		<?php foreach ( $steps as $index => $step ) : ?>
			<?php if ( $index > 0 ) : ?>
				<span class="checkout-breadcrumb__sep" aria-hidden="true">›</span>
			<?php endif; ?>
			<?php if ( ! empty( $step['url'] ) && empty( $step['current'] ) ) : ?>
				<a href="<?php echo esc_url( $step['url'] ); ?>"><?php echo esc_html( $step['label'] ); ?></a>
			<?php else : ?>
				<span<?php echo ! empty( $step['current'] ) ? ' aria-current="page"' : ''; ?>><?php echo esc_html( $step['label'] ); ?></span>
			<?php endif; ?>
		<?php endforeach; ?>
	</nav>
	<?php
}

/**
 * First presencial cart line (for plan selector).
 *
 * @return array<string, mixed>|null
 */
function esitef_cart_get_presencial_line() {
	if ( ! function_exists( 'WC' ) || ! WC()->cart ) {
		return null;
	}

	foreach ( WC()->cart->get_cart() as $key => $item ) {
		if ( ! empty( $item['esitef_presencial_instance'] ) ) {
			return array_merge( $item, array( 'cart_key' => $key ) );
		}
	}

	return null;
}

/**
 * Custom cart item row for branded template.
 */
function esitef_cart_item_remove_link( $cart_item_key, $product ) {
	if ( ! $product || ! function_exists( 'wc_get_cart_remove_url' ) ) {
		return '';
	}

	return apply_filters(
		'woocommerce_cart_item_remove_link',
		sprintf(
			'<a href="%s" class="polar-product__remove" aria-label="%s" data-product_id="%s" data-product_sku="%s">%s</a>',
			esc_url( wc_get_cart_remove_url( $cart_item_key ) ),
			/* translators: %s: product name */
			esc_attr( sprintf( __( 'Eliminar %s del carrito', 'esitef-minimal' ), $product->get_name() ) ),
			esc_attr( (string) $product->get_id() ),
			esc_attr( (string) $product->get_sku() ),
			esc_html__( 'Eliminar', 'esitef-minimal' )
		),
		$cart_item_key
	);
}

/**
 * Custom cart item row for branded template.
 */
function esitef_checkout_render_cart_item( $cart_item, $cart_item_key ) {
	$product = $cart_item['data'] ?? null;
	if ( ! $product || ! $product->exists() ) {
		return;
	}

	$thumbnail = $product->get_image( 'thumbnail', array( 'class' => 'checkout-cart-item__thumb' ) );
	$is_presencial = ! empty( $cart_item['esitef_presencial_instance'] );
	$badge_class   = $is_presencial ? 'checkout-badge--presencial' : 'checkout-badge--online';
	$badge_label   = $is_presencial ? __( 'Presencial', 'esitef-minimal' ) : __( 'Online', 'esitef-minimal' );
	?>
	<article class="checkout-cart-item esitef-module-card" data-cart-key="<?php echo esc_attr( $cart_item_key ); ?>">
		<div class="checkout-cart-item__media">
			<?php echo $thumbnail; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
		</div>
		<div class="checkout-cart-item__body">
			<span class="checkout-badge <?php echo esc_attr( $badge_class ); ?>"><?php echo esc_html( $badge_label ); ?></span>
			<h2 class="checkout-cart-item__title"><?php echo esc_html( $product->get_name() ); ?></h2>
			<?php echo wc_get_formatted_cart_item_data( $cart_item ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
		</div>
		<div class="checkout-cart-item__price">
			<?php echo wp_kses_post( WC()->cart->get_product_price( $product ) ); ?>
			<?php echo wp_kses_post( esitef_cart_item_remove_link( $cart_item_key, $product ) ); ?>
		</div>
	</article>
	<?php
}

/**
 * Reorder checkout: custom polar layout hooks.
 */
function esitef_checkout_layout_hooks() {
	if ( ! is_checkout() || is_wc_endpoint_url( 'order-received' ) ) {
		return;
	}

	remove_action( 'woocommerce_checkout_order_review', 'woocommerce_order_review', 10 );
	remove_action( 'woocommerce_checkout_order_review', 'woocommerce_checkout_payment', 20 );

	add_action( 'woocommerce_checkout_order_review', 'esitef_checkout_payment_section', 20 );
}
add_action( 'wp', 'esitef_checkout_layout_hooks' );

/**
 * Payment block inside polar layout (native WC gateways).
 */
function esitef_checkout_payment_section() {
	woocommerce_checkout_payment();
}

/**
 * Simplify billing fields for Polar checkout (email-first, minimal).
 */
function esitef_checkout_simplify_fields( $fields ) {
	if ( isset( $fields['billing']['billing_company'] ) ) {
		unset( $fields['billing']['billing_company'] );
	}
	if ( isset( $fields['billing']['billing_address_2'] ) ) {
		unset( $fields['billing']['billing_address_2'] );
	}

	if ( esitef_cart_is_virtual_only() ) {
		unset(
			$fields['billing']['billing_address_1'],
			$fields['billing']['billing_city'],
			$fields['billing']['billing_postcode'],
			$fields['billing']['billing_state']
		);
	} else {
		if ( isset( $fields['billing']['billing_address_1'] ) ) {
			$fields['billing']['billing_address_1']['required'] = false;
		}
		if ( isset( $fields['billing']['billing_state'] ) ) {
			$fields['billing']['billing_state']['required'] = false;
		}
		if ( isset( $fields['billing']['billing_postcode'] ) ) {
			$fields['billing']['billing_postcode']['required'] = false;
		}
	}

	unset( $fields['billing']['billing_phone'] );

	// Email first (Polar preview order).
	if ( isset( $fields['billing']['billing_email'] ) ) {
		$fields['billing']['billing_email']['priority'] = 5;
		$fields['billing']['billing_email']['class']    = array( 'form-row-wide', 'polar-field' );
	}
	if ( isset( $fields['billing']['billing_first_name'] ) ) {
		$fields['billing']['billing_first_name']['priority'] = 10;
		$fields['billing']['billing_first_name']['class']    = array( 'form-row-first', 'polar-field' );
	}
	if ( isset( $fields['billing']['billing_last_name'] ) ) {
		$fields['billing']['billing_last_name']['priority'] = 20;
		$fields['billing']['billing_last_name']['class']    = array( 'form-row-last', 'polar-field' );
	}
	if ( isset( $fields['billing']['billing_country'] ) ) {
		$fields['billing']['billing_country']['priority'] = 30;
		$fields['billing']['billing_country']['class']    = array( 'form-row-wide', 'polar-field', 'address-field', 'update_totals_on_change' );
	}

	return $fields;
}
add_filter( 'woocommerce_checkout_fields', 'esitef_checkout_simplify_fields', 20 );

/**
 * Hide default WC page title on cart/checkout.
 */
function esitef_checkout_hide_page_title( $show ) {
	if ( esitef_is_checkout_branded_page() ) {
		return false;
	}
	return $show;
}
add_filter( 'woocommerce_show_page_title', 'esitef_checkout_hide_page_title' );

/**
 * Custom place order button text (Polar: "Pagar {monto}").
 */
function esitef_checkout_order_button_text( $text ) {
	unset( $text );
	if ( function_exists( 'WC' ) && WC()->cart && ! WC()->cart->is_empty() ) {
		$total = WC()->cart->get_total();
		return sprintf(
			/* translators: %s: formatted cart total */
			__( 'Pagar %s', 'esitef-minimal' ),
			wp_strip_all_tags( $total )
		);
	}
	return __( 'Pagar ahora', 'esitef-minimal' );
}
add_filter( 'woocommerce_order_button_text', 'esitef_checkout_order_button_text' );

/**
 * Polar checkout: default to card gateway (Stripe/COD), not PayPal.
 *
 * @param string $gateway_id Default gateway id.
 * @return string
 */
function esitef_polar_default_payment_gateway( $gateway_id ) {
	if ( ! is_checkout() || is_wc_endpoint_url( 'order-received' ) || ! function_exists( 'WC' ) ) {
		return $gateway_id;
	}

	$available = WC()->payment_gateways()->get_available_payment_gateways();
	$priority  = array( 'stripe', 'stripe_cc', 'woocommerce_payments', 'cod' );
	foreach ( $priority as $id ) {
		if ( isset( $available[ $id ] ) ) {
			return $id;
		}
	}

	return $gateway_id;
}
add_filter( 'woocommerce_default_payment_gateway', 'esitef_polar_default_payment_gateway', 20 );

/**
 * Thank-you: course CTA for Tutor products (supports mixed orders).
 */
function esitef_checkout_thankyou_course_cta( $order_id ) {
	$order = wc_get_order( $order_id );
	if ( ! $order ) {
		return;
	}

	$shown = 0;
	foreach ( $order->get_items() as $item ) {
		$product_id = $item->get_product_id();
		if ( ! $product_id || ! esitef_wc_is_tutor_course_product( $product_id ) ) {
			continue;
		}

		$courses = get_posts(
			array(
				'post_type'      => 'courses',
				'posts_per_page' => 1,
				'meta_key'       => '_tutor_course_product_id',
				'meta_value'     => $product_id,
				'fields'         => 'ids',
			)
		);

		if ( empty( $courses ) ) {
			continue;
		}

		$course_id = (int) $courses[0];
		$start_url = get_permalink( $course_id );
		if ( function_exists( 'tutor_utils' ) ) {
			$first_lesson = tutor_utils()->get_course_first_lesson( $course_id );
			if ( $first_lesson ) {
				$start_url = $first_lesson;
			}
		}
		?>
		<div class="checkout-thankyou-course esitef-module-card">
			<h3><?php echo esc_html( get_the_title( $course_id ) ); ?></h3>
			<a class="checkout-btn checkout-btn--primary" href="<?php echo esc_url( $start_url ); ?>">
				<?php esc_html_e( 'Empezar ahora', 'esitef-minimal' ); ?>
			</a>
			<?php if ( 0 === $shown ) : ?>
				<a class="checkout-btn checkout-btn--text" href="<?php echo esc_url( esitef_get_dashboard_url() ); ?>">
					<?php esc_html_e( 'Ver mis cursos', 'esitef-minimal' ); ?>
				</a>
			<?php endif; ?>
		</div>
		<?php
		++$shown;
	}
}
add_action( 'woocommerce_thankyou', 'esitef_checkout_thankyou_course_cta', 15 );

/**
 * Strip default checkout coupon/login noise on branded pages.
 */
function esitef_checkout_remove_distractions() {
	if ( ! esitef_is_checkout_branded_page() ) {
		return;
	}
	remove_action( 'woocommerce_before_checkout_form', 'woocommerce_checkout_login_form', 10 );
	remove_action( 'woocommerce_before_checkout_form', 'woocommerce_checkout_coupon_form', 10 );
	remove_action( 'woocommerce_before_checkout_form_cart_notices', 'woocommerce_output_all_notices', 10 );
}
add_action( 'wp', 'esitef_checkout_remove_distractions' );

/**
 * Spanish labels for Polar billing fields.
 */
function esitef_checkout_spanish_field_labels( $fields ) {
	if ( ! is_checkout() ) {
		return $fields;
	}
	$map = array(
		'billing_email'      => __( 'Email', 'esitef-minimal' ),
		'billing_first_name' => __( 'Nombre', 'esitef-minimal' ),
		'billing_last_name'  => __( 'Apellidos', 'esitef-minimal' ),
		'billing_country'    => __( 'País', 'esitef-minimal' ),
	);
	foreach ( $map as $key => $label ) {
		if ( isset( $fields['billing'][ $key ] ) ) {
			$fields['billing'][ $key ]['label'] = $label;
		}
	}
	return $fields;
}
add_filter( 'woocommerce_checkout_fields', 'esitef_checkout_spanish_field_labels', 30 );

/**
 * Disable PayPal smart buttons on Polar checkout — one "Pagar ahora" only.
 * Returning a non-existent hook prevents the button wrapper from rendering.
 */
function esitef_checkout_disable_ppcp_button_hook( $hook ) {
	if ( function_exists( 'is_checkout' ) && is_checkout() && ! is_wc_endpoint_url( 'order-received' ) ) {
		return 'esitef_ppcp_disabled_hook';
	}
	return $hook;
}
add_filter( 'woocommerce_paypal_payments_checkout_button_renderer_hook', 'esitef_checkout_disable_ppcp_button_hook', 99 );
add_filter( 'woocommerce_paypal_payments_checkout_dcc_renderer_hook', 'esitef_checkout_disable_ppcp_button_hook', 99 );

/**
 * Polar redirect mode: never register PayPal card / wallet sub-gateways.
 */
function esitef_checkout_disable_ppcp_sub_gateways( $enabled, $gateway_id ) {
	if ( ! function_exists( 'is_checkout' ) || ! is_checkout() || is_wc_endpoint_url( 'order-received' ) ) {
		return $enabled;
	}
	$disabled = array(
		'ppcp-credit-card-gateway',
		'ppcp-card-button-gateway',
		'ppcp-googlepay',
		'ppcp-applepay',
	);
	if ( in_array( $gateway_id, $disabled, true ) ) {
		return false;
	}
	return $enabled;
}
add_filter( 'woocommerce_paypal_payments_gateway_enabled', 'esitef_checkout_disable_ppcp_sub_gateways', 99, 2 );

/**
 * Hide PayPal gateway description ("Pay via PayPal") — Polar shows its own hint.
 */
function esitef_checkout_empty_gateway_description( $description, $gateway_id ) {
	if ( ! is_checkout() ) {
		return $description;
	}
	$paypal_ids = array( 'ppcp-gateway', 'paypal', 'ppec_paypal' );
	if ( in_array( $gateway_id, $paypal_ids, true ) ) {
		return '';
	}
	return $description;
}
add_filter( 'woocommerce_gateway_description', 'esitef_checkout_empty_gateway_description', 20, 2 );

/**
 * Keep place_order text as "Pagar ahora" even when PayPal wants "Proceed to PayPal".
 */
function esitef_checkout_force_place_order_text( $gateways ) {
	if ( ! is_checkout() || empty( $gateways ) ) {
		return $gateways;
	}
	foreach ( $gateways as $gateway ) {
		if ( is_object( $gateway ) && isset( $gateway->order_button_text ) ) {
			if ( function_exists( 'WC' ) && WC()->cart && ! WC()->cart->is_empty() ) {
				$gateway->order_button_text = sprintf(
					/* translators: %s: formatted cart total */
					__( 'Pagar %s', 'esitef-minimal' ),
					wp_strip_all_tags( WC()->cart->get_total() )
				);
			} else {
				$gateway->order_button_text = __( 'Pagar ahora', 'esitef-minimal' );
			}
		}
	}
	return $gateways;
}
add_filter( 'woocommerce_available_payment_gateways', 'esitef_checkout_force_place_order_text', 99 );

/**
 * Enable COD as local/test "Pago de prueba" when no Stripe keys.
 */
function esitef_checkout_ensure_test_gateway( $gateways ) {
	if ( is_admin() && ! wp_doing_ajax() ) {
		return $gateways;
	}
	return $gateways;
}
add_filter( 'woocommerce_available_payment_gateways', 'esitef_checkout_ensure_test_gateway', 5 );

/**
 * WooCommerce wrapper — checkout shell without extra padding.
 */
function esitef_checkout_main_class( $classes ) {
	if ( esitef_is_checkout_branded_page() ) {
		$classes[] = 'esitef-checkout-main';
	}
	return $classes;
}
add_filter( 'esitef_woocommerce_main_class', 'esitef_checkout_main_class' );
