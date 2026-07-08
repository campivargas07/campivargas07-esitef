<?php
/**
 * Cabecera grid — texto centrado (sin banner).
 *
 * @package esitef-minimal
 *
 * @var array<string, mixed> $args
 */

$hub  = isset( $args['hub'] ) ? $args['hub'] : array();
$slug = isset( $args['slug'] ) ? (string) $args['slug'] : '';

$title    = isset( $hub['header_title'] ) ? (string) $hub['header_title'] : ( isset( $hub['title'] ) ? (string) $hub['title'] : '' );
$subtitle = isset( $hub['header_subtitle'] ) ? (string) $hub['header_subtitle'] : ( isset( $hub['subtitle'] ) ? (string) $hub['subtitle'] : '' );
$intro    = isset( $hub['header_intro'] ) ? (string) $hub['header_intro'] : ( isset( $hub['intro'] ) ? (string) $hub['intro'] : '' );
?>
<section class="hub-grid-header hub-grid-header--<?php echo esc_attr( $slug ); ?>" aria-label="<?php echo esc_attr( $title ); ?>">
  <div class="hub-grid-header__inner">
    <h1 class="hub-grid-header__title"><?php echo esc_html( $title ); ?></h1>
    <?php if ( $subtitle ) : ?>
    <p class="hub-grid-header__subtitle"><?php echo esc_html( $subtitle ); ?></p>
    <?php endif; ?>
    <?php if ( $intro ) : ?>
    <div class="hub-grid-header__intro"><?php echo nl2br( esc_html( $intro ) ); ?></div>
    <?php endif; ?>
  </div>
</section>
