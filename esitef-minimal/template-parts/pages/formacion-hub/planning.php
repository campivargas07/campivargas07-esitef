<?php
/**
 * Planning mensual (Club de actualización).
 *
 * @package esitef-minimal
 *
 * @var array<string, mixed> $args
 */

$planning = isset( $args['planning'] ) && is_array( $args['planning'] ) ? $args['planning'] : array();
if ( empty( $planning ) ) {
	return;
}
?>
<section class="hub-planning">
  <div class="hub-planning__inner">
    <h2 class="hub-planning__title"><?php esc_html_e( 'Planning de contenidos', 'esitef-minimal' ); ?></h2>
    <div class="hub-planning__tabs" role="tablist">
      <?php foreach ( $planning as $i => $month ) : ?>
      <button
        type="button"
        class="hub-planning__tab<?php echo 0 === $i ? ' is-active' : ''; ?>"
        role="tab"
        aria-selected="<?php echo 0 === $i ? 'true' : 'false'; ?>"
        data-planning-tab="<?php echo esc_attr( (string) $i ); ?>"
      ><?php echo esc_html( $month['month'] ?? '' ); ?></button>
      <?php endforeach; ?>
    </div>
    <div class="hub-planning__panels">
      <?php foreach ( $planning as $i => $month ) : ?>
      <div
        class="hub-planning__panel<?php echo 0 === $i ? ' is-active' : ''; ?>"
        role="tabpanel"
        data-planning-panel="<?php echo esc_attr( (string) $i ); ?>"
        <?php echo $i > 0 ? 'hidden' : ''; ?>
      >
        <?php if ( ! empty( $month['items'] ) ) : ?>
        <ul class="hub-planning__list">
          <?php foreach ( $month['items'] as $item ) : ?>
          <li><?php echo esc_html( $item ); ?></li>
          <?php endforeach; ?>
        </ul>
        <?php endif; ?>
      </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>
