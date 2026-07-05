<?php
/**
 * País — lista «Te podría interesar».
 *
 * @package esitef-minimal
 */

$related = esitef_get_pais_related_posts( 6 );
if ( ! $related ) {
	return;
}
?>
<section class="pais-related" aria-labelledby="pais-related-title">
	<h2 id="pais-related-title" class="pais-related-title"><? esc_html_e( 'Te podría interesar', 'esitef-minimal' ); ?></h2>
	<ul class="pais-related-list">
		<?php foreach ( $related as $post ) : ?>
			<?php if ( ! $post instanceof WP_Post ) {
				continue;
			} ?>
		<li>
			<a href="<?php echo esc_url( get_permalink( $post ) ); ?>" class="pais-related-item">
				<span class="pais-related-thumb">
					<?php if ( has_post_thumbnail( $post ) ) : ?>
						<?php echo get_the_post_thumbnail( $post, 'thumbnail', array( 'alt' => esc_attr( get_the_title( $post ) ) ) ); ?>
					<?php else : ?>
						<span class="pais-related-fallback" aria-hidden="true"></span>
					<?php endif; ?>
				</span>
				<span class="pais-related-name"><?php echo esc_html( get_the_title( $post ) ); ?></span>
			</a>
		</li>
		<?php endforeach; ?>
	</ul>
</section>
