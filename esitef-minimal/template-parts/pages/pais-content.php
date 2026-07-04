<?php
/**
 * País — panel sedes | cursos + tira relacionados.
 *
 * @package esitef-minimal
 *
 * @var array<string, mixed> $args
 */

$pais = isset( $args['pais'] ) ? $args['pais'] : array();
if ( empty( $pais ) ) {
	return;
}

$title = isset( $pais['title'] ) ? (string) $pais['title'] : '';
$sedes = isset( $pais['sedes'] ) && is_array( $pais['sedes'] ) ? $pais['sedes'] : array();

if ( ! $sedes ) {
	return;
}
?>
<section class="pais-stage" aria-label="<?php echo esc_attr( $title ); ?>">
	<div class="pais-module">
		<div class="pais-grid">
			<aside class="pais-nav">
				<div class="pais-nav-head">
					<span class="pais-eyebrow"><? esc_html_e( 'Presencial', 'esitef-minimal' ); ?></span>
					<h1 class="pais-title"><?php echo esc_html( $title ); ?></h1>
				</div>

				<div class="pais-tabs" role="tablist" aria-label="<?php esc_attr_e( 'Sedes formativas', 'esitef-minimal' ); ?>">
					<?php foreach ( $sedes as $index => $sede ) : ?>
						<?php
						$slug = isset( $sede['slug'] ) ? (string) $sede['slug'] : (string) $index;
						$name = isset( $sede['name'] ) ? (string) $sede['name'] : '';
						$meta = isset( $sede['meta'] ) ? (string) $sede['meta'] : '';
						if ( '' === $name ) {
							continue;
						}
						$is_active = ( 0 === $index );
						?>
					<button
						type="button"
						class="pais-tab<?php echo $is_active ? ' is-active' : ''; ?>"
						role="tab"
						id="pais-tab-<?php echo esc_attr( $slug ); ?>"
						aria-selected="<?php echo $is_active ? 'true' : 'false'; ?>"
						aria-controls="pais-panel-<?php echo esc_attr( $slug ); ?>"
						data-sede="<?php echo esc_attr( $slug ); ?>"
					>
						<span class="pais-tab-text">
							<span class="pais-tab-name"><?php echo esc_html( $name ); ?></span>
							<?php if ( $meta ) : ?>
							<span class="pais-tab-meta"><?php echo esc_html( $meta ); ?></span>
							<?php endif; ?>
						</span>
						<span class="pais-tab-arrow" aria-hidden="true">
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
						</span>
					</button>
					<?php endforeach; ?>
				</div>
			</aside>

			<div class="pais-detail" role="region" aria-live="polite">
				<div class="pais-detail-card">
					<div class="pais-detail-glow" aria-hidden="true"></div>
					<?php foreach ( $sedes as $index => $sede ) : ?>
						<?php
						$slug      = isset( $sede['slug'] ) ? (string) $sede['slug'] : (string) $index;
						$name      = isset( $sede['name'] ) ? (string) $sede['name'] : '';
						$courses   = isset( $sede['courses'] ) && is_array( $sede['courses'] ) ? $sede['courses'] : array();
						$count     = count( $courses );
						$layout    = 1 === $count ? 'single' : ( 2 === $count ? 'duo' : 'multi' );
						$is_active = ( 0 === $index );
						?>
					<div
						class="pais-sede-panel<?php echo $is_active ? ' is-active' : ''; ?>"
						id="pais-panel-<?php echo esc_attr( $slug ); ?>"
						role="tabpanel"
						aria-labelledby="pais-tab-<?php echo esc_attr( $slug ); ?>"
						data-sede="<?php echo esc_attr( $slug ); ?>"
						<?php echo $is_active ? '' : 'hidden'; ?>
					>
						<header class="pais-panel-head">
							<span class="pais-panel-label"><? esc_html_e( 'Formaciones disponibles', 'esitef-minimal' ); ?></span>
							<h2 class="pais-panel-city"><?php echo esc_html( $name ); ?></h2>
						</header>

						<?php if ( $courses ) : ?>
						<div class="pais-courses pais-courses--<?php echo esc_attr( $layout ); ?>">
							<?php foreach ( $courses as $course ) : ?>
								<?php
								$course_title = isset( $course['title'] ) ? (string) $course['title'] : '';
								$course_type  = isset( $course['type'] ) ? (string) $course['type'] : __( 'Formación', 'esitef-minimal' );
								$course_image = isset( $course['image'] ) ? (string) $course['image'] : '';
								$course_dates = isset( $course['dates'] ) ? (string) $course['dates'] : '';
								$professor    = isset( $course['professor'] ) ? (string) $course['professor'] : '';
								$course_url   = esitef_get_pais_course_url( $course );
								if ( '' === $course_title ) {
									continue;
								}
								?>
							<a href="<?php echo esc_url( $course_url ); ?>" class="pais-course-card">
								<?php if ( $course_image ) : ?>
								<span class="pais-course-thumb">
									<img src="<?php echo esc_url( $course_image ); ?>" alt="" loading="lazy">
								</span>
								<?php endif; ?>
								<span class="pais-course-body">
									<span class="pais-course-type"><?php echo esc_html( $course_type ); ?></span>
									<span class="pais-course-title"><?php echo esc_html( $course_title ); ?></span>
									<?php if ( $course_dates ) : ?>
									<span class="pais-course-row">
										<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
										<?php echo esc_html( $course_dates ); ?>
									</span>
									<?php endif; ?>
									<?php if ( $professor ) : ?>
									<span class="pais-course-row">
										<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
										<?php echo esc_html( $professor ); ?>
									</span>
									<?php endif; ?>
								</span>
							</a>
							<?php endforeach; ?>
						</div>
						<?php else : ?>
						<p class="pais-empty"><? esc_html_e( 'Próximamente nuevas formaciones en esta sede.', 'esitef-minimal' ); ?></p>
						<?php endif; ?>
					</div>
					<?php endforeach; ?>
				</div>
			</div>
		</div>
	</div>

	<?php get_template_part( 'template-parts/pages/pais', 'related' ); ?>
</section>
