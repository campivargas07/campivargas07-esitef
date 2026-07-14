<?php
/**
 * Formaciones online — grid de cursos
 *
 * @package esitef-minimal
 */

$cursos = array(
	array(
		'title' => 'Experto en Rehabilitación, Readaptación y Reentrenamiento',
		'alt'   => 'Experto en Rehabilitación, Readaptación y Reentrenamiento',
		'img'   => 'https://esitef.com/online/wp-content/uploads/2026/07/Experto-en-Rehabilitacion-Readaptacion-y-Reentrenamiento-2026.webp',
		'url'   => 'https://equipophysical.com/formaciones-2/experto-en-rehabilitacion-readaptacion-y-reentrenamiento/',
	),
	array(
		'title' => 'MasterClass',
		'alt'   => 'MasterClass',
		'img'   => 'https://esitef.com/online/wp-content/uploads/2026/07/Masterclass.webp',
		'url'   => 'https://esitef.com/online/masterclass/',
	),
	array(
		'title' => 'Tele-Rehabilitación 22 casos clínicos',
		'alt'   => 'Tele-Rehabilitación 22 casos clínicos',
		'img'   => 'https://esitef.com/online/wp-content/uploads/2026/07/Tele-Rehabilitacion.webp',
		'url'   => 'https://esitef.com/online/courses/tele-rehab/',
	),
	array(
		'title' => 'Talleres prácticos Online',
		'alt'   => 'Talleres prácticos Online',
		'img'   => 'https://esitef.com/online/wp-content/uploads/2026/07/talleres-practicos-online-.webp',
		'url'   => 'https://esitef.com/online/talleres/',
	),
	array(
		'title' => 'Club de actualización',
		'alt'   => 'Club de actualización',
		'img'   => 'https://esitef.com/online/wp-content/uploads/2026/07/club-de-actualizacion.webp',
		'url'   => 'https://esitef.com/online/club-de-actualizacion/',
	),
	array(
		'title' => 'Capacidad funcional de movimiento',
		'alt'   => 'Capacidad funcional de movimiento',
		'img'   => 'https://esitef.com/online/wp-content/uploads/2026/07/progresiones-de-ejercicio-terapeutico.webp',
		'url'   => 'https://esitef.com/online/capacidad-funcional-movimiento/',
	),
	array(
		'title' => 'Formación online en comunicación efectiva',
		'alt'   => 'Formación online en comunicación efectiva',
		'img'   => 'https://esitef.com/online/wp-content/uploads/2026/07/Formacion-online-en-comunicacion-efectiva.webp',
		'url'   => 'https://esitef.com/online/comunicat/',
	),
	array(
		'title' => 'Introducción al mundo del dolor',
		'alt'   => 'Introducción al mundo del dolor',
		'img'   => 'https://esitef.com/online/wp-content/uploads/2026/07/mundo-dolor.webp',
		'url'   => 'https://esitef.com/online/int-curso-dolor/',
	),
	array(
		'title' => 'CRECER en movimiento',
		'alt'   => 'CRECER en movimiento',
		'img'   => 'https://esitef.com/online/wp-content/uploads/2026/07/crecer-en-movimiento.webp',
		'url'   => 'https://esitef.com/online/crecerenmovimiento/',
	),
	array(
		'title' => 'Biomecánica del Movimiento Principios Básicos y Aplicaciones Prácticas.',
		'alt'   => 'Biomecánica del Movimiento',
		'img'   => 'https://esitef.com/online/wp-content/uploads/2026/07/Biomecanica-del-Movimiento.webp',
		'url'   => 'https://esitef.com/online/courses/biomecanica-del-movimiento/',
	),
);

$grid_cols = 3;
$total     = count( $cursos );
$remainder = $total % $grid_cols;

if ( ! function_exists( 'esitef_render_curso_card' ) ) {
	/**
	 * Renderiza una tarjeta de curso.
	 *
	 * @param array $curso Datos del curso.
	 * @param array $args  Opciones de renderizado.
	 */
	function esitef_render_curso_card( $curso, $args = array() ) {
		$args = wp_parse_args(
			$args,
			array(
				'solo' => false,
			)
		);
		$card_class = 'curso-card' . ( $args['solo'] ? ' curso-card--solo' : '' );
		?>
		<a href="<?php echo esc_url( $curso['url'] ); ?>" class="<?php echo esc_attr( $card_class ); ?>">
			<div class="curso-image">
				<img src="<?php echo esc_url( $curso['img'] ); ?>" alt="<?php echo esc_attr( $curso['alt'] ); ?>" loading="lazy" width="600" height="450">
			</div>
			<div class="curso-content">
				<div class="curso-header">
					<h3><?php echo esc_html( $curso['title'] ); ?></h3>
					<span class="curso-ver-mas"><? esc_html_e( 'Ver más', 'esitef-minimal' ); ?></span>
				</div>
			</div>
		</a>
		<?php
	}
}
?>
<section class="formaciones-section" aria-label="<? esc_attr_e( 'Nuestras Formaciones Online', 'esitef-minimal' ); ?>">
  <div class="formaciones-inner">
    <h1 class="formaciones-titulo"><? esc_html_e( 'Formaciones Online', 'esitef-minimal' ); ?></h1>
    <p class="formaciones-desc"><? esc_html_e( 'Explora nuestras experiencias formativas desde dónde y cuando quieras.', 'esitef-minimal' ); ?></p>

    <div class="formaciones-container">
      <div class="formaciones-grid<?php echo $remainder ? ' formaciones-grid--remainder-' . (int) $remainder : ''; ?>">
        <?php foreach ( $cursos as $index => $curso ) : ?>
          <?php
          $is_last = ( $index === $total - 1 );
          $is_solo = $is_last && 1 === $remainder;
          esitef_render_curso_card( $curso, array( 'solo' => $is_solo ) );
          ?>
        <?php endforeach; ?>
      </div>
    </div>
  </div>
</section>
