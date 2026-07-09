<?php
/**
 * WooCommerce wrapper
 *
 * @package esitef-minimal
 */

get_header();

$main_class = 'site-main woocommerce-page';
if ( function_exists( 'esitef_is_checkout_branded_page' ) && esitef_is_checkout_branded_page() ) {
	$main_class .= ' esitef-checkout-main';
}
$main_class = apply_filters( 'esitef_woocommerce_main_class', $main_class );

$main_style = function_exists( 'esitef_is_checkout_branded_page' ) && esitef_is_checkout_branded_page()
	? ''
	: ' style="padding: 60px 20px; max-width: var(--container-width, 1200px); margin: 0 auto;"';
?>

<main id="main" class="<?php echo esc_attr( $main_class ); ?>"<?php echo $main_style; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
	<?php woocommerce_content(); ?>
</main>

<?php
get_footer();
