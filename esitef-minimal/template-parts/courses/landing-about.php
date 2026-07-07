<?php
/**
 * Landing about — course description (sin layout legacy Tutor/Elementor).
 *
 * @package esitef-minimal
 */

$course_id = esitef_landing_course_id();
$content   = esitef_landing_get_about_content( $course_id );

if ( ! $content ) {
	return;
}
?>
<section class="landing-section landing-about" aria-labelledby="landing-about-title">
	<h2 id="landing-about-title" class="landing-section__title"><?php esc_html_e( 'Acerca del curso', 'esitef-minimal' ); ?></h2>
	<div class="landing-about__content">
		<?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
	</div>
</section>
