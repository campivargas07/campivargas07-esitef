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
			</aside>

			<div class="pais-sedes-module">
				<div class="pais-sedes-glow" aria-hidden="true"></div>

				<div class="pais-tabs" role="tablist" aria-label="<?php esc_attr_e( 'Sedes formativas', 'esitef-minimal' ); ?>">
					<?php foreach ( $sedes as $index => $sede ) : ?>
						<?php
						$slug = isset( $sede['slug'] ) ? (string) $sede['slug'] : (string) $index;
						$name = isset( $sede['name'] ) ? (string) $sede['name'] : '';
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
						</span>
						<span class="pais-tab-arrow" aria-hidden="true">
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
						</span>
					</button>
					<?php endforeach; ?>
				</div>

			<div class="pais-detail" role="region" aria-live="polite">
				<div class="pais-detail-card">
					<div class="pais-detail-glow" aria-hidden="true"></div>
					<?php foreach ( $sedes as $index => $sede ) : ?>
						<?php
						$slug      = isset( $sede['slug'] ) ? (string) $sede['slug'] : (string) $index;
						$name      = isset( $sede['name'] ) ? (string) $sede['name'] : '';
						$courses   = isset( $sede['courses'] ) && is_array( $sede['courses'] ) ? $sede['courses'] : array();
						$count     = count( $courses );
						if ( 1 === $count ) {
							$layout = 'single';
						} elseif ( 2 === $count ) {
							$layout = 'duo';
						} elseif ( 4 === $count ) {
							$layout = 'quad';
						} else {
							$layout = 'multi';
						}
						$panel_mod = '';
						if ( 4 === $count ) {
							$panel_mod = ' pais-sede-panel--quad';
						} elseif ( $count >= 3 ) {
							$panel_mod = ' pais-sede-panel--multi';
						}
						$is_active = ( 0 === $index );
						?>
					<div
						class="pais-sede-panel<?php echo $is_active ? ' is-active' : ''; ?><?php echo esc_attr( $panel_mod ); ?>"
						id="pais-panel-<?php echo esc_attr( $slug ); ?>"
						role="tabpanel"
						aria-labelledby="pais-tab-<?php echo esc_attr( $slug ); ?>"
						data-sede="<?php echo esc_attr( $slug ); ?>"
						<?php echo $is_active ? '' : 'hidden'; ?>
					>
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
								$course_desc = implode(
									' · ',
									array_filter(
										array( $course_dates, $professor ),
										static function ( $part ) {
											return '' !== $part;
										}
									)
								);
								?>
							<?php
							$card_class = 'pais-course-card';
							if ( false !== stripos( $course_type, 'híbrida' ) || false !== stripos( $course_type, 'hibrida' ) ) {
								$card_class .= ' pais-course-card--hybrid';
							}
							?>
							<a href="<?php echo esc_url( $course_url ); ?>" class="<?php echo esc_attr( $card_class ); ?>">
								<?php if ( $course_image ) : ?>
								<span class="pais-course-thumb">
									<img src="<?php echo esc_url( $course_image ); ?>" alt="<?php echo esc_attr( $course_title ); ?>" loading="lazy">
								</span>
								<?php endif; ?>
								<span class="pais-course-body">
									<span class="pais-course-type"><?php echo esc_html( $course_type ); ?></span>
									<span class="pais-course-title"><?php echo esc_html( $course_title ); ?></span>
									<?php if ( $course_desc ) : ?>
									<span class="pais-course-desc"><?php echo esc_html( $course_desc ); ?></span>
									<?php endif; ?>
									<?php if ( $course_dates ) : ?>
									<span class="pais-course-row pais-course-row--date">
										<svg class="pais-course-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>
										<?php echo esc_html( $course_dates ); ?>
									</span>
									<?php endif; ?>
									<?php if ( $professor ) : ?>
									<span class="pais-course-row pais-course-row--prof">
										<svg class="pais-course-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>
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
	</div>

	<?php get_template_part( 'template-parts/pages/pais', 'related' ); ?>
</section>
