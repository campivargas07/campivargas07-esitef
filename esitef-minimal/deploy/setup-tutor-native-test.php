<?php
/**
 * Switch local site to Tutor native eCommerce (no WooCommerce checkout path).
 *
 * Usage: wp eval-file wp-content/themes/esitef-minimal/deploy/setup-tutor-native-test.php
 *
 * @package esitef-minimal
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'tutor_utils' ) ) {
	echo "❌ Tutor LMS no está activo.\n";
	return;
}

/**
 * @param string $slug Course post_name.
 * @param float  $price USD price for native Tutor checkout.
 */
function esitef_tutor_native_configure_course( $slug, $price ) {
	$course = get_page_by_path( $slug, OBJECT, 'courses' );
	if ( ! $course ) {
		echo "⚠️  Curso no encontrado: {$slug}\n";
		return;
	}

	$course_id = (int) $course->ID;

	update_post_meta( $course_id, '_tutor_course_price_type', 'paid' );
	update_post_meta( $course_id, '_tutor_is_public_course', 'no' );
	update_post_meta( $course_id, 'tutor_course_price', (string) $price );
	delete_post_meta( $course_id, 'tutor_course_sale_price' );
	delete_post_meta( $course_id, '_tutor_course_product_id' );

	echo "✅ {$slug} (ID {$course_id}) → tutor_course_price={$price}\n";
}

/**
 * Enable a manual payment method so checkout can complete without PayPal credentials.
 */
function esitef_tutor_native_seed_manual_payment() {
	$payment_settings = array(
		'payment_methods' => array(
			array(
				'name'                 => 'local_bank_transfer',
				'label'                => 'Transferencia (prueba local)',
				'is_active'            => true,
				'is_manual'            => true,
				'is_installed'         => true,
				'is_plugin_active'     => true,
				'support_subscription' => false,
				'icon'                 => '',
				'fields'               => array(
					array(
						'name'  => 'payment_instructions',
						'value' => '<p>Transferencia bancaria de prueba. El pedido quedará pendiente hasta confirmación manual.</p>',
					),
					array(
						'name'  => 'additional_details',
						'value' => 'Solo entorno local — sin cobro real.',
					),
				),
			),
		),
	);

	$json = wp_json_encode( $payment_settings );
	tutor_utils()->update_option( 'payment_settings', $json );
	echo "✅ Método de pago manual: Transferencia (prueba local)\n";
}

$options = get_option( 'tutor_option', array() );
if ( ! is_array( $options ) ) {
	$options = array();
}

$options['monetize_by'] = 'tutor';
update_option( 'tutor_option', $options );

esitef_tutor_native_seed_manual_payment();

// One demo course is enough to walk through cart → checkout → enrollment.
esitef_tutor_native_configure_course( 'taller-online-a', 225 );

$cart_id     = (int) tutor_utils()->get_option( 'tutor_cart_page_id' );
$checkout_id = (int) tutor_utils()->get_option( 'tutor_checkout_page_id' );

echo "\n";
echo "=== Tutor native listo (sin checkout ESITEF / WC) ===\n";
echo "monetize_by: tutor\n";
echo "Curso demo:  http://localhost:8080/courses/taller-online-a/\n";
if ( $cart_id ) {
	echo "Carrito:     " . get_permalink( $cart_id ) . "\n";
}
if ( $checkout_id ) {
	echo "Checkout:    " . get_permalink( $checkout_id ) . "\n";
}
echo "Login test:  estudiante / Estudiante123!\n";
echo "Admin:       admin / admin → Tutor LMS → Settings → Monetization (PayPal opcional)\n";
