<?php
/**
 * Planning — tabs o acordeón (estilo presencial).
 *
 * @package esitef-minimal
 *
 * @var array<string, mixed> $args
 */

$planning    = isset( $args['planning'] ) && is_array( $args['planning'] ) ? $args['planning'] : array();
$title       = isset( $args['title'] ) && $args['title'] ? (string) $args['title'] : __( 'Planning de contenidos', 'esitef-minimal' );
$description = isset( $args['description'] ) ? (string) $args['description'] : '';
$style       = isset( $args['style'] ) ? (string) $args['style'] : 'tabs';

if ( empty( $planning ) ) {
	return;
}
?>
<?php if ( 'accordion' === $style ) : ?>
<section class="hub-planning hub-planning--accordion course-syllabus">
  <div class="syllabus-card">
    <div class="syllabus-bg" aria-hidden="true"></div>
    <div class="syllabus-inner">
      <div class="syllabus-left">
        <h2><?php echo esc_html( $title ); ?></h2>
        <?php if ( $description ) : ?>
        <p><?php echo esc_html( $description ); ?></p>
        <?php endif; ?>
      </div>
      <div class="accordion-container">
        <?php foreach ( $planning as $module ) : ?>
          <?php
          $module_title = isset( $module['month'] ) ? (string) $module['month'] : '';
          $module_items = isset( $module['items'] ) && is_array( $module['items'] ) ? $module['items'] : array();
          if ( '' === $module_title ) {
            continue;
          }
          ?>
        <div class="accordion-item">
          <button type="button" class="accordion-header" aria-expanded="false">
            <span><?php echo esc_html( $module_title ); ?></span>
            <span class="accordion-icon" aria-hidden="true">+</span>
          </button>
          <div class="accordion-content">
            <div class="accordion-content-inner">
              <?php if ( $module_items ) : ?>
              <ul class="hub-planning__list">
                <?php foreach ( $module_items as $item ) : ?>
                <li><?php echo esc_html( $item ); ?></li>
                <?php endforeach; ?>
              </ul>
              <?php endif; ?>
            </div>
          </div>
        </div>
        <?php endforeach; ?>
      </div>
    </div>
  </div>
</section>
<?php else : ?>
<section class="hub-planning">
  <div class="hub-planning__inner">
    <h2 class="hub-planning__title"><?php echo esc_html( $title ); ?></h2>
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
<?php endif; ?>
