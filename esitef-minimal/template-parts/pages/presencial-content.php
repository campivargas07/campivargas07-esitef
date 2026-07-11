<?php
/**
 * Curso presencial — landing dinámica.
 *
 * @package esitef-minimal
 *
 * @var array<string, mixed> $args
 */

$formacion = isset( $args['formacion'] ) ? $args['formacion'] : array();
if ( empty( $formacion ) ) {
	return;
}

$subtitle    = isset( $formacion['subtitle'] ) ? (string) $formacion['subtitle'] : '';
$title       = isset( $formacion['title'] ) ? (string) $formacion['title'] : '';
$title_bold  = isset( $formacion['title_bold'] ) ? (string) $formacion['title_bold'] : '';
$hero_meta   = isset( $formacion['hero_meta'] ) && is_array( $formacion['hero_meta'] ) ? $formacion['hero_meta'] : array();
$hero_image  = isset( $formacion['hero_image'] ) && is_array( $formacion['hero_image'] ) ? $formacion['hero_image'] : array();
$mission     = isset( $formacion['mission'] ) ? (string) $formacion['mission'] : '';
$stats       = isset( $formacion['stats'] ) && is_array( $formacion['stats'] ) ? $formacion['stats'] : array();
$stats_media = isset( $formacion['stats_media'] ) && is_array( $formacion['stats_media'] ) ? $formacion['stats_media'] : array();
$syllabus    = isset( $formacion['syllabus'] ) && is_array( $formacion['syllabus'] ) ? $formacion['syllabus'] : array();
$program     = isset( $formacion['program'] ) && is_array( $formacion['program'] ) ? $formacion['program'] : array();
$professors  = isset( $formacion['professors_resolved'] ) && is_array( $formacion['professors_resolved'] ) ? $formacion['professors_resolved'] : array();
$inscription = isset( $formacion['inscription'] ) && is_array( $formacion['inscription'] ) ? $formacion['inscription'] : array();

$hero_url = isset( $hero_image['url'] ) ? (string) $hero_image['url'] : '';
$hero_alt = isset( $hero_image['alt'] ) ? (string) $hero_image['alt'] : $title;

$syllabus_title = isset( $syllabus['title'] ) ? (string) $syllabus['title'] : __( 'Programa', 'esitef-minimal' );
$syllabus_desc  = isset( $syllabus['description'] ) ? (string) $syllabus['description'] : '';
$syllabus_pdf   = isset( $syllabus['pdf_url'] ) ? (string) $syllabus['pdf_url'] : '';

$media_url = isset( $stats_media['url'] ) ? (string) $stats_media['url'] : '';
$media_alt = isset( $stats_media['alt'] ) ? (string) $stats_media['alt'] : '';

$investment  = isset( $inscription['investment'] ) ? (string) $inscription['investment'] : '';
$deposit     = isset( $inscription['deposit'] ) ? (string) $inscription['deposit'] : '';
$concept     = isset( $inscription['concept'] ) ? (string) $inscription['concept'] : '';
$holder      = isset( $inscription['holder'] ) ? (string) $inscription['holder'] : '';
$accounts    = isset( $inscription['accounts'] ) && is_array( $inscription['accounts'] ) ? $inscription['accounts'] : array();
$discounts   = isset( $inscription['discounts'] ) && is_array( $inscription['discounts'] ) ? $inscription['discounts'] : array();
$whatsapp_url = isset( $inscription['whatsapp_url'] ) ? (string) $inscription['whatsapp_url'] : '';
$email_url    = isset( $inscription['email_url'] ) ? (string) $inscription['email_url'] : '';
$page_slug    = isset( $formacion['page_slug'] ) ? (string) $formacion['page_slug'] : '';
$online_only  = function_exists( 'esitef_online_only_sales' ) && esitef_online_only_sales();
$checkout_on  = ! $online_only && $page_slug && function_exists( 'esitef_presencial_checkout_enabled' ) && esitef_presencial_checkout_enabled( $page_slug );
$checkout_cfg = $checkout_on ? esitef_get_presencial_checkout_config( $page_slug ) : null;
$default_plan = ( $checkout_cfg && ! empty( $checkout_cfg['default_plan'] ) ) ? (string) $checkout_cfg['default_plan'] : '3-cuotas';
$checkout_url = $checkout_on ? esitef_presencial_get_add_to_cart_url( $page_slug, $default_plan ) : '';
$course_label = trim( $title . ( $title_bold ? ' ' . $title_bold : '' ) );
?>
<!-- =====================================================
     HERO SECTION
     ===================================================== -->
<section class="course-hero">
  <div class="hero-content">
    <?php if ( $subtitle ) : ?>
    <span class="subtitle"><?php echo esc_html( $subtitle ); ?></span>
    <?php endif; ?>
    <h1>
      <?php if ( $title_bold ) : ?>
      <b><?php echo esc_html( $title ); ?></b> <?php echo esc_html( $title_bold ); ?>
      <?php else : ?>
      <?php echo esc_html( $title ); ?>
      <?php endif; ?>
    </h1>

    <?php if ( $hero_meta ) : ?>
    <div class="hero-meta">
      <?php foreach ( $hero_meta as $index => $meta ) : ?>
        <?php
        $icon  = isset( $meta['icon'] ) ? (string) $meta['icon'] : 'calendar';
        $value = isset( $meta['value'] ) ? (string) $meta['value'] : '';
        if ( '' === $value ) {
          continue;
        }
        ?>
        <?php if ( $index > 0 ) : ?>
        <span class="hero-meta-sep" aria-hidden="true"></span>
        <?php endif; ?>
      <article class="hero-meta-item">
        <div class="hero-meta-icon">
          <?php echo esitef_presencial_hero_icon_svg( $icon ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
        </div>
        <div class="hero-meta-body">
          <span class="hero-meta-value"><?php echo esc_html( $value ); ?></span>
        </div>
      </article>
      <?php endforeach; ?>
    </div>
    <?php endif; ?>

    <?php if ( $checkout_url ) : ?>
    <a href="<?php echo esc_url( $checkout_url ); ?>" class="hero-btn"><?php esc_html_e( 'Inscribirme ahora', 'esitef-minimal' ); ?></a>
    <?php elseif ( $online_only ) : ?>
    <a href="#reservar-plaza" class="hero-btn"><?php esc_html_e( 'Reservar plaza', 'esitef-minimal' ); ?></a>
    <?php else : ?>
    <a href="#inscribirme" class="hero-btn js-presencial-inscribe"><?php esc_html_e( 'Inscribirme ahora', 'esitef-minimal' ); ?></a>
    <?php endif; ?>
  </div>

  <?php if ( $hero_url ) : ?>
  <div class="hero-image">
    <img src="<?php echo esc_url( $hero_url ); ?>" alt="<?php echo esc_attr( $hero_alt ); ?>">
  </div>
  <?php endif; ?>
</section>

<!-- =====================================================
     DATOS GENERALES & DESCRIPCIÓN
     ===================================================== -->
<section class="course-details">
  <?php if ( $mission ) : ?>
  <div class="mission-card">
    <div class="mission-main-text">
      <?php echo wp_kses_post( $mission ); ?>
    </div>
  </div>
  <?php endif; ?>

  <?php if ( $stats || $media_url ) : ?>
  <div class="stats-grid">
    <?php foreach ( $stats as $stat ) : ?>
      <?php
      $stat_key   = isset( $stat['key'] ) ? (string) $stat['key'] : 'ubicacion';
      $stat_label = isset( $stat['label'] ) ? (string) $stat['label'] : '';
      $stat_value = isset( $stat['value'] ) ? (string) $stat['value'] : '';
      if ( '' === $stat_label || '' === $stat_value ) {
        continue;
      }
      ?>
    <div class="stat-card">
      <div class="stat-top">
        <div class="stat-icon">
          <?php echo esitef_presencial_stat_icon_svg( $stat_key ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
        </div>
        <h4><?php echo esc_html( $stat_label ); ?></h4>
      </div>
      <p><?php echo wp_kses_post( $stat_value ); ?></p>
    </div>
    <?php endforeach; ?>

    <?php if ( $media_url ) : ?>
    <div class="stat-card stat-card--media">
      <img src="<?php echo esc_url( $media_url ); ?>" alt="<?php echo esc_attr( $media_alt ); ?>" class="stat-card__img">
    </div>
    <?php endif; ?>
  </div>
  <?php endif; ?>
</section>

<!-- =====================================================
     PROGRAMA DEL CURSO (Acordeón)
     ===================================================== -->
<?php if ( $program ) : ?>
<section class="course-syllabus">
  <div class="syllabus-card">
    <div class="syllabus-bg" aria-hidden="true"></div>
    <div class="syllabus-inner">
      <div class="syllabus-left">
        <h2><?php echo esc_html( $syllabus_title ); ?></h2>
        <?php if ( $syllabus_desc ) : ?>
        <p><?php echo esc_html( $syllabus_desc ); ?></p>
        <?php endif; ?>
        <?php if ( $syllabus_pdf ) : ?>
        <a href="<?php echo esc_url( $syllabus_pdf ); ?>" class="syllabus-btn desktop-only-btn" target="_blank" rel="noopener noreferrer">
          <?php esc_html_e( 'Descargar PDF', 'esitef-minimal' ); ?>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </a>
        <?php endif; ?>
      </div>

      <div class="accordion-container">
        <?php foreach ( $program as $module ) : ?>
          <?php
          $module_title = isset( $module['title'] ) ? (string) $module['title'] : '';
          $module_items = isset( $module['items'] ) && is_array( $module['items'] ) ? $module['items'] : array();
          if ( '' === $module_title ) {
            continue;
          }
          ?>
        <div class="accordion-item">
          <button class="accordion-header" aria-expanded="false">
            <?php echo esc_html( $module_title ); ?>
            <span class="accordion-icon">+</span>
          </button>
          <div class="accordion-content">
            <div class="accordion-content-inner">
              <?php if ( $module_items ) : ?>
              <ul class="presencial-program-list">
                <?php foreach ( $module_items as $item ) : ?>
                <li><?php echo esc_html( (string) $item ); ?></li>
                <?php endforeach; ?>
              </ul>
              <?php endif; ?>
            </div>
          </div>
        </div>
        <?php endforeach; ?>
      </div>

      <?php if ( $syllabus_pdf ) : ?>
      <a href="<?php echo esc_url( $syllabus_pdf ); ?>" class="syllabus-btn mobile-only-btn" target="_blank" rel="noopener noreferrer">
        <?php esc_html_e( 'Descargar PDF', 'esitef-minimal' ); ?>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      </a>
      <?php endif; ?>
    </div>
  </div>
</section>
<?php endif; ?>

<!-- =====================================================
     DOCENTES
     ===================================================== -->
<?php if ( $professors ) : ?>
<section class="teachers-section">
  <h2><?php esc_html_e( 'Docentes de la Formación', 'esitef-minimal' ); ?></h2>
  <div class="teachers-grid-cascada">
    <?php foreach ( $professors as $professor ) : ?>
      <?php
      $prof_name  = isset( $professor['name'] ) ? (string) $professor['name'] : '';
      $prof_role  = isset( $professor['role'] ) ? (string) $professor['role'] : '';
      $prof_image = isset( $professor['image'] ) ? (string) $professor['image'] : '';
      $prof_bio   = isset( $professor['bio'] ) && is_array( $professor['bio'] ) ? $professor['bio'] : array();
      if ( '' === $prof_name ) {
        continue;
      }
      ?>
    <div class="teacher-card accordion-item">
      <?php if ( $prof_image ) : ?>
      <div class="teacher-avatar-corner">
        <img src="<?php echo esc_url( $prof_image ); ?>" alt="<?php echo esc_attr( $prof_name ); ?>">
      </div>
      <?php endif; ?>

      <button type="button" class="teacher-toggle accordion-header" aria-expanded="false">
        <span class="teacher-toggle__info">
          <span class="teacher-name"><?php echo esc_html( $prof_name ); ?></span>
          <?php if ( $prof_role ) : ?>
          <span class="teacher-role"><?php echo esc_html( $prof_role ); ?></span>
          <?php endif; ?>
        </span>
        <span class="accordion-icon" aria-hidden="true">+</span>
      </button>

      <div class="teacher-bio accordion-content">
        <div class="accordion-content-inner">
          <?php if ( $prof_bio ) : ?>
          <ul>
            <?php foreach ( $prof_bio as $line ) : ?>
            <li><?php echo esc_html( (string) $line ); ?></li>
            <?php endforeach; ?>
          </ul>
          <?php endif; ?>
        </div>
      </div>
    </div>
    <?php endforeach; ?>
  </div>
</section>
<?php endif; ?>

<!-- =====================================================
     MODAL INSCRIPCIÓN (fallback manual si no hay checkout online)
     ===================================================== -->
<?php if ( $online_only ) : ?>
	<?php
	get_template_part(
		'template-parts/pages/presencial-reserve-panel',
		null,
		array(
			'title'         => $course_label,
			'course_label'  => $course_label,
			'investment'    => $investment,
			'deposit'       => $deposit,
			'concept'       => $concept,
			'holder'        => $holder,
			'accounts'      => $accounts,
			'discounts'     => $discounts,
			'whatsapp_url'  => $whatsapp_url,
			'email_url'     => $email_url,
			'contact_email' => isset( $inscription['contact_email'] ) ? (string) $inscription['contact_email'] : 'info@esitef.com',
		)
	);
	?>
<?php elseif ( ! $checkout_on ) : ?>
<div class="presencial-inscribe" id="inscribirme" hidden aria-hidden="true">
  <div class="presencial-inscribe__overlay" data-presencial-close></div>
  <div class="presencial-inscribe__dialog" role="dialog" aria-modal="true" aria-labelledby="presencial-inscribe-title">
    <button type="button" class="presencial-inscribe__close" data-presencial-close aria-label="<?php esc_attr_e( 'Cerrar', 'esitef-minimal' ); ?>">&times;</button>

    <h2 id="presencial-inscribe-title"><?php esc_html_e( 'Para formalizar la inscripción (3 pasos)', 'esitef-minimal' ); ?></h2>

    <?php if ( $investment ) : ?>
    <div class="presencial-inscribe__investment">
      <strong><?php esc_html_e( 'Inversión:', 'esitef-minimal' ); ?></strong>
      <span><?php echo esc_html( $investment ); ?></span>
      <?php if ( $discounts ) : ?>
      <ul>
        <?php foreach ( $discounts as $discount ) : ?>
        <li><?php echo esc_html( (string) $discount ); ?></li>
        <?php endforeach; ?>
      </ul>
      <p class="presencial-inscribe__note"><?php esc_html_e( 'Las promociones no son acumulables.', 'esitef-minimal' ); ?></p>
      <?php endif; ?>
    </div>
    <?php endif; ?>

    <ol class="presencial-inscribe__steps">
      <li>
        <strong><?php esc_html_e( '1. Realizar un ingreso / transferencia de', 'esitef-minimal' ); ?> <?php echo esc_html( $deposit ); ?></strong>
        <ul>
          <li><?php esc_html_e( 'Nombre del participante.', 'esitef-minimal' ); ?></li>
          <?php if ( $concept ) : ?>
          <li><?php esc_html_e( 'Concepto:', 'esitef-minimal' ); ?> «<?php echo esc_html( $concept ); ?>»</li>
          <?php endif; ?>
        </ul>
        <?php if ( $accounts || $holder ) : ?>
        <div class="presencial-inscribe__accounts">
          <strong><?php esc_html_e( 'Cuenta para inscripción:', 'esitef-minimal' ); ?></strong>
          <?php foreach ( $accounts as $account ) : ?>
            <?php
            $acc_label  = isset( $account['label'] ) ? (string) $account['label'] : '';
            $acc_number = isset( $account['number'] ) ? (string) $account['number'] : '';
            ?>
            <?php if ( $acc_label && $acc_number ) : ?>
          <p><?php echo esc_html( $acc_label ); ?>: <?php echo esc_html( $acc_number ); ?></p>
            <?php endif; ?>
          <?php endforeach; ?>
          <?php if ( $holder ) : ?>
          <p><?php esc_html_e( 'Nombre:', 'esitef-minimal' ); ?> <?php echo esc_html( $holder ); ?></p>
          <?php endif; ?>
        </div>
        <?php endif; ?>
      </li>
      <li>
        <strong><?php esc_html_e( '2. Enviar el comprobante de ingreso', 'esitef-minimal' ); ?></strong>
        <?php if ( $whatsapp_url ) : ?>
        <p>
          <a href="<?php echo esc_url( $whatsapp_url ); ?>" class="presencial-inscribe__whatsapp" target="_blank" rel="noopener noreferrer">
            <?php esc_html_e( 'Enviar por WhatsApp', 'esitef-minimal' ); ?>
          </a>
        </p>
        <?php elseif ( $email_url ) : ?>
        <p>
          <a href="<?php echo esc_url( $email_url ); ?>" class="presencial-inscribe__whatsapp">
            <?php esc_html_e( 'Enviar a info@esitef.com', 'esitef-minimal' ); ?>
          </a>
        </p>
        <?php endif; ?>
        <?php if ( ! empty( $inscription['whatsapp_text'] ) || ! empty( $inscription['email_body'] ) ) : ?>
        <ul>
          <?php
          $contact_lines = ! empty( $inscription['whatsapp_text'] )
            ? (string) $inscription['whatsapp_text']
            : (string) $inscription['email_body'];
          foreach ( preg_split( '/\r\n|\r|\n/', $contact_lines ) as $line ) :
            ?>
            <?php if ( '' !== trim( $line ) ) : ?>
          <li><?php echo esc_html( $line ); ?></li>
            <?php endif; ?>
          <?php endforeach; ?>
        </ul>
        <?php endif; ?>
      </li>
      <li>
        <strong><?php esc_html_e( '3. Recibirá un mail de confirmación', 'esitef-minimal' ); ?></strong>
        <p><?php esc_html_e( 'Con más detalles sobre el inicio de la certificación.', 'esitef-minimal' ); ?></p>
      </li>
    </ol>

    <div class="presencial-inscribe__actions">
      <?php if ( $whatsapp_url ) : ?>
      <a href="<?php echo esc_url( $whatsapp_url ); ?>" class="hero-btn presencial-inscribe__cta" target="_blank" rel="noopener noreferrer">
        <?php esc_html_e( 'Enviar comprobante por WhatsApp', 'esitef-minimal' ); ?>
      </a>
      <?php elseif ( $email_url ) : ?>
      <a href="<?php echo esc_url( $email_url ); ?>" class="hero-btn presencial-inscribe__cta">
        <?php esc_html_e( 'Enviar comprobante por email', 'esitef-minimal' ); ?>
      </a>
      <?php endif; ?>
      <button type="button" class="presencial-inscribe__cancel" data-presencial-close><?php esc_html_e( 'Cerrar', 'esitef-minimal' ); ?></button>
    </div>
  </div>
</div>
<?php endif; ?>

<?php if ( $checkout_on && $checkout_cfg && ! empty( $checkout_cfg['plans'] ) ) : ?>
<section class="presencial-checkout-cta" id="inscribirme">
  <div class="esitef-module-shell">
    <div class="esitef-module-card">
      <h2><?php esc_html_e( 'Inscripción online', 'esitef-minimal' ); ?></h2>
      <p class="presencial-checkout-cta__lead"><?php esc_html_e( 'Elige tu plan y completa el pago de forma segura.', 'esitef-minimal' ); ?></p>
      <div class="checkout-plans presencial-checkout-cta__plans">
        <?php foreach ( $checkout_cfg['plans'] as $plan_key => $plan ) : ?>
          <?php
          $plan_url = esitef_presencial_get_add_to_cart_url( $page_slug, $plan_key );
          if ( ! $plan_url ) {
            continue;
          }
          $highlight = ! empty( $plan['highlight'] );
          ?>
          <a href="<?php echo esc_url( $plan_url ); ?>" class="checkout-plan checkout-plan--link<?php echo $highlight ? ' checkout-plan--highlight' : ''; ?><?php echo $plan_key === $default_plan ? ' checkout-plan--selected' : ''; ?>">
            <?php if ( $highlight ) : ?>
              <span class="checkout-plan__badge"><?php esc_html_e( 'Recomendado', 'esitef-minimal' ); ?></span>
            <?php endif; ?>
            <span class="checkout-plan__name"><?php echo esc_html( $plan['name'] ?? $plan_key ); ?></span>
            <span class="checkout-plan__amount"><?php echo esc_html( $plan['amount_display'] ?? '' ); ?></span>
            <?php if ( ! empty( $plan['period'] ) ) : ?>
              <span class="checkout-plan__period"><?php echo esc_html( $plan['period'] ); ?></span>
            <?php endif; ?>
          </a>
        <?php endforeach; ?>
      </div>
      <?php if ( $whatsapp_url ) : ?>
      <p class="presencial-checkout-cta__support">
        <?php esc_html_e( '¿Necesitas ayuda?', 'esitef-minimal' ); ?>
        <a href="<?php echo esc_url( $whatsapp_url ); ?>" target="_blank" rel="noopener noreferrer"><?php esc_html_e( 'Contactar por WhatsApp', 'esitef-minimal' ); ?></a>
      </p>
      <?php endif; ?>
    </div>
  </div>
</section>
<?php endif; ?>
