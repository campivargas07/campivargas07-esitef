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
		'img'   => 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=450&fit=crop&q=80',
		'url'   => 'https://equipophysical.com/formaciones-2/experto-en-rehabilitacion-readaptacion-y-reentrenamiento/',
	),
	array(
		'title' => 'MasterClass',
		'alt'   => 'MasterClass',
		'img'   => 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=450&fit=crop&q=80',
		'url'   => 'https://esitef.com/online/masterclass/',
	),
	array(
		'title' => 'Tele-Rehabilitación 22 casos clínicos',
		'alt'   => 'Tele-Rehabilitación 22 casos clínicos',
		'img'   => 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=450&fit=crop&q=80',
		'url'   => 'https://esitef.com/online/courses/tele-rehab/',
	),
	array(
		'title' => 'Talleres prácticos Online',
		'alt'   => 'Talleres prácticos Online',
		'img'   => 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=450&fit=crop&q=80',
		'url'   => 'https://esitef.com/online/talleres/',
	),
	array(
		'title' => 'Club de actualización',
		'alt'   => 'Club de actualización',
		'img'   => 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=450&fit=crop&q=80',
		'url'   => 'https://esitef.com/online/club-de-actualizacion/',
	),
	array(
		'title' => 'Capacidad funcional de movimiento',
		'alt'   => 'Capacidad funcional de movimiento',
		'img'   => 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=450&fit=crop&q=80',
		'url'   => 'https://esitef.com/online/capacidad-funcional-movimiento/',
	),
	array(
		'title' => 'Formación online en comunicación efectiva',
		'alt'   => 'Formación online en comunicación efectiva',
		'img'   => 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=450&fit=crop&q=80',
		'url'   => 'https://esitef.com/online/comunicat/',
	),
	array(
		'title' => 'Introducción al mundo del dolor',
		'alt'   => 'Introducción al mundo del dolor',
		'img'   => 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=450&fit=crop&q=80',
		'url'   => 'https://esitef.com/online/int-curso-dolor/',
	),
	array(
		'title' => 'CRECER en movimiento',
		'alt'   => 'CRECER en movimiento',
		'img'   => 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=450&fit=crop&q=80',
		'url'   => 'https://esitef.com/online/crecerenmovimiento/',
	),
	array(
		'title' => 'Biomecánica del Movimiento Principios Básicos y Aplicaciones Prácticas.',
		'alt'   => 'Biomecánica del Movimiento',
		'img'   => 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=450&fit=crop&q=80',
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
