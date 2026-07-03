<?php
/**
 * Landing instructor — expanded bio.
 *
 * @package esitef-minimal
 */

$course_id  = esitef_landing_course_id();
$instructor = esitef_landing_get_primary_instructor( $course_id );

if ( ! $instructor ) {
	return;
}

$bio = get_user_meta( $instructor->ID, '_tutor_profile_bio', true );
if ( ! $bio ) {
	$bio = get_user_meta( $instructor->ID, 'description', true );
}
?>
<section class="landing-section landing-instructor" aria-labelledby="landing-instructor-title">
	<h2 id="landing-instructor-title" class="landing-section__title"><? esc_html_e( 'Profesor', 'esitef-minimal' ); ?></h2>
	<article class="landing-instructor-card">
		<div class="landing-instructor-card__avatar">
			<?php echo get_avatar( $instructor->ID, 176, '', esc_attr( $instructor->display_name ) ); ?>
		</div>
		<h3><?php echo esc_html( $instructor->display_name ); ?></h3>
		<?php
		$job = get_user_meta( $instructor->ID, '_tutor_profile_job_title', true );
		if ( $job ) :
			?>
			<span class="landing-instructor-card__role"><?php echo esc_html( $job ); ?></span>
		<?php endif; ?>
		<?php if ( $bio ) : ?>
			<div class="landing-instructor-card__bio">
				<?php echo wp_kses_post( wpautop( $bio ) ); ?>
			</div>
		<?php endif; ?>
	</article>
</section>
