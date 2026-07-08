<?php
/**
 * Seed formaciones online — cursos Tutor desde catálogo de hubs.
 * Usage: wp eval-file esitef-minimal/deploy/seed-formaciones-online.php
 *
 * @package esitef-minimal
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once get_template_directory() . '/inc/formaciones-online-hubs.php';

/**
 * @param int    $course_id     Course ID.
 * @param int    $instructor_id Instructor user ID.
 */
function esitef_seed_hub_assign_instructor( $course_id, $instructor_id ) {
	$course_id     = (int) $course_id;
	$instructor_id = (int) $instructor_id;
	if ( ! $course_id || ! $instructor_id ) {
		return;
	}
	if ( (int) get_post_field( 'post_author', $course_id ) !== $instructor_id ) {
		wp_update_post(
			array(
				'ID'          => $course_id,
				'post_author' => $instructor_id,
			)
		);
	}
}

/**
 * @param int $course_id Course ID.
 * @param int $product_id Product ID.
 */
function esitef_seed_hub_configure_paid( $course_id, $product_id ) {
	update_post_meta( $course_id, '_tutor_course_price_type', 'paid' );
	update_post_meta( $course_id, '_tutor_course_product_id', $product_id );
	update_post_meta( $course_id, '_tutor_is_public_course', 'no' );
}

/**
 * Ensure Tutor monetization via WooCommerce.
 */
function esitef_seed_hub_monetization() {
	if ( ! function_exists( 'tutor_utils' ) ) {
		return;
	}
	$options = get_option( 'tutor_option', array() );
	if ( ! is_array( $options ) ) {
		$options = array();
	}
	if ( ( $options['monetize_by'] ?? '' ) !== 'wc' ) {
		$options['monetize_by'] = 'wc';
		update_option( 'tutor_option', $options );
	}
}

/**
 * @return int Instructor user ID.
 */
function esitef_seed_hub_ensure_instructor() {
	$login = 'tomas-bonino';
	$id    = username_exists( $login );
	if ( ! $id ) {
		$id = wp_create_user( $login, 'demo-tutor-2026', 'tomas.bonino@esitef.local' );
		if ( is_wp_error( $id ) ) {
			echo 'Instructor error: ' . $id->get_error_message() . "\n";
			return 0;
		}
		wp_update_user(
			array(
				'ID'           => $id,
				'display_name' => 'Tomás Bonino',
			)
		);
		$user = new WP_User( $id );
		$user->set_role( 'tutor_instructor' );
	}
	update_user_meta( $id, '_is_tutor_instructor', time() );
	update_user_meta( $id, '_tutor_instructor_status', 'approved' );
	return (int) $id;
}

/**
 * @param string $name Category name.
 * @return int Term ID.
 */
function esitef_seed_hub_ensure_category( $name ) {
	$term = term_exists( $name, 'course-category' );
	if ( ! $term ) {
		$term = wp_insert_term( $name, 'course-category' );
	}
	return is_array( $term ) ? (int) $term['term_id'] : (int) $term;
}

/**
 * Parse price string like "11 USD" to numeric.
 *
 * @param string $price_str Price string.
 */
function esitef_seed_hub_parse_price( $price_str ) {
	if ( preg_match( '/[\d.,]+/', (string) $price_str, $m ) ) {
		return str_replace( ',', '', $m[0] );
	}
	return '0';
}

/**
 * Create or skip course.
 *
 * @param array<string, mixed> $def Course definition.
 * @param int                  $instructor_id Instructor ID.
 * @param int                  $category_id Category term ID.
 */
function esitef_seed_hub_course( $def, $instructor_id, $category_id ) {
	$slug    = $def['slug'];
	$title   = $def['title'];
	$excerpt = $def['excerpt'] ?? '';
	$price   = $def['price'] ?? '0';

	$existing = get_page_by_path( $slug, OBJECT, 'courses' );
	if ( $existing ) {
		echo "⏭  Exists: {$slug} (ID {$existing->ID})\n";
		esitef_seed_hub_assign_instructor( (int) $existing->ID, $instructor_id );
		return (int) $existing->ID;
	}

	$product_id = wp_insert_post(
		array(
			'post_type'   => 'product',
			'post_title'  => $title,
			'post_status' => 'publish',
		)
	);
	update_post_meta( $product_id, '_regular_price', $price );
	update_post_meta( $product_id, '_price', $price );
	update_post_meta( $product_id, '_virtual', 'yes' );

	$course_id = wp_insert_post(
		array(
			'post_type'    => 'courses',
			'post_title'   => $title,
			'post_name'    => $slug,
			'post_status'  => 'publish',
			'post_author'  => $instructor_id,
			'post_excerpt' => $excerpt,
			'post_content' => '<p>' . esc_html( $excerpt ) . '</p>',
		)
	);

	if ( is_wp_error( $course_id ) || ! $course_id ) {
		echo "❌ Failed: {$slug}\n";
		return 0;
	}

	wp_set_object_terms( $course_id, array( $category_id ), 'course-category' );
	esitef_seed_hub_configure_paid( $course_id, $product_id );
	esitef_seed_hub_assign_instructor( $course_id, $instructor_id );

	if ( function_exists( 'esitef_landing_demo_youtube_video_meta' ) ) {
		update_post_meta( $course_id, '_video', esitef_landing_demo_youtube_video_meta() );
	}

	echo "✅ Created: {$slug} — " . get_permalink( $course_id ) . "\n";
	return (int) $course_id;
}

esitef_seed_hub_monetization();
$instructor_id = esitef_seed_hub_ensure_instructor();
if ( ! $instructor_id ) {
	return;
}

$hubs = esitef_get_formacion_hubs();
$courses_to_seed = array();

foreach ( $hubs as $hub ) {
	if ( ! empty( $hub['items'] ) ) {
		foreach ( $hub['items'] as $item ) {
			if ( empty( $item['course_slug'] ) ) {
				continue;
			}
			$courses_to_seed[ $item['course_slug'] ] = array(
				'slug'     => $item['course_slug'],
				'title'    => $item['title'] ?? $item['course_slug'],
				'excerpt'  => $item['excerpt'] ?? '',
				'price'    => esitef_seed_hub_parse_price( $item['price'] ?? '15' ),
				'category' => 'Formaciones Online',
			);
		}
	}
	if ( ! empty( $hub['pricing']['course_slug'] ) ) {
		$slug = $hub['pricing']['course_slug'];
		$courses_to_seed[ $slug ] = array(
			'slug'     => $slug,
			'title'    => $hub['title'] ?? $slug,
			'excerpt'  => $hub['subtitle'] ?? '',
			'price'    => esitef_seed_hub_parse_price( ( $hub['pricing']['price'] ?? '55' ) ),
			'category' => 'Formaciones Online',
		);
	}
	if ( ! empty( $hub['pricing']['plans'] ) ) {
		foreach ( $hub['pricing']['plans'] as $plan ) {
			if ( empty( $plan['course_slug'] ) ) {
				continue;
			}
			$courses_to_seed[ $plan['course_slug'] ] = array(
				'slug'     => $plan['course_slug'],
				'title'    => ( $hub['title'] ?? '' ) . ' — ' . ( $plan['name'] ?? '' ),
				'excerpt'  => $hub['subtitle'] ?? '',
				'price'    => esitef_seed_hub_parse_price( $plan['price'] ?? '9.9' ),
				'category' => 'Club de actualización',
			);
		}
	}
}

$standalone = array(
	'int-curso-dolor' => array(
		'slug'     => 'int-curso-dolor',
		'title'    => 'Introducción al mundo del dolor',
		'excerpt'  => 'Actualización para comprender el dolor desde la neurociencia.',
		'price'    => '1390',
		'category' => 'Dolor',
	),
	'comunicat' => array(
		'slug'     => 'comunicat',
		'title'    => 'Formación Online en Comunicación Efectiva',
		'excerpt'  => 'Herramientas prácticas para mejorar tus habilidades al hablar en público.',
		'price'    => '55',
		'category' => 'Formaciones Online',
	),
	'crecer-en-movimiento' => array(
		'slug'     => 'crecer-en-movimiento',
		'title'    => 'CRECER en movimiento',
		'excerpt'  => '11 sesiones de movimiento para experimentar, variar y jugar con el cuerpo.',
		'price'    => '55',
		'category' => 'Formaciones Online',
	),
);

$courses_to_seed = array_merge( $courses_to_seed, $standalone );

$categories = array();
foreach ( $courses_to_seed as $def ) {
	$cat = $def['category'] ?? 'Formaciones Online';
	if ( ! isset( $categories[ $cat ] ) ) {
		$categories[ $cat ] = esitef_seed_hub_ensure_category( $cat );
	}
	esitef_seed_hub_course( $def, $instructor_id, $categories[ $cat ] );
}

echo "\nDone. Seeded " . count( $courses_to_seed ) . " courses.\n";
