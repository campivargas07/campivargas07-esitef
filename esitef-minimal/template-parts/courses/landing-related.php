<?php
/**
 * Landing related courses.
 *
 * @package esitef-minimal
 */

$related = esitef_landing_get_related_query();

if ( ! $related->have_posts() ) {
	return;
}
?>
<section class="landing-section landing-related" aria-labelledby="landing-related-title">
	<h2 id="landing-related-title" class="landing-section__title"><? esc_html_e( 'Te puede interesar', 'esitef-minimal' ); ?></h2>
	<div class="formaciones-container">
		<div class="formaciones-grid">
			<?php
			while ( $related->have_posts() ) :
				$related->the_post();
				?>
				<a href="<?php the_permalink(); ?>" class="curso-card">
					<div class="curso-image">
						<?php
						if ( has_post_thumbnail() ) {
							the_post_thumbnail( 'medium_large', array( 'alt' => esc_attr( get_the_title() ) ) );
						}
						?>
					</div>
					<div class="curso-content">
						<div class="curso-header">
							<h3><?php the_title(); ?></h3>
							<span class="curso-ver-mas"><? esc_html_e( 'Ver más', 'esitef-minimal' ); ?></span>
						</div>
					</div>
				</a>
			<?php endwhile; ?>
		</div>
	</div>
</section>
<?php
wp_reset_postdata();
