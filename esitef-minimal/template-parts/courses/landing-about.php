<?php
/**
 * Landing about — full course description.
 *
 * @package esitef-minimal
 */

$course_id = esitef_landing_course_id();
$content   = apply_filters( 'the_content', get_post_field( 'post_content', $course_id ) );
$enrolled  = esitef_landing_get_enrolled_count( $course_id );
$duration  = esitef_landing_format_duration( $course_id );

if ( ! $content && ! $enrolled && ! $duration ) {
	return;
}
?>
<section class="landing-section landing-about" aria-labelledby="landing-about-title">
	<h2 id="landing-about-title" class="landing-section__title"><? esc_html_e( 'Acerca del curso', 'esitef-minimal' ); ?></h2>
	<div class="landing-about__content">
		<?php if ( $content ) : ?>
			<?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
		<?php endif; ?>

		<?php if ( $enrolled || $duration ) : ?>
			<p>
				<?php
				$meta_parts = array();
				if ( $enrolled ) {
					$meta_parts[] = sprintf(
						/* translators: %d: enrolled count */
						_n( '%d profesional matriculado', '%d profesionales matriculados', $enrolled, 'esitef-minimal' ),
						$enrolled
					);
				}
				if ( $duration ) {
					$meta_parts[] = sprintf(
						/* translators: %s: duration */
						__( 'Duración total: %s', 'esitef-minimal' ),
						$duration
					);
				}
				echo esc_html( implode( '. ', $meta_parts ) ) . '.';
				?>
			</p>
		<?php endif; ?>
	</div>
</section>
