<?php
/**
 * Bloques de contenido para landings.
 *
 * @package esitef-minimal
 *
 * @var array<string, mixed> $args
 */

$hub      = isset( $args['hub'] ) ? $args['hub'] : array();
$sections = isset( $hub['sections'] ) && is_array( $hub['sections'] ) ? $hub['sections'] : array();

if ( empty( $sections ) ) {
	return;
}
?>
<section class="hub-sections">
  <div class="hub-sections__inner">
    <?php foreach ( $sections as $section ) : ?>
      <?php
      $type  = isset( $section['type'] ) ? (string) $section['type'] : 'text';
      $title = isset( $section['title'] ) ? (string) $section['title'] : '';
      $body  = isset( $section['body'] ) ? (string) $section['body'] : '';
      ?>
      <?php if ( 'stats' === $type && ! empty( $section['items'] ) ) : ?>
      <div class="hub-stats">
        <?php foreach ( $section['items'] as $stat ) : ?>
        <div class="hub-stat">
          <span class="hub-stat__value"><?php echo esc_html( $stat['value'] ?? '' ); ?></span>
          <span class="hub-stat__label"><?php echo esc_html( $stat['label'] ?? '' ); ?></span>
        </div>
        <?php endforeach; ?>
      </div>
      <?php else : ?>
      <article class="hub-block">
        <?php if ( $title ) : ?>
        <h2 class="hub-block__title"><?php echo esc_html( $title ); ?></h2>
        <?php endif; ?>
        <?php if ( $body ) : ?>
        <p class="hub-block__body"><?php echo esc_html( $body ); ?></p>
        <?php endif; ?>
      </article>
      <?php endif; ?>
    <?php endforeach; ?>
  </div>
</section>
