<?php
/**
 * Curriculum / temario.
 *
 * @package esitef-minimal
 *
 * @var array<string, mixed> $args
 */

$curriculum = isset( $args['curriculum'] ) ? $args['curriculum'] : array();
if ( empty( $curriculum ) ) {
	return;
}

$is_grouped = isset( $curriculum['main'] );
?>
<section class="hub-curriculum">
  <div class="hub-curriculum__inner">
    <?php if ( $is_grouped ) : ?>
      <?php if ( ! empty( $curriculum['main'] ) ) : ?>
      <h2 class="hub-curriculum__title"><?php esc_html_e( 'Información del curso', 'esitef-minimal' ); ?></h2>
      <ul class="hub-curriculum__list">
        <?php foreach ( $curriculum['main'] as $item ) : ?>
        <li class="hub-curriculum__item">
          <span class="hub-curriculum__item-title"><?php echo esc_html( $item['title'] ?? '' ); ?></span>
          <?php if ( ! empty( $item['duration'] ) ) : ?>
          <span class="hub-curriculum__item-duration"><?php echo esc_html( $item['duration'] ); ?></span>
          <?php endif; ?>
        </li>
        <?php endforeach; ?>
      </ul>
      <?php endif; ?>
      <?php if ( ! empty( $curriculum['summaries'] ) ) : ?>
      <h2 class="hub-curriculum__title"><?php esc_html_e( 'Video-resúmenes', 'esitef-minimal' ); ?></h2>
      <ul class="hub-curriculum__list">
        <?php foreach ( $curriculum['summaries'] as $item ) : ?>
        <li class="hub-curriculum__item">
          <span class="hub-curriculum__item-title"><?php echo esc_html( $item['title'] ?? '' ); ?></span>
          <?php if ( ! empty( $item['duration'] ) ) : ?>
          <span class="hub-curriculum__item-duration"><?php echo esc_html( $item['duration'] ); ?></span>
          <?php endif; ?>
        </li>
        <?php endforeach; ?>
      </ul>
      <?php endif; ?>
    <?php else : ?>
    <h2 class="hub-curriculum__title"><?php esc_html_e( 'Programa', 'esitef-minimal' ); ?></h2>
    <ul class="hub-curriculum__list">
      <?php foreach ( $curriculum as $item ) : ?>
      <li class="hub-curriculum__item">
        <span class="hub-curriculum__item-title"><?php echo esc_html( $item['title'] ?? '' ); ?></span>
        <?php if ( ! empty( $item['duration'] ) ) : ?>
        <span class="hub-curriculum__item-duration"><?php echo esc_html( $item['duration'] ); ?></span>
        <?php endif; ?>
      </li>
      <?php endforeach; ?>
    </ul>
    <?php endif; ?>
  </div>
</section>
