<?php
/**
 * Landing hero media — sticky column on desktop.
 *
 * @package esitef-minimal
 */

$course_id  = esitef_landing_course_id();
$video_info = function_exists( 'tutor_utils' ) ? tutor_utils()->get_video_info( $course_id ) : null;
$has_video  = $video_info && ! empty( $video_info->source_video_id );
$has_media  = $has_video || has_post_thumbnail( $course_id );

if ( ! $has_media ) {
	return;
}
?>
<aside class="landing-layout__sticky" aria-label="<? esc_attr_e( 'Vista previa del curso', 'esitef-minimal' ); ?>">
	<div class="landing-hero__media">
		<?php if ( $has_video && function_exists( 'tutor_utils' ) ) : ?>
			<?php echo tutor_utils()->get_video( $course_id ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
		<?php else : ?>
			<?php echo get_the_post_thumbnail( $course_id, 'large', array( 'alt' => esc_attr( get_the_title( $course_id ) ) ) ); ?>
		<?php endif; ?>
	</div>
</aside>
