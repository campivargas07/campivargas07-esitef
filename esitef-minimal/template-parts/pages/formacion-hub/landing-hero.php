<?php
/**
 * Hero visual de landing hub (split layout + imagen).
 *
 * @package esitef-minimal
 *
 * @var array<string, mixed> $args
 */

$hub  = isset( $args['hub'] ) ? $args['hub'] : array();
$slug = isset( $args['slug'] ) ? (string) $args['slug'] : '';
$hero = isset( $hub['hero'] ) && is_array( $hub['hero'] ) ? $hub['hero'] : array();
$cta  = isset( $hub['cta'] ) && is_array( $hub['cta'] ) ? $hub['cta'] : array();

$eyebrow   = isset( $hero['eyebrow'] ) ? (string) $hero['eyebrow'] : '';
$title     = isset( $hero['title'] ) ? (string) $hero['title'] : ( isset( $hub['title'] ) ? (string) $hub['title'] : '' );
$subtitle  = isset( $hero['subtitle'] ) ? (string) $hero['subtitle'] : ( isset( $hub['subtitle'] ) ? (string) $hub['subtitle'] : '' );
$rating    = isset( $hero['rating'] ) ? (string) $hero['rating'] : '';
$reviews   = isset( $hero['reviews'] ) ? (int) $hero['reviews'] : 0;
$image     = isset( $hero['image'] ) ? (string) $hero['image'] : '';
$image_alt = isset( $hero['image_alt'] ) ? (string) $hero['image_alt'] : $title;
$text_only = ! empty( $hero['text_only'] );
$hide_cta  = ! empty( $hero['hide_cta'] ) || $text_only;
$cta_url   = esitef_get_hub_cta_url( $hub );
$cta_label = isset( $cta['label'] ) ? (string) $cta['label'] : __( 'Comprar', 'esitef-minimal' );
?>
<section class="hub-landing-hero hub-landing-hero--<?php echo esc_attr( $slug ); ?><?php echo $text_only ? ' hub-landing-hero--text-only' : ''; ?>">
  <div class="hub-landing-hero__pattern" aria-hidden="true"></div>
  <div class="hub-landing-hero__blob" aria-hidden="true"></div>
  <div class="hub-landing-hero__inner">
    <div class="hub-landing-hero__content">
      <?php if ( $eyebrow ) : ?>
      <p class="hub-landing-hero__eyebrow"><?php echo esc_html( $eyebrow ); ?></p>
      <?php endif; ?>
      <h1 class="hub-landing-hero__title"><?php echo esc_html( $title ); ?></h1>
      <?php if ( $rating ) : ?>
      <div class="hub-landing-hero__rating" aria-label="<?php echo esc_attr( sprintf( __( 'Valoración %s de 5', 'esitef-minimal' ), $rating ) ); ?>">
        <span class="hub-landing-hero__stars" aria-hidden="true">★★★★★</span>
        <span class="hub-landing-hero__rating-value"><?php echo esc_html( $rating ); ?></span>
        <?php if ( $reviews ) : ?>
        <span class="hub-landing-hero__rating-count"><?php echo esc_html( sprintf( _n( '%d valoración', '%d valoraciones', $reviews, 'esitef-minimal' ), $reviews ) ); ?></span>
        <?php endif; ?>
      </div>
      <?php endif; ?>
      <?php if ( $subtitle ) : ?>
      <p class="hub-landing-hero__subtitle"><?php echo esc_html( $subtitle ); ?></p>
      <?php endif; ?>
      <?php if ( ! $hide_cta && $cta_url && '#' !== $cta_url ) : ?>
      <div class="hub-landing-hero__actions">
        <a href="<?php echo esc_url( $cta_url ); ?>" class="hub-landing-hero__cta hub-landing-hero__cta--primary"><?php echo esc_html( $cta_label ); ?></a>
        <a href="#precio" class="hub-landing-hero__cta hub-landing-hero__cta--ghost"><?php esc_html_e( 'Ver precio', 'esitef-minimal' ); ?></a>
      </div>
      <?php endif; ?>
    </div>
    <?php if ( $image ) : ?>
    <div class="hub-landing-hero__media">
      <div class="hub-landing-hero__media-frame">
        <img src="<?php echo esc_url( $image ); ?>" alt="<?php echo esc_attr( $image_alt ); ?>" loading="eager" width="900" height="700">
      </div>
    </div>
    <?php endif; ?>
  </div>
</section>
