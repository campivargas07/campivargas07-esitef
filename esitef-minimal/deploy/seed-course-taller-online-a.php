<?php
/**
 * Seed local demo course: taller-online-a
 * Usage: wp eval-file esitef-minimal/deploy/seed-course-taller-online-a.php
 *
 * @package esitef-minimal
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$slug = 'taller-online-a';

$existing = get_page_by_path( $slug, OBJECT, 'courses' );
if ( $existing ) {
	echo "Course already exists: ID {$existing->ID} — http://localhost:8080/courses/{$slug}/\n";
	return;
}

// Instructor.
$instructor_login = 'tomas-bonino';
$instructor_id    = username_exists( $instructor_login );
if ( ! $instructor_id ) {
	$instructor_id = wp_create_user( $instructor_login, 'demo-tutor-2026', 'tomas.bonino@esitef.local' );
	if ( is_wp_error( $instructor_id ) ) {
		echo 'Instructor error: ' . $instructor_id->get_error_message() . "\n";
		return;
	}
	wp_update_user(
		array(
			'ID'           => $instructor_id,
			'display_name' => 'Tomás Bonino',
			'first_name'   => 'Tomás',
			'last_name'    => 'Bonino',
		)
	);
	$user = new WP_User( $instructor_id );
	$user->set_role( 'tutor_instructor' );
}

update_user_meta( $instructor_id, '_tutor_profile_job_title', 'ESP' );
update_user_meta(
	$instructor_id,
	'_tutor_profile_bio',
	"Fisioterapeuta en España desde 2001.\nMovement coach. Experto en movimiento terapéutico.\nPionero de la Pedagogía aplicada al aprendizaje motor.\nDocente en cientos de formaciones y congresos internacionales en 12 países."
);

// Category.
$term = term_exists( 'Talleres Online', 'course-category' );
if ( ! $term ) {
	$term = wp_insert_term( 'Talleres Online', 'course-category' );
}
$term_id = is_array( $term ) ? (int) $term['term_id'] : (int) $term;

// WooCommerce product.
$product_id = wp_insert_post(
	array(
		'post_type'   => 'product',
		'post_title'  => 'A – Recuperando curvas fisiológicas',
		'post_status' => 'publish',
	)
);
update_post_meta( $product_id, '_regular_price', '225' );
update_post_meta( $product_id, '_price', '225' );
update_post_meta( $product_id, '_virtual', 'yes' );
update_post_meta( $product_id, '_sold_individually', 'yes' );

// Course.
$course_id = wp_insert_post(
	array(
		'post_type'    => 'courses',
		'post_title'   => 'A – Recuperando curvas fisiológicas',
		'post_name'    => $slug,
		'post_status'  => 'publish',
		'post_excerpt' => 'Propondremos y practicaremos una guía práctica para recuperar la curva cervical y lumbar, a través de sencillos y prácticas actividades.',
		'post_content' => '<p>Propondremos y practicaremos una guía práctica para recuperar la curva cervical y lumbar, a través de sencillos y prácticas actividades, basándonos y respetando el desarrollo neuromotor y el proceso de aprendizaje natural humano.</p>',
	)
);

wp_set_object_terms( $course_id, array( $term_id ), 'course-category' );

update_post_meta( $course_id, '_tutor_course_price_type', 'paid' );
update_post_meta( $course_id, '_tutor_course_product_id', $product_id );
update_post_meta( $course_id, '_course_duration', array( 'hours' => 1, 'minutes' => 50 ) );
update_post_meta( $course_id, '_tutor_is_public_course', 'yes' );

add_user_meta( $instructor_id, '_tutor_instructor_course_id', $course_id );

// Topic + lesson.
$topic_id = wp_insert_post(
	array(
		'post_type'   => 'topics',
		'post_title'  => 'Taller Online',
		'post_status' => 'publish',
		'post_parent' => $course_id,
		'menu_order'  => 1,
	)
);

$lesson_id = wp_insert_post(
	array(
		'post_type'   => 'lesson',
		'post_title'  => 'Recuperando curvas fisiológicas',
		'post_status' => 'publish',
		'post_parent' => $topic_id,
		'menu_order'  => 1,
	)
);

update_post_meta( $lesson_id, '_video', array( 'runtime' => array( 'hours' => '01', 'minutes' => '34', 'seconds' => '03' ) ) );

// Fake enrolled count for display (Tutor reads from enrollments table; landing shows count via API).
if ( function_exists( 'tutor_utils' ) && method_exists( tutor_utils(), 'get_total_students' ) ) {
	// ponytail: enrolled count comes from real enrollments; local demo shows 0 until purchased.
}

echo "✅ Course created: ID {$course_id}\n";
echo "   URL: http://localhost:8080/courses/{$slug}/\n";
echo "   Admin: http://localhost:8080/wp-admin/post.php?post={$course_id}&action=edit\n";
echo "   Instructor: {$instructor_login} / demo-tutor-2026\n";
