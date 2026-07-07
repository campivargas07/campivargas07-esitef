<?php
/**
 * Formaciones online — grid de cursos (prototipo)
 *
 * @package esitef-minimal
 */

$cursos = array(
	array(
		'title' => 'Curso de Fisioterapia Avanzada',
		'alt'   => 'Curso de Fisioterapia',
		'img'   => 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=450&fit=crop&q=80',
	),
	array(
		'title' => 'Ejercicio Terapéutico Práctico',
		'alt'   => 'Ejercicio Terapéutico',
		'img'   => 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=450&fit=crop&q=80',
	),
	array(
		'title' => 'Estrategias de Readaptación Deportiva',
		'alt'   => 'Readaptación Deportiva',
		'img'   => 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=450&fit=crop&q=80',
	),
	array(
		'title' => 'Evaluación Clínica Integral',
		'alt'   => 'Evaluación Clínica',
		'img'   => 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=450&fit=crop&q=80',
	),
	array(
		'title' => 'Terapia Manual Ortopédica',
		'alt'   => 'Terapia Manual',
		'img'   => 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=450&fit=crop&q=80',
	),
	array(
		'title' => 'Fundamentos de Biomecánica Aplicada',
		'alt'   => 'Biomecánica Aplicada',
		'img'   => 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=450&fit=crop&q=80',
	),
	array(
		'title' => 'Bases de la Neurodinamia Clínica',
		'alt'   => 'Neurodinamia',
		'img'   => 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=450&fit=crop&q=80',
	),
	array(
		'title' => 'Prevención de Lesiones en el Deporte',
		'alt'   => 'Prevención de Lesiones',
		'img'   => 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=450&fit=crop&q=80',
	),
	array(
		'title' => 'Administración y Gestión de Clínicas',
		'alt'   => 'Gestión de Clínicas',
		'img'   => 'https://images.unsplash.com/photo-1534258936925-c58bb47ab31b?w=600&h=450&fit=crop&q=80',
	),
	array(
		'title' => 'Prescripción del Ejercicio Terapéutico',
		'alt'   => 'Prescripción del Ejercicio',
		'img'   => 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=600&h=450&fit=crop&q=80',
	),
);
?>
<section class="formaciones-section" aria-label="<? esc_attr_e( 'Nuestras Formaciones Online', 'esitef-minimal' ); ?>">
  <div class="formaciones-inner">
    <h1 class="formaciones-titulo"><? esc_html_e( 'Formaciones Online', 'esitef-minimal' ); ?></h1>
    <p class="formaciones-desc"><? esc_html_e( 'Explora nuestras experiencias formativas desde dónde y cuando quieras.', 'esitef-minimal' ); ?></p>

    <div class="formaciones-container">
      <div class="formaciones-grid">
        <?php foreach ( $cursos as $curso ) : ?>
        <a href="#" class="curso-card">
          <div class="curso-image">
            <img src="<?php echo esc_url( $curso['img'] ); ?>" alt="<?php echo esc_attr( $curso['alt'] ); ?>">
          </div>
          <div class="curso-content">
            <div class="curso-header">
              <h3><?php echo esc_html( $curso['title'] ); ?></h3>
              <span class="curso-ver-mas"><? esc_html_e( 'Ver más', 'esitef-minimal' ); ?></span>
            </div>
          </div>
        </a>
        <?php endforeach; ?>
      </div>
    </div>
  </div>
</section>
