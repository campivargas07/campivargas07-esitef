<?php
/**
 * FAQ accordion.
 *
 * @package esitef-minimal
 *
 * @var array<string, mixed> $args
 */

$faqs    = isset( $args['faqs'] ) && is_array( $args['faqs'] ) ? $args['faqs'] : array();
$columns = isset( $args['columns'] ) ? (int) $args['columns'] : 1;
$slug    = isset( $args['slug'] ) ? (string) $args['slug'] : '';
if ( empty( $faqs ) ) {
	return;
}
$cols_class = $columns > 1 ? ' hub-faq__list--cols-' . (int) $columns : '';
?>
<section class="hub-faq hub-faq--<?php echo esc_attr( $slug ); ?>" aria-labelledby="hub-faq-title">
  <div class="hub-faq__inner">
    <h2 id="hub-faq-title" class="hub-faq__title"><?php esc_html_e( 'Preguntas frecuentes', 'esitef-minimal' ); ?></h2>
    <div class="hub-faq__list accordion-container<?php echo esc_attr( $cols_class ); ?>">
      <?php foreach ( $faqs as $faq ) : ?>
      <div class="accordion-item hub-faq__item">
        <button type="button" class="accordion-header hub-faq__question" aria-expanded="false">
          <span><?php echo esc_html( $faq['q'] ?? '' ); ?></span>
          <span class="accordion-icon" aria-hidden="true">+</span>
        </button>
        <div class="accordion-content hub-faq__answer">
          <div class="accordion-content-inner">
            <p><?php echo esc_html( $faq['a'] ?? '' ); ?></p>
          </div>
        </div>
      </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>
