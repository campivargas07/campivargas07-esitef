<?php
/**
 * Tutor single course — landing-online layout.
 *
 * @package esitef-minimal
 */

get_header();

if ( have_posts() ) {
	the_post();
}

$course_id = get_the_ID();

if ( function_exists( 'tutor_utils' ) ) {
	$is_public               = class_exists( 'TUTOR\Course_List' ) ? \TUTOR\Course_List::is_public( $course_id ) : false;
	$student_must_login      = tutor_utils()->get_option( 'student_must_login_to_view_course' );
	$login_required_to_visit = ! is_user_logged_in() && ! $is_public && $student_must_login;

	if ( $login_required_to_visit && function_exists( 'tutor_load_template' ) ) {
		tutor_load_template( 'login' );
		get_footer();
		return;
	}
}
?>

<main id="main" class="site-wrapper landing-online-page">
	<div class="landing-layout">
		<?php get_template_part( 'template-parts/courses/landing', 'breadcrumb' ); ?>
		<?php get_template_part( 'template-parts/courses/landing', 'hero-media' ); ?>
		<div class="landing-layout__scroll">
			<?php
			get_template_part( 'template-parts/courses/landing', 'hero' );
			get_template_part( 'template-parts/courses/landing', 'highlights' );
			get_template_part( 'template-parts/courses/landing', 'about' );
			set_query_var( 'esitef_landing_meta_context', 'mobile' );
			get_template_part( 'template-parts/courses/landing', 'hero-meta' );
			set_query_var( 'esitef_landing_meta_context', '' );
			get_template_part( 'template-parts/courses/landing', 'curriculum' );
			get_template_part( 'template-parts/courses/landing', 'instructor' );
			get_template_part( 'template-parts/courses/landing', 'reviews' );
			get_template_part( 'template-parts/courses/landing', 'related' );
			?>
		</div>
	</div>
</main>

<?php
get_footer();
