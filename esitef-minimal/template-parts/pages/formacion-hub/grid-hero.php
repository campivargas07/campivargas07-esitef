<?php
/**
 * Hero visual para páginas grid (masterclass, talleres, CFM).
 *
 * @package esitef-minimal
 *
 * @var array<string, mixed> $args
 */

$hub  = isset( $args['hub'] ) ? $args['hub'] : array();
$slug = isset( $args['slug'] ) ? (string) $args['slug'] : '';

$title       = isset( $hub['title'] ) ? (string) $hub['title'] : '';
$subtitle    = isset( $hub['subtitle'] ) ? (string) $hub['subtitle'] : '';
$intro       = isset( $hub['intro'] ) ? (string) $hub['intro'] : '';
$cover_image = isset( $hub['cover_image'] ) ? (string) $hub['cover_image'] : '';
?>
<section class="hub-grid-hero hub-grid-hero--<?php echo esc_attr( $slug ); ?>" aria-label="<?php echo esc_attr( $title ); ?>">
  <div class="hub-grid-hero__pattern" aria-hidden="true"></div>
  <?php if ( $cover_image ) : ?>
  <div class="hub-grid-hero__cover" aria-hidden="true">
    <img src="<?php echo esc_url( $cover_image ); ?>" alt="" loading="eager" width="1400" height="600">
    <div class="hub-grid-hero__cover-overlay"></div>
  </div>
  <?php endif; ?>
  <div class="hub-grid-hero__inner">
    <div class="hub-grid-hero__content">
      <p class="hub-grid-hero__label"><? esc_html_e( 'Formación Online', 'esitef-minimal' ); ?></p>
      <h1 class="hub-grid-hero__title"><?php echo esc_html( $title ); ?></h1>
      <?php if ( $subtitle ) : ?>
      <p class="hub-grid-hero__subtitle"><?php echo esc_html( $subtitle ); ?></p>
      <?php endif; ?>
      <?php if ( $intro ) : ?>
      <p class="hub-grid-hero__intro"><?php echo esc_html( $intro ); ?></p>
      <?php endif; ?>
    </div>
  </div>
</section>
