<?php
/**
 * Países — landings presenciales por país.
 *
 * @package esitef-minimal
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registro de países (ponytail: una fuente; ampliar con más slugs).
 *
 * @return array<string, array<string, mixed>>
 */
function esitef_get_paises() {
	$thumb = 'https://esitef.com/online/wp-content/uploads/2022/12/esitef-inicio4-escuela-de-fisioterapia.webp';
	$tagline = 'Desde 2007, somos la escuela de formación contínua para profesionales de salud y deporte, de mayor crecimiento internacional.';

	$paises = array(
		'espana' => array(
			'title'   => 'España',
			'tagline' => $tagline,
			'sedes'   => array(
				array(
					'slug'    => 'arbucies',
					'name'    => 'Arbúcies',
					'courses' => array(
						array(
							'title'     => 'Dolor y movimiento',
							'page_slug' => 'dolor-y-movimiento-arbucies',
							'type'      => 'Formación',
							'image'     => $thumb,
							'dates'     => '10 – 13 Dic 2026',
							'professor' => 'Tomás Bonino',
						),
					),
				),
				
				array(
					'slug'    => 'madrid',
					'name'    => 'Madrid',
					'courses' => array(
						array(
							'title'     => 'Dolor y movimiento',
							'page_slug' => 'dolor-y-movimiento-madrid',
							'type'      => 'Formación',
							'image'     => $thumb,
							'dates'     => '2 – 4 Oct 2026',
							'professor' => 'Tomás Bonino',
						),
						array(
							'title'     => 'Abordaje dinámico e implícito orientado al core y el suelo pélvico',
							'url'       => 'https://fisiomeditformacion.com/curso/tomas-bonino-core-suelo-pelvico/',
							'type'      => 'Formación',
							'image'     => $thumb,
							'dates'     => '7 y 8 Nov 2026',
							'professor' => 'Tomás Bonino',
						),
						array(
							'title'     => 'Especialización en Movement Coaching',
							'page_slug' => 'especializacion-movement-coaching-madrid',
							'type'      => 'Especialización',
							'image'     => $thumb,
							'dates'     => 'Inicio 27 y 28 Nov 2026',
							'professor' => 'Tomás Bonino',
						),
					),
				),
			),
		),
		'argentina' => array(
			'title'   => 'Argentina',
			'tagline' => $tagline,
			'sedes'   => array(
				array(
					'slug'    => 'cordoba',
					'name'    => 'Córdoba',
					'courses' => array(
						array(
							'title'     => 'Dolor y movimiento — Nuevos paradigmas desde la evidencia',
							'page_slug' => 'dolor-y-movimiento-cordoba',
							'type'      => 'Formación',
							'image'     => $thumb,
							'dates'     => '7, 8 y 9 SEPT 2026',
							'professor' => 'Tomás Bonino',
						),
						array(
							'title'     => 'Dosificación del ejercicio en rehabilitación deportiva',
							'url'       => 'https://esitef.com/dosificacion-ejercicio-cordoba/',
							'type'      => 'Formación',
							'image'     => $thumb,
							'dates'     => '11 y 12 Abril 2026',
							'professor' => 'Matias Sampietro',
						),
						array(
							'title'     => 'Capacidad funcional de movimiento + Patrones motores + Conciencia corporal',
							'url'       => 'https://esitef.com/capacidad-funcional-madrid/',
							'type'      => 'Formación',
							'image'     => $thumb,
							'dates'     => '19, 20 y 21 JUNIO 2026',
							'professor' => 'Tomás Bonino',
						),
					),
				),
			),
		),
		'mexico' => array(
			'title'   => 'México',
			'tagline' => $tagline,
			'sedes'   => array(
				array(
					'slug'    => 'guadalajara',
					'name'    => 'Guadalajara',
					'courses' => array(
						array(
							'title'     => 'Dolor y Movimiento — Nuevos paradigmas desde la evidencia',
							'page_slug' => 'dolor-y-movimiento-guadalajara',
							'type'      => 'Formación',
							'image'     => $thumb,
							'dates'     => '24, 25 y 26 JULIO 2026',
							'professor' => 'Tomás Bonino',
						),
						array(
							'title'     => 'Movement Coaching',
							'page_slug' => 'especializacion-movement-coaching-guadalajara',
							'type'      => 'Especialización',
							'image'     => $thumb,
							'dates'     => 'Inicio 20, 21 y 22 NOV 2026',
							'professor' => 'Tomás Bonino',
						),
						array(
							'title'     => 'Evaluación dinámica funcional y reeducación del movimiento',
							'page_slug' => 'evaluacion-dinamica-funcional-gdl',
							'type'      => 'Formación',
							'image'     => $thumb,
							'dates'     => '20, 21 y 22 NOV 2026',
							'professor' => 'Tomás Bonino',
						),
					),
				),
				array(
					'slug'    => 'toluca',
					'name'    => 'Toluca',
					'courses' => array(
						array(
							'title'     => 'Dolor y Movimiento — Nuevos paradigmas desde la evidencia',
							'page_slug' => 'dolor-y-movimiento-toluca',
							'type'      => 'Formación',
							'image'     => $thumb,
							'dates'     => '17, 18 y 19 JULIO 2026',
							'professor' => 'Tomás Bonino',
						),
					),
				),
				array(
					'slug'    => 'aguascalientes',
					'name'    => 'Aguascalientes',
					'courses' => array(
						array(
							'title'     => 'Dolor y Movimiento — Nuevos paradigmas desde la evidencia',
							'page_slug' => 'formacion-en-dolor-y-movimiento-aguascalientes',
							'type'      => 'Formación',
							'image'     => $thumb,
							'dates'     => '16, 17 y 18 NOV 2026',
							'professor' => 'Tomás Bonino',
						),
					),
				),
				array(
					'slug'    => 'cdmx',
					'name'    => 'CDMX',
					'courses' => array(
						array(
							'title'     => 'Especialización en Movement Coaching',
							'page_slug' => 'especializacion-movement-coaching-cdmx',
							'type'      => 'Especialización',
							'image'     => $thumb,
							'dates'     => 'Inicio 2027',
							'professor' => 'Tomás Bonino',
						),
					),
				),
			),
		),
		'peru' => array(
			'title'   => 'Perú',
			'tagline' => $tagline,
			'sedes'   => array(
				array(
					'slug'    => 'arequipa',
					'name'    => 'Arequipa',
					'courses' => array(
						array(
							'title'     => 'Gestión funcional de las fuerzas',
							'page_slug' => 'gestion-funcional-fuerzas-arequipa',
							'type'      => 'Formación',
							'image'     => $thumb,
							'dates'     => 'Aplazado Abril 2027',
							'professor' => 'Tomás Bonino',
						),
					),
				),
				array(
					'slug'    => 'lima',
					'name'    => 'Lima',
					'courses' => array(
						array(
							'title'     => 'Pedagogía aplicada a la optimización del aprendizaje motor',
							'page_slug' => 'aprendizaje-motor-lima',
							'type'      => 'Formación',
							'image'     => $thumb,
							'dates'     => 'Aplazado Abril 2027',
							'professor' => 'Tomás Bonino',
						),
					),
				),
			),
		),
		'colombia' => array(
			'title'   => 'Colombia',
			'tagline' => $tagline,
			'sedes'   => array(
				array(
					'slug'    => 'medellin',
					'name'    => 'Medellín',
					'courses' => array(
						array(
							'title'     => 'Gestión funcional de las fuerzas',
							'page_slug' => 'gestion-funcional-fuerzas-medellin',
							'type'      => 'Formación',
							'image'     => $thumb,
							'dates'     => '19 y 20 SEPT 2026',
							'professor' => 'Tomás Bonino',
						),
					),
				),
			),
		),
		'uruguay' => array(
			'title'   => 'Uruguay',
			'tagline' => $tagline,
			'sedes'   => array(
				array(
					'slug'    => 'montevideo',
					'name'    => 'Montevideo',
					'courses' => array(
						array(
							'title'     => 'Pedagogía aplicada a la optimización del aprendizaje motor',
							'page_slug' => 'pedagogia-aplicada-montevideo',
							'type'      => 'Formación',
							'image'     => $thumb,
							'dates'     => '11, 12 y 13 SEPT 2026',
							'professor' => 'Tomás Bonino',
						),
					),
				),
			),
		),
	);

	return apply_filters( 'esitef_paises', $paises );
}

/**
 * @param string $slug Page slug.
 * @return array<string, mixed>|null
 */
function esitef_get_pais_by_slug( $slug ) {
	$paises = esitef_get_paises();
	return isset( $paises[ $slug ] ) ? $paises[ $slug ] : null;
}

/**
 * Resuelve URL de curso presencial (slug WP o URL externa).
 *
 * @param array<string, string> $course Course entry.
 */
function esitef_get_pais_course_url( $course ) {
	if ( ! empty( $course['page_slug'] ) ) {
		$page = get_page_by_path( (string) $course['page_slug'] );
		if ( $page ) {
			return get_permalink( $page );
		}
	}
	return isset( $course['url'] ) ? (string) $course['url'] : '#';
}

/**
 * Cursos online relacionados (Tutor) para la tira inferior.
 *
 * @param int $limit Max items.
 * @return WP_Post[]
 */
function esitef_get_pais_related_posts( $limit = 6 ) {
	$post_type = function_exists( 'tutor' ) ? tutor()->course_post_type : 'courses';
	$query     = new WP_Query(
		array(
			'post_type'      => $post_type,
			'posts_per_page' => $limit,
			'post_status'    => 'publish',
			'orderby'        => 'rand',
		)
	);

	$posts = $query->have_posts() ? $query->posts : array();
	wp_reset_postdata();

	return $posts;
}
