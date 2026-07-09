<?php
/**
 * ESITEF Minimal functions and definitions
 *
 * @package esitef-minimal
 */

if ( ! defined( 'ESITEF_MINIMAL_VERSION' ) ) {
	define( 'ESITEF_MINIMAL_VERSION', '1.4.9' );
}

function esitef_minimal_setup() {
	add_theme_support( 'automatic-feed-links' );
	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support(
		'custom-logo',
		array(
			'height'      => 80,
			'width'       => 200,
			'flex-height' => true,
			'flex-width'  => true,
		)
	);

	register_nav_menus(
		array(
			'menu-1' => esc_html__( 'Primary', 'esitef-minimal' ),
			'footer' => esc_html__( 'Footer Menu', 'esitef-minimal' ),
		)
	);

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

	add_theme_support( 'woocommerce' );
	add_theme_support( 'wc-product-gallery-zoom' );
	add_theme_support( 'wc-product-gallery-lightbox' );
	add_theme_support( 'wc-product-gallery-slider' );
	add_theme_support( 'tutor' );
}
add_action( 'after_setup_theme', 'esitef_minimal_setup' );

/**
 * Theme asset URI helper.
 */
function esitef_asset_uri( $path ) {
	return get_template_directory_uri() . '/assets/' . ltrim( $path, '/' );
}

/**
 * Login page URL.
 */
function esitef_get_login_url() {
	$page = get_page_by_path( 'ingresar' );
	if ( $page ) {
		return get_permalink( $page );
	}
	return wp_login_url();
}

/**
 * Dashboard URL after auth.
 */
function esitef_get_dashboard_url() {
	if ( function_exists( 'tutor_utils' ) ) {
		return tutor_utils()->get_tutor_dashboard_page_permalink();
	}
	return home_url( '/dashboard/' );
}

/**
 * Replace hardcoded prototype URLs in extracted HTML.
 */
function esitef_filter_prototype_html( $html ) {
	$base = untrailingslashit( home_url() );
	$replacements = array(
		'https://esitef.com/online'  => $base,
		'https://esitef.com/formaciones/' => $base . '/courses/',
		'login.html'                 => wp_make_link_relative( esitef_get_login_url() ),
	);
	return str_replace( array_keys( $replacements ), array_values( $replacements ), $html );
}

/**
 * Body classes for page templates.
 */
function esitef_body_classes( $classes ) {
	if ( is_page_template( 'page-templates/page-login.php' ) ) {
		$classes[] = 'login-screen';
	}
	if ( is_page_template( 'page-templates/page-descarga-libro.php' ) ) {
		$classes[] = 'descarga-libro-screen';
	}
	if ( is_page_template( 'page-templates/page-libros.php' ) ) {
		$classes[] = 'libros-screen';
	}
	if ( is_page_template( 'page-templates/page-articulos.php' ) ) {
		$classes[] = 'articulos-screen';
	}
	if ( is_page_template( 'page-templates/page-contacto.php' ) ) {
		$classes[] = 'contacto-screen';
	}
	if ( is_page_template( 'page-templates/page-pais.php' ) ) {
		$classes[] = 'pais-screen';
	}
	if ( is_singular( 'courses' ) ) {
		$classes[] = 'landing-online-page';
	}
	if ( is_page_template( 'page-templates/page-formaciones.php' ) || is_post_type_archive( 'courses' ) ) {
		$classes[] = 'esitef-formaciones-page';
	}
	if ( is_page_template( 'page-templates/page-formacion-hub.php' ) ) {
		$classes[] = 'esitef-formacion-hub-page';
		$queried = get_queried_object();
		if ( $queried instanceof WP_Post ) {
			$hub = esitef_get_formacion_hub( $queried->post_name );
			if ( $hub ) {
				$theme = esitef_get_hub_theme_slug( $hub, $queried->post_name );
				$classes[] = 'esitef-hub-' . sanitize_html_class( $theme );
			}
		}
	}
	return $classes;
}
add_filter( 'body_class', 'esitef_body_classes' );

/**
 * Enqueue scripts and styles.
 */
function esitef_minimal_scripts() {
	$uri = get_template_directory_uri();
	$ver = ESITEF_MINIMAL_VERSION;

	wp_enqueue_style(
		'esitef-fonts',
		'https://fonts.googleapis.com/css2?family=Inconsolata:wght@400;500;600;700&family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,200..800&family=Inter:wght@300;400;500;600&display=swap',
		array(),
		null
	);

	wp_enqueue_style( 'esitef-minimal-style', get_stylesheet_uri(), array( 'esitef-fonts' ), $ver );
	wp_enqueue_style( 'esitef-header', $uri . '/assets/css/header.css', array( 'esitef-minimal-style' ), $ver );
	wp_enqueue_style( 'esitef-footer', $uri . '/assets/css/footer.css', array( 'esitef-minimal-style' ), $ver );
	wp_enqueue_style( 'esitef-login-transition', $uri . '/assets/css/login-transition.css', array(), $ver );

	if ( is_front_page() ) {
		wp_enqueue_style( 'esitef-front-page', $uri . '/assets/css/front-page.css', array( 'esitef-header', 'esitef-footer' ), $ver );
		wp_enqueue_script( 'esitef-home-front', $uri . '/assets/js/home-front.js', array(), $ver, true );
	}

	if ( is_page_template( 'page-templates/page-login.php' ) ) {
		wp_enqueue_style( 'esitef-auth', $uri . '/assets/css/pages/auth.css', array( 'esitef-header', 'esitef-navbar-v2' ), $ver );
		wp_enqueue_script( 'esitef-auth', $uri . '/assets/js/auth.js', array(), $ver, true );
	}

	if ( is_page_template( 'page-templates/page-mentorias.php' ) ) {
		wp_enqueue_style( 'esitef-mentorias', $uri . '/assets/css/pages/mentorias.css', array( 'esitef-header', 'esitef-footer' ), $ver );
		wp_enqueue_script( 'esitef-mentorias', $uri . '/assets/js/mentorias.js', array(), $ver, true );
	}

	if ( is_page_template( 'page-templates/page-la-escuela.php' ) ) {
		wp_enqueue_style( 'esitef-la-escuela', $uri . '/assets/css/pages/la-escuela.css', array( 'esitef-header', 'esitef-footer' ), $ver );
	}

	if ( is_page_template( 'page-templates/page-presencial.php' ) ) {
		wp_enqueue_style( 'esitef-presencial', $uri . '/assets/css/pages/presencial.css', array( 'esitef-header', 'esitef-footer' ), $ver );
		wp_enqueue_script( 'esitef-presencial', $uri . '/assets/js/presencial.js', array(), $ver, true );
	}

	if ( is_post_type_archive( 'courses' ) || is_page_template( 'page-templates/page-formaciones.php' ) ) {
		wp_enqueue_style( 'esitef-formaciones', $uri . '/assets/css/pages/formaciones.css', array( 'esitef-header' ), $ver );
		wp_enqueue_style( 'esitef-course-cards', $uri . '/assets/css/components/course-cards.css', array( 'esitef-formaciones' ), $ver );
	}

	if ( is_page_template( 'page-templates/page-formacion-hub.php' ) ) {
		wp_enqueue_style( 'esitef-formaciones', $uri . '/assets/css/pages/formaciones.css', array( 'esitef-header' ), $ver );
		wp_enqueue_style( 'esitef-course-cards', $uri . '/assets/css/components/course-cards.css', array( 'esitef-formaciones' ), $ver );
		wp_enqueue_style( 'esitef-formacion-hub', $uri . '/assets/css/pages/formacion-hub.css', array( 'esitef-formaciones' ), $ver );
		wp_enqueue_script( 'esitef-formacion-hub', $uri . '/assets/js/formacion-hub.js', array(), $ver, true );
	}

	if ( is_page_template( 'page-templates/page-libros.php' ) ) {
		wp_enqueue_style( 'esitef-libros', $uri . '/assets/css/pages/libros.css', array( 'esitef-header' ), $ver );
	}

	if ( is_page_template( 'page-templates/page-articulos.php' ) ) {
		wp_enqueue_style( 'esitef-articulos', $uri . '/assets/css/pages/articulos.css', array( 'esitef-header' ), $ver );
	}

	if ( is_page_template( 'page-templates/page-contacto.php' ) ) {
		wp_enqueue_style( 'esitef-contacto', $uri . '/assets/css/pages/contacto.css', array( 'esitef-header', 'esitef-footer' ), $ver );
	}

	if ( is_page_template( 'page-templates/page-descarga-libro.php' ) ) {
		wp_enqueue_style( 'esitef-descarga-libro', $uri . '/assets/css/pages/descarga-libro.css', array( 'esitef-header' ), $ver );
		wp_enqueue_script( 'esitef-descarga-libro', $uri . '/assets/js/descarga-libro.js', array(), $ver, true );
	}

	if ( is_page_template( 'page-templates/page-pais.php' ) ) {
		wp_enqueue_style( 'esitef-pais', $uri . '/assets/css/pages/pais.css', array( 'esitef-header', 'esitef-footer' ), $ver );
		wp_enqueue_script( 'esitef-pais', $uri . '/assets/js/pais.js', array(), $ver, true );
	}

	if ( is_singular( 'courses' ) ) {
		wp_enqueue_style( 'esitef-landing-online', $uri . '/assets/css/pages/landing-online.css', array( 'esitef-header', 'esitef-footer' ), $ver );
		wp_enqueue_style( 'esitef-formaciones', $uri . '/assets/css/pages/formaciones.css', array( 'esitef-header' ), $ver );
		wp_enqueue_style( 'esitef-course-cards', $uri . '/assets/css/components/course-cards.css', array( 'esitef-formaciones' ), $ver );
		wp_enqueue_script( 'esitef-landing-online', $uri . '/assets/js/landing-online.js', array(), $ver, true );
	}

	// navbar-v2 al final — única fuente de estilos mobile
	wp_enqueue_style( 'esitef-navbar-v2', $uri . '/assets/css/navbar-v2.css', array( 'esitef-header' ), $ver );
	wp_enqueue_script( 'esitef-navbar-v2', $uri . '/assets/js/navbar-v2.js', array(), $ver, true );
	wp_enqueue_script( 'esitef-login-transition', $uri . '/assets/js/login-transition.js', array(), $ver, true );
}
add_action( 'wp_enqueue_scripts', 'esitef_minimal_scripts' );

/**
 * Dequeue Tutor default frontend CSS on custom landing singles (keep JS for cart/enroll).
 */
function esitef_landing_dequeue_tutor_styles() {
	if ( ! is_singular( 'courses' ) ) {
		return;
	}
	wp_dequeue_style( 'tutor-frontend' );
	wp_dequeue_style( 'tutor-frontend-dashboard-css' );
}
add_action( 'wp_enqueue_scripts', 'esitef_landing_dequeue_tutor_styles', 100 );

/**
 * Nav menu classes for prototype markup.
 */
function esitef_nav_menu_css_class( $classes, $item, $args ) {
	if ( isset( $args->theme_location ) && 'menu-1' === $args->theme_location ) {
		if ( ! in_array( 'menu-item', $classes, true ) ) {
			$classes[] = 'menu-item';
		}
	}
	return $classes;
}
add_filter( 'nav_menu_css_class', 'esitef_nav_menu_css_class', 10, 3 );

function esitef_minimal_cleanup() {
	remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
	remove_action( 'wp_print_styles', 'print_emoji_styles' );
	remove_action( 'wp_head', 'wlwmanifest_link' );
	remove_action( 'wp_head', 'wp_generator' );
	remove_action( 'wp_head', 'rsd_link' );
}
add_action( 'init', 'esitef_minimal_cleanup' );

require get_template_directory() . '/inc/formaciones-online-hubs.php';
require get_template_directory() . '/inc/activation.php';
require get_template_directory() . '/inc/libros.php';
require get_template_directory() . '/inc/articulos.php';
require get_template_directory() . '/inc/paises.php';
require get_template_directory() . '/inc/formaciones-presenciales.php';
require get_template_directory() . '/inc/compat-elementor.php';
require get_template_directory() . '/inc/courses-landing.php';
require get_template_directory() . '/inc/nav-menu.php';
require get_template_directory() . '/inc/contacto.php';
require get_template_directory() . '/inc/tutor-login.php';
require get_template_directory() . '/inc/auth-registration.php';
require get_template_directory() . '/inc/woocommerce.php';

/**
 * Staging banner (ponytail: only when STAGING constant or URL contains staging).
 */
function esitef_staging_banner() {
	$host = wp_parse_url( home_url(), PHP_URL_HOST );
	if ( ! $host || false === strpos( $host, 'staging' ) ) {
		return;
	}
	echo '<div style="position:fixed;bottom:0;left:0;right:0;z-index:999999;background:#e3203a;color:#fff;text-align:center;padding:8px;font:500 12px Inconsolata,monospace;">ENTORNO DE PRUEBAS — No realizar pagos reales</div>';
}
add_action( 'wp_footer', 'esitef_staging_banner', 1 );
