<?php
/**
 * Landing hero media — sticky column on desktop.
 *
 * @package esitef-minimal
 */

$course_id  = esitef_landing_course_id();
$has_video  = esitef_landing_has_course_video( $course_id );
$has_thumb  = has_post_thumbnail( $course_id );
$has_media  = $has_video || $has_thumb;
?>
<aside class="landing-layout__sticky" aria-label="<? esc_attr_e( 'Vista previa del curso', 'esitef-minimal' ); ?>">
	<?php if ( $has_media ) : ?>
		<div class="landing-hero__media<?php echo $has_video ? ' landing-hero__media--video' : ''; ?>">
			<?php if ( $has_video && function_exists( 'tutor_course_video' ) ) : ?>
				<?php tutor_course_video(); ?>
			<?php else : ?>
				<?php echo get_the_post_thumbnail( $course_id, 'large', array( 'alt' => esc_attr( get_the_title( $course_id ) ) ) ); ?>
			<?php endif; ?>
		</div>
	<?php endif; ?>
	<?php
	set_query_var( 'esitef_landing_meta_context', 'desktop' );
	get_template_part( 'template-parts/courses/landing', 'hero-meta' );
	set_query_var( 'esitef_landing_meta_context', '' );
	get_template_part( 'template-parts/courses/landing', 'purchase' );
	?>
</aside>
