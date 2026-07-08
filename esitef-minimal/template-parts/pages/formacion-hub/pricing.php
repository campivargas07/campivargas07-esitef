<?php
/**
 * Pricing — planes o precio único.
 *
 * @package esitef-minimal
 *
 * @var array<string, mixed> $args
 */

$hub     = isset( $args['hub'] ) ? $args['hub'] : array();
$pricing = isset( $hub['pricing'] ) && is_array( $hub['pricing'] ) ? $hub['pricing'] : array();
$cta     = isset( $hub['cta'] ) && is_array( $hub['cta'] ) ? $hub['cta'] : array();

if ( empty( $pricing ) ) {
	return;
}

$type = isset( $pricing['type'] ) ? (string) $pricing['type'] : 'single';
$pricing_title = isset( $pricing['title'] ) ? (string) $pricing['title'] : '';
?>
<section class="hub-pricing" id="precio">
  <div class="hub-pricing__inner">
    <h2 class="hub-pricing__title">
      <?php
      if ( $pricing_title ) {
		echo esc_html( $pricing_title );
      } elseif ( 'plans' === $type ) {
		esc_html_e( 'Selecciona el plan que desees adquirir', 'esitef-minimal' );
      } else {
		esc_html_e( '¿Cuánto cuesta adquirir la formación?', 'esitef-minimal' );
      }
      ?>
    </h2>

    <?php if ( 'plans' === $type && ! empty( $pricing['plans'] ) ) : ?>
    <div class="hub-pricing__plans">
      <?php foreach ( $pricing['plans'] as $plan ) : ?>
        <?php
        $highlight = ! empty( $plan['highlight'] );
        $url       = esitef_resolve_course_url( array( 'course_slug' => $plan['course_slug'] ?? '' ) );
        ?>
      <article class="hub-plan<?php echo $highlight ? ' hub-plan--highlight' : ''; ?>">
        <h3 class="hub-plan__name"><?php echo esc_html( $plan['name'] ?? '' ); ?></h3>
        <div class="hub-plan__price">
          <span class="hub-plan__amount"><?php echo esc_html( $plan['price'] ?? '' ); ?></span>
          <span class="hub-plan__currency"><?php echo esc_html( $plan['currency'] ?? 'USD' ); ?></span>
        </div>
        <?php if ( ! empty( $plan['period'] ) ) : ?>
        <p class="hub-plan__period"><?php echo esc_html( $plan['period'] ); ?></p>
        <?php endif; ?>
        <?php if ( ! empty( $plan['features'] ) ) : ?>
        <ul class="hub-plan__features">
          <?php foreach ( $plan['features'] as $feature ) : ?>
          <li><?php echo esc_html( $feature ); ?></li>
          <?php endforeach; ?>
        </ul>
        <?php endif; ?>
        <a href="<?php echo esc_url( $url ); ?>" class="hub-plan__cta"><?php esc_html_e( 'Comprar', 'esitef-minimal' ); ?></a>
      </article>
      <?php endforeach; ?>
    </div>

    <?php elseif ( 'promo' === $type ) : ?>
    <div class="hub-pricing__promo">
      <?php if ( ! empty( $pricing['discount'] ) ) : ?>
      <p class="hub-pricing__discount"><?php echo esc_html( $pricing['discount'] ); ?></p>
      <?php endif; ?>
      <div class="hub-pricing__price-row">
        <span class="hub-pricing__price hub-pricing__price--old"><?php echo esc_html( ( $pricing['price_old'] ?? '' ) . ' ' . ( $pricing['currency'] ?? 'USD' ) ); ?></span>
        <span class="hub-pricing__price hub-pricing__price--current"><?php echo esc_html( ( $pricing['price'] ?? '' ) . ' ' . ( $pricing['currency'] ?? 'USD' ) ); ?></span>
      </div>
      <?php if ( ! empty( $pricing['alt_prices'] ) ) : ?>
      <ul class="hub-pricing__alt">
        <?php foreach ( $pricing['alt_prices'] as $alt ) : ?>
        <li>
          <s><?php echo esc_html( ( $alt[1] ?? '' ) . ' ' . ( $alt[2] ?? '' ) ); ?></s>
          <?php echo esc_html( ( $alt[0] ?? '' ) . ' ' . ( $alt[2] ?? '' ) ); ?>
        </li>
        <?php endforeach; ?>
      </ul>
      <?php endif; ?>
      <?php
      $url = esitef_resolve_course_url( array( 'course_slug' => $pricing['course_slug'] ?? '' ) );
      $label = $cta['label'] ?? __( 'Comprar', 'esitef-minimal' );
      ?>
      <a href="<?php echo esc_url( $url ); ?>" class="hub-hero__cta"><?php echo esc_html( $label ); ?></a>
    </div>

    <?php else : ?>
    <div class="hub-pricing__single">
      <div class="hub-pricing__price-row">
        <?php if ( ! empty( $pricing['price_flag'] ) ) : ?>
        <span class="hub-pricing__flag" aria-hidden="true"><?php echo esc_html( $pricing['price_flag'] ); ?></span>
        <?php endif; ?>
        <span class="hub-pricing__price hub-pricing__price--current"><?php echo esc_html( ( $pricing['price'] ?? '' ) . ' ' . ( $pricing['currency'] ?? 'USD' ) ); ?></span>
      </div>
      <?php if ( ! empty( $pricing['alt_prices'] ) ) : ?>
      <ul class="hub-pricing__alt hub-pricing__alt--flags">
        <?php foreach ( $pricing['alt_prices'] as $alt ) : ?>
        <li>
          <?php if ( is_array( $alt ) ) : ?>
          <span class="hub-pricing__flag" aria-hidden="true"><?php echo esc_html( $alt['flag'] ?? '' ); ?></span>
          <span><?php echo esc_html( ( $alt['amount'] ?? '' ) . ' ' . ( $alt['currency'] ?? '' ) ); ?></span>
          <?php else : ?>
          <?php echo esc_html( $alt ); ?>
          <?php endif; ?>
        </li>
        <?php endforeach; ?>
      </ul>
      <?php endif; ?>
      <?php
      $url   = esitef_resolve_course_url( array( 'course_slug' => $pricing['course_slug'] ?? '' ) );
      $label = $cta['label'] ?? __( 'Comprar ahora', 'esitef-minimal' );
      ?>
      <a href="<?php echo esc_url( $url ); ?>" class="hub-hero__cta"><?php echo esc_html( $label ); ?></a>
    </div>
    <?php endif; ?>
  </div>
</section>
