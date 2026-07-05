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
	$paises = array(
		'espana' => array(
			'title'   => 'España',
			'tagline' => 'Desde 2007, somos la escuela de formación contínua para profesionales de salud y deporte, de mayor crecimiento internacional.',
			'sedes'   => array(
				array(
					'slug'    => 'arbucies',
					'name'    => 'Arbúcies',
					'courses' => array(
						array(
							'title'     => 'Pedagogía aplicada al movimiento',
							'url'       => '#',
							'type'      => 'Formación',
							'image'     => 'https://esitef.com/online/wp-content/uploads/2022/12/esitef-inicio4-escuela-de-fisioterapia.webp',
							'dates'     => '12 – 14 Jun 2026',
							'professor' => 'Tomás Bonino',
						),
					),
				),
				array(
					'slug'    => 'barcelona',
					'name'    => 'Barcelona',
					'courses' => array(
						array(
							'title'     => 'Movimiento terapéutico en práctica clínica',
							'url'       => '#',
							'type'      => 'Formación',
							'image'     => 'https://esitef.com/online/wp-content/uploads/2022/12/esitef-inicio4-escuela-de-fisioterapia.webp',
							'dates'     => '8 – 10 Sep 2026',
							'professor' => 'Carlota Torrents',
						),
					),
				),
				array(
					'slug'    => 'madrid',
					'name'    => 'Madrid',
					'courses' => array(
						array(
							'title'     => 'Fisioterapia deportiva avanzada',
							'url'       => '#',
							'type'      => 'Formación',
							'image'     => 'https://esitef.com/online/wp-content/uploads/2022/12/esitef-inicio4-escuela-de-fisioterapia.webp',
							'dates'     => '3 – 5 Oct 2026',
							'professor' => 'Tomás Bonino',
						),
						array(
							'title'     => 'Ejercicio terapéutico en clínica',
							'url'       => '#',
							'type'      => 'Formación',
							'image'     => 'https://esitef.com/online/wp-content/uploads/2022/12/esitef-inicio4-escuela-de-fisioterapia.webp',
							'dates'     => '18 – 20 Nov 2026',
							'professor' => 'Carlota Torrents',
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
			'orderby'        => 'date',
			'order'          => 'DESC',
		)
	);

	$posts = $query->have_posts() ? $query->posts : array();
	wp_reset_postdata();

	return $posts;
}
