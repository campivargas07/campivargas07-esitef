<?php
/**
 * Intro split (imagen + texto) para landings.
 *
 * @package esitef-minimal
 *
 * @var array<string, mixed> $args
 */

$hub   = isset( $args['hub'] ) ? $args['hub'] : array();
$intro = isset( $hub['intro'] ) && is_array( $hub['intro'] ) ? $hub['intro'] : array();

if ( empty( $intro['body'] ) ) {
	return;
}

$body      = (string) $intro['body'];
$image     = isset( $intro['image'] ) ? (string) $intro['image'] : '';
$image_alt = isset( $intro['image_alt'] ) ? (string) $intro['image_alt'] : '';
$reverse   = ! empty( $intro['reverse'] );
?>
<section class="hub-split<?php echo $reverse ? ' hub-split--reverse' : ''; ?>">
  <div class="hub-split__inner">
    <?php if ( $image ) : ?>
    <div class="hub-split__media">
      <div class="hub-split__media-frame">
        <img src="<?php echo esc_url( $image ); ?>" alt="<?php echo esc_attr( $image_alt ); ?>" loading="lazy" width="900" height="700">
      </div>
    </div>
    <?php endif; ?>
    <div class="hub-split__content">
      <p class="hub-split__body"><?php echo esc_html( $body ); ?></p>
    </div>
  </div>
</section>
