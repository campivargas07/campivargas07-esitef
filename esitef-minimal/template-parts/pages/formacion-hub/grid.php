<?php
/**
 * Grid de cursos/items del hub.
 *
 * @package esitef-minimal
 *
 * @var array<string, mixed> $args
 */

$hub         = isset( $args['hub'] ) ? $args['hub'] : array();
$slug        = isset( $args['slug'] ) ? (string) $args['slug'] : '';
$items       = isset( $hub['items'] ) && is_array( $hub['items'] ) ? $hub['items'] : array();
$show_meta   = ! empty( $hub['show_meta'] );
$grid_style  = isset( $hub['grid_style'] ) ? (string) $hub['grid_style'] : 'showcase';
$grid_cols   = isset( $hub['grid_cols'] ) ? (int) $hub['grid_cols'] : 2;
$total       = count( $items );
$remainder   = $grid_cols > 0 ? $total % $grid_cols : 0;
$is_masterclass = ( 'masterclass' === $grid_style );
$show_excerpt   = ! isset( $hub['show_excerpt'] ) || ! empty( $hub['show_excerpt'] );
?>
<section class="hub-showcase-section hub-showcase-section--<?php echo esc_attr( $slug ); ?><?php echo $is_masterclass ? ' hub-showcase-section--masterclass' : ''; ?>" aria-label="<?php echo esc_attr( $hub['title'] ?? '' ); ?>">
  <div class="hub-showcase-inner">
    <div class="hub-showcase-grid hub-showcase-grid--<?php echo esc_attr( $grid_style ); ?> hub-showcase-grid--cols-<?php echo (int) $grid_cols; ?><?php echo $remainder ? ' hub-showcase-grid--remainder-' . (int) $remainder : ''; ?>">
      <?php foreach ( $items as $index => $item ) : ?>
        <?php
        $url        = esitef_resolve_course_url( $item );
        $img        = isset( $item['img'] ) ? (string) $item['img'] : '';
        $item_title = isset( $item['title'] ) ? (string) $item['title'] : '';
        $excerpt    = isset( $item['excerpt'] ) ? (string) $item['excerpt'] : '';
        $badge      = isset( $item['badge'] ) ? (string) $item['badge'] : '';
        $duration   = isset( $item['duration'] ) ? (string) $item['duration'] : '';
        $price      = isset( $item['price'] ) ? (string) $item['price'] : '';
        $is_last    = ( $index === $total - 1 );
        $is_solo    = $is_last && 1 === $remainder;
        ?>
        <?php if ( $is_masterclass ) : ?>
      <article class="hub-mc-card">
        <a href="<?php echo esc_url( $url ); ?>" class="hub-mc-card__link">
          <?php if ( $img ) : ?>
          <div class="hub-mc-card__thumb">
            <img src="<?php echo esc_url( $img ); ?>" alt="<?php echo esc_attr( $item_title ); ?>" loading="lazy" width="80" height="80">
          </div>
          <?php endif; ?>
          <h3 class="hub-mc-card__title"><?php echo esc_html( $item_title ); ?></h3>
          <div class="hub-mc-card__footer">
            <span class="hub-mc-card__btn"><?php esc_html_e( 'Ver más', 'esitef-minimal' ); ?></span>
            <?php if ( $price ) : ?>
            <span class="hub-mc-card__price"><?php echo esc_html( $price ); ?></span>
            <?php endif; ?>
          </div>
        </a>
      </article>
        <?php else : ?>
          <?php
          $card_class = 'hub-showcase-card' . ( $is_solo ? ' hub-showcase-card--solo' : '' );
          ?>
      <article class="<?php echo esc_attr( $card_class ); ?>">
        <a href="<?php echo esc_url( $url ); ?>" class="hub-showcase-card__link">
          <div class="hub-showcase-card__media">
            <?php if ( $badge ) : ?>
            <span class="hub-showcase-card__badge"><?php echo esc_html( $badge ); ?></span>
            <?php endif; ?>
            <?php if ( $img ) : ?>
            <img src="<?php echo esc_url( $img ); ?>" alt="<?php echo esc_attr( $item_title ); ?>" loading="lazy" width="600" height="380">
            <?php endif; ?>
            <div class="hub-showcase-card__media-shade" aria-hidden="true"></div>
            <?php if ( $show_meta && $price ) : ?>
            <span class="hub-showcase-card__price"><?php echo esc_html( $price ); ?></span>
            <?php endif; ?>
          </div>
          <div class="hub-showcase-card__body">
            <?php if ( $show_meta && $duration ) : ?>
            <span class="hub-showcase-card__duration"><?php echo esc_html( $duration ); ?></span>
            <?php endif; ?>
            <h3 class="hub-showcase-card__title"><?php echo esc_html( $item_title ); ?></h3>
            <?php if ( $show_excerpt && $excerpt ) : ?>
            <p class="hub-showcase-card__excerpt"><?php echo esc_html( $excerpt ); ?></p>
            <?php endif; ?>
            <span class="hub-showcase-card__cta">
              <?php esc_html_e( 'Ver más', 'esitef-minimal' ); ?>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </span>
          </div>
        </a>
      </article>
        <?php endif; ?>
      <?php endforeach; ?>
    </div>
  </div>
</section>
