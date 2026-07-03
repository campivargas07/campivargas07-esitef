<?php
/**
 * Landing curriculum — topics and lessons.
 *
 * @package esitef-minimal
 */

if ( ! function_exists( 'tutor_utils' ) ) {
	return;
}

$course_id = esitef_landing_course_id();
$topics    = tutor_utils()->get_topics( $course_id );

if ( ! $topics || ! $topics->have_posts() ) {
	return;
}
?>
<section class="landing-section landing-curriculum" aria-labelledby="landing-curriculum-title">
	<h2 id="landing-curriculum-title" class="landing-section__title"><? esc_html_e( 'Contenido', 'esitef-minimal' ); ?></h2>
	<div class="landing-curriculum__list">
		<?php
		$topic_index = 0;
		while ( $topics->have_posts() ) :
			$topics->the_post();
			$topic_id    = get_the_ID();
			$lessons     = tutor_utils()->get_course_contents_by_topic( $topic_id, -1 );
			$is_first    = 0 === $topic_index;
			$topic_index++;
			?>
			<div class="landing-curriculum__topic<?php echo $is_first ? ' active' : ''; ?>">
				<button class="landing-curriculum__topic-header" type="button" aria-expanded="<?php echo $is_first ? 'true' : 'false'; ?>">
					<?php the_title(); ?>
					<span class="landing-curriculum__topic-icon" aria-hidden="true">+</span>
				</button>
				<div class="landing-curriculum__topic-body"<?php echo $is_first ? ' style="max-height:none"' : ''; ?>>
					<?php if ( $lessons && $lessons->have_posts() ) : ?>
						<div class="landing-curriculum__lessons">
							<?php
							while ( $lessons->have_posts() ) :
								$lessons->the_post();
								$lesson_id   = get_the_ID();
								$video       = tutor_utils()->get_video_info( $lesson_id );
								$play_time   = $video ? $video->playtime : '';
								$duration    = $play_time ? tutor_utils()->get_optimized_duration( $play_time ) : '';
								?>
								<div class="landing-curriculum__lesson">
									<span><?php the_title(); ?></span>
									<?php if ( $duration ) : ?>
										<span class="landing-curriculum__lesson-duration"><?php echo esc_html( $duration ); ?></span>
									<?php endif; ?>
								</div>
							<?php endwhile; ?>
						</div>
					<?php endif; ?>
				</div>
			</div>
			<?php
		endwhile;
		wp_reset_postdata();
		?>
	</div>
</section>
