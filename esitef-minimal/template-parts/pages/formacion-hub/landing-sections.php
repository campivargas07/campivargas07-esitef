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
      <?php if ( 'split' === $type ) : ?>
        <?php
        $items       = isset( $section['items'] ) && is_array( $section['items'] ) ? $section['items'] : array();
        $subsections = isset( $section['subsections'] ) && is_array( $section['subsections'] ) ? $section['subsections'] : array();
        $video       = isset( $section['video'] ) ? (string) $section['video'] : '';
        $reverse     = ! empty( $section['reverse'] );
        $vimeo_url   = $video ? esitef_hub_vimeo_embed_url( $video ) : '';
        ?>
      <div class="hub-split<?php echo $reverse ? ' hub-split--reverse' : ''; ?>">
        <div class="hub-split__inner">
          <div class="hub-split__content">
            <?php if ( $title ) : ?>
            <h2 class="hub-split__title"><?php echo esc_html( $title ); ?></h2>
            <?php endif; ?>
            <?php if ( $items ) : ?>
            <ul class="hub-split__list">
              <?php foreach ( $items as $item ) : ?>
              <li><?php echo esc_html( $item ); ?></li>
              <?php endforeach; ?>
            </ul>
            <?php endif; ?>
            <?php foreach ( $subsections as $sub ) : ?>
              <?php if ( ! empty( $sub['title'] ) || ! empty( $sub['body'] ) ) : ?>
              <div class="hub-split__sub">
                <?php if ( ! empty( $sub['title'] ) ) : ?>
                <h3 class="hub-split__subtitle"><?php echo esc_html( $sub['title'] ); ?></h3>
                <?php endif; ?>
                <?php if ( ! empty( $sub['body'] ) ) : ?>
                <p class="hub-split__body"><?php echo esc_html( $sub['body'] ); ?></p>
                <?php endif; ?>
              </div>
              <?php endif; ?>
            <?php endforeach; ?>
          </div>
          <?php if ( $vimeo_url ) : ?>
          <div class="hub-split__media">
            <div class="hub-split__media-frame hub-split__media-frame--video">
              <div class="tutor-ratio tutor-ratio-16x9">
                <iframe src="<?php echo esc_url( $vimeo_url ); ?>" title="<?php echo esc_attr( $title ?: __( 'Vídeo del programa', 'esitef-minimal' ) ); ?>" frameborder="0" allowfullscreen allow="autoplay; encrypted-media; picture-in-picture"></iframe>
              </div>
            </div>
          </div>
          <?php endif; ?>
        </div>
      </div>
      <?php elseif ( 'stats' === $type && ! empty( $section['items'] ) ) : ?>
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
