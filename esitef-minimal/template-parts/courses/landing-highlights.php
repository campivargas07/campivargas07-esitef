<?php
/**
 * Landing highlights — rating + online in one vertical panel.
 *
 * @package esitef-minimal
 */

$course_id = esitef_landing_course_id();
$rating    = esitef_landing_get_rating( $course_id );

$rating_title = __( 'Sin valoraciones', 'esitef-minimal' );
$rating_label = __( 'Ranking', 'esitef-minimal' );
if ( $rating && $rating->rating_count > 0 ) {
	$rating_title = number_format( (float) $rating->rating_avg, 1 );
	$rating_label = sprintf(
		/* translators: %d: review count */
		_n( '%d valoración', '%d valoraciones', (int) $rating->rating_count, 'esitef-minimal' ),
		(int) $rating->rating_count
	);
}
?>
<section class="landing-highlights" aria-label="<? esc_attr_e( 'Detalles del curso', 'esitef-minimal' ); ?>">
	<div class="landing-highlights__panel">
		<div class="landing-highlight-row">
			<div class="landing-highlight-row__icon landing-highlight-row__icon--star" aria-hidden="true">
				<svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
			</div>
			<div class="landing-highlight-row__text">
				<strong class="landing-highlight-row__title"><?php echo esc_html( $rating_title ); ?></strong>
				<span class="landing-highlight-row__label"><?php echo esc_html( $rating_label ); ?></span>
			</div>
		</div>

		<div class="landing-highlight-row">
			<div class="landing-highlight-row__icon" aria-hidden="true">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
					<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
				</svg>
			</div>
			<div class="landing-highlight-row__text">
				<strong class="landing-highlight-row__title"><? esc_html_e( '100% online', 'esitef-minimal' ); ?></strong>
				<span class="landing-highlight-row__label"><? esc_html_e( 'Aprende a tu ritmo, desde donde quieras', 'esitef-minimal' ); ?></span>
			</div>
		</div>
	</div>
</section>
