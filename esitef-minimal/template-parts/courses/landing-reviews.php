<?php
/**
 * Landing reviews.
 *
 * @package esitef-minimal
 */

if ( ! function_exists( 'tutor_utils' ) || ! tutor_utils()->get_option( 'enable_course_review' ) ) {
	return;
}

$course_id = esitef_landing_course_id();
$rating    = esitef_landing_get_rating( $course_id );
$per_page  = (int) tutor_utils()->get_option( 'pagination_per_page', 10 );
$reviews   = tutor_utils()->get_course_reviews( $course_id, 0, $per_page, false, array( 'approved' ) );

if ( empty( $reviews ) && ( ! $rating || ! $rating->rating_count ) ) {
	return;
}
?>
<section class="landing-section landing-reviews" aria-labelledby="landing-reviews-title">
	<h2 id="landing-reviews-title" class="landing-section__title"><? esc_html_e( 'Reseñas', 'esitef-minimal' ); ?></h2>

	<?php if ( $rating && $rating->rating_count > 0 ) : ?>
		<div class="landing-reviews__summary">
			<span class="landing-reviews__score"><?php echo esc_html( number_format( (float) $rating->rating_avg, 1 ) ); ?></span>
			<span class="landing-reviews__count">
				<?php
				printf(
					/* translators: %d: review count */
					esc_html( _n( '%d valoración', '%d valoraciones', (int) $rating->rating_count, 'esitef-minimal' ) ),
					(int) $rating->rating_count
				);
				?>
			</span>
		</div>
	<?php endif; ?>

	<?php if ( ! empty( $reviews ) ) : ?>
		<div class="landing-reviews__list">
			<?php foreach ( $reviews as $review ) : ?>
				<?php
				$user     = get_userdata( (int) $review->user_id );
				$name     = $user ? $user->display_name : __( 'Usuario', 'esitef-minimal' );
				$initials = esitef_landing_review_initials( $name );
				$stars    = esitef_landing_star_string( isset( $review->rating ) ? $review->rating : 5 );
				?>
				<article class="landing-review-card">
					<div class="landing-review-card__header">
						<span class="landing-review-card__avatar"><?php echo esc_html( $initials ); ?></span>
						<div>
							<div class="landing-review-card__name"><?php echo esc_html( $name ); ?></div>
							<div class="landing-review-card__stars" aria-label="<?php echo esc_attr( sprintf( __( '%s de 5 estrellas', 'esitef-minimal' ), $review->rating ) ); ?>"><?php echo esc_html( $stars ); ?></div>
						</div>
					</div>
					<?php if ( ! empty( $review->comment_content ) ) : ?>
						<p class="landing-review-card__text"><?php echo esc_html( $review->comment_content ); ?></p>
					<?php endif; ?>
				</article>
			<?php endforeach; ?>
		</div>
	<?php endif; ?>
</section>
