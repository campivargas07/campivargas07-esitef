<?php
/**
 * Landing hero — title, excerpt, instructor, enroll (content column).
 *
 * @package esitef-minimal
 */

$course_id  = esitef_landing_course_id();
$instructor = esitef_landing_get_primary_instructor( $course_id );
$excerpt    = get_the_excerpt( $course_id );
?>
<section class="landing-hero" aria-label="<? esc_attr_e( 'Información del curso', 'esitef-minimal' ); ?>">
	<span class="landing-hero__category"><?php echo esc_html( esitef_landing_get_category_label( $course_id ) ); ?></span>
	<h1 class="landing-hero__title"><?php the_title(); ?></h1>

	<?php if ( $excerpt ) : ?>
		<p class="landing-hero__excerpt"><?php echo esc_html( $excerpt ); ?></p>
	<?php endif; ?>

	<?php if ( $instructor ) : ?>
		<div class="landing-hero__instructor">
			<div class="landing-hero__instructor-avatar">
				<?php echo get_avatar( $instructor->ID, 88, '', esc_attr( $instructor->display_name ) ); ?>
			</div>
			<div>
				<span class="landing-hero__instructor-label"><? esc_html_e( 'Profesor', 'esitef-minimal' ); ?></span>
				<span class="landing-hero__instructor-name"><?php echo esc_html( $instructor->display_name ); ?></span>
			</div>
		</div>
	<?php endif; ?>

	<div class="landing-enroll-wrap">
		<?php
		if ( function_exists( 'tutor_load_template' ) ) {
			tutor_load_template( 'single.course.course-entry-box' );
		}
		?>
	</div>
</section>
