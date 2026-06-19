<?php
/**
 * ESITEF Minimal functions and definitions
 *
 * @package esitef-minimal
 */

if ( ! defined( 'ESITEF_MINIMAL_VERSION' ) ) {
	define( 'ESITEF_MINIMAL_VERSION', '1.0.0' );
}

function esitef_minimal_setup() {
	// Add default posts and comments RSS feed links to head.
	add_theme_support( 'automatic-feed-links' );

	// Let WordPress manage the document title.
	add_theme_support( 'title-tag' );

	// Enable support for Post Thumbnails on posts and pages.
	add_theme_support( 'post-thumbnails' );

	// Register Navigation Menus.
	register_nav_menus(
		array(
			'menu-1' => esc_html__( 'Primary', 'esitef-minimal' ),
			'footer' => esc_html__( 'Footer Menu', 'esitef-minimal' ),
		)
	);

	// HTML5 markup support.
	add_theme_support(
		'html5',
		array(
			'search-form',
			'comment-form',
			'comment-list',
			'gallery',
			'caption',
			'style',
			'script',
		)
	);

	// WooCommerce Support
	add_theme_support( 'woocommerce' );
	add_theme_support( 'wc-product-gallery-zoom' );
	add_theme_support( 'wc-product-gallery-lightbox' );
	add_theme_support( 'wc-product-gallery-slider' );

    // Tutor LMS Support (Tutor LMS automatically detects theme support if files are overridden, but good practice)
    add_theme_support( 'tutor' );
}
add_action( 'after_setup_theme', 'esitef_minimal_setup' );

/**
 * Enqueue scripts and styles.
 */
function esitef_minimal_scripts() {
    // Fonts (Bricolage Grotesque)
    wp_enqueue_style( 'esitef-fonts', 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&display=swap', array(), null );

	// Main Style
	wp_enqueue_style( 'esitef-minimal-style', get_stylesheet_uri(), array(), ESITEF_MINIMAL_VERSION );

	// Custom JS
	// wp_enqueue_script( 'esitef-minimal-main', get_template_directory_uri() . '/assets/js/main.js', array(), ESITEF_MINIMAL_VERSION, true );
}
add_action( 'wp_enqueue_scripts', 'esitef_minimal_scripts' );

/**
 * Clean up WordPress Header (Remove emojis, wlwmanifest, etc for performance)
 */
function esitef_minimal_cleanup() {
    remove_action('wp_head', 'print_emoji_detection_script', 7);
    remove_action('wp_print_styles', 'print_emoji_styles');
    remove_action('wp_head', 'wlwmanifest_link');
    remove_action('wp_head', 'wp_generator');
    remove_action('wp_head', 'rsd_link');
}
add_action('init', 'esitef_minimal_cleanup');
