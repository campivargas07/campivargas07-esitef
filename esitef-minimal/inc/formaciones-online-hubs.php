<?php
/**
 * Formaciones online — hubs y landings (catálogo centralizado).
 *
 * @package esitef-minimal
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Tutor course URL by slug.
 *
 * @param string $slug Course post_name.
 */
function esitef_get_tutor_course_url( $slug ) {
	return home_url( '/courses/' . sanitize_title( $slug ) . '/' );
}

/**
 * Resolve item URL: Tutor permalink if course exists, else slug fallback.
 *
 * @param array<string, mixed> $item Item with course_slug or url.
 */
function esitef_resolve_course_url( $item ) {
	if ( ! empty( $item['url'] ) ) {
		return (string) $item['url'];
	}
	$slug = isset( $item['course_slug'] ) ? (string) $item['course_slug'] : '';
	if ( '' === $slug ) {
		return '#';
	}
	$course = get_page_by_path( $slug, OBJECT, 'courses' );
	if ( $course ) {
		return get_permalink( $course );
	}
	return esitef_get_tutor_course_url( $slug );
}

/**
 * @return array<string, array<string, mixed>>
 */
function esitef_get_formacion_hubs() {
	$uploads = 'https://esitef.com/online/wp-content/uploads';

	$hubs = array(
		'masterclass' => array(
			'title'       => __( 'Nuestras MasterClass', 'esitef-minimal' ),
			'subtitle'    => '',
			'layout'      => 'grid',
			'intro'       => '',
			'grid_style'  => 'masterclass',
			'grid_header' => 'minimal',
			'grid_cols'   => 3,
			'faq_columns' => 2,
			'show_meta'   => false,
			'items'       => array(
				array(
					'title'       => __( 'Abordaje desde la gestión de las fuerzas en la evaluación y optimización del movimiento', 'esitef-minimal' ),
					'img'         => 'https://images.unsplash.com/photo-1574680096145-d05b474e2151?w=400&h=400&fit=crop&q=80',
					'price'       => '199 USD',
					'course_slug' => 'masterclass-gestion-fuerzas',
				),
				array(
					'title'       => __( 'La conciencia corporal y sus 4 componentes diferenciados', 'esitef-minimal' ),
					'img'         => 'https://images.unsplash.com/photo-1545205597-3b0399b8f4b8?w=400&h=400&fit=crop&q=80',
					'price'       => '145 USD',
					'course_slug' => 'masterclass-conciencia-corporal',
				),
				array(
					'title'       => __( 'Entendiendo, por fin, qué es la estabilidad del CORE', 'esitef-minimal' ),
					'img'         => 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&q=80',
					'price'       => '199 USD',
					'course_slug' => 'masterclass-estabilidad-core',
				),
				array(
					'title'       => __( '¿Qué hay que hacer para conseguir un movimiento eficiente?', 'esitef-minimal' ),
					'img'         => 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=400&fit=crop&q=80',
					'price'       => '165 USD',
					'course_slug' => 'masterclass-movimiento-eficiente',
				),
				array(
					'title'       => __( 'Estabilidad estática y dinámica. Diferencias y cómo trabajarlas', 'esitef-minimal' ),
					'img'         => 'https://images.unsplash.com/photo-1599058945522-28d584b6f841?w=400&h=400&fit=crop&q=80',
					'price'       => '165 USD',
					'course_slug' => 'masterclass-estabilidad-estatica-dinamica',
				),
			),
			'faqs' => esitef_get_hub_masterclass_faqs(),
		),
		'talleres' => array(
			'title'       => __( 'Talleres Online', 'esitef-minimal' ),
			'subtitle'    => __( 'Te presentamos nuestros 18 talleres online, en los que obtendrás, en poco tiempo, muchas herramientas prácticas y muy útiles, explicadas de forma muy amena, para tu día a día profesional.', 'esitef-minimal' ),
			'layout'      => 'grid',
			'intro'       => '',
			'grid_style'  => 'showcase-compact',
			'grid_header' => 'minimal',
			'grid_cols'   => 3,
			'show_meta'   => true,
			'show_excerpt' => false,
			'items'       => esitef_get_hub_talleres_items( $uploads ),
		),
		'club-de-actualizacion' => array(
			'title'          => __( 'Club de actualización', 'esitef-minimal' ),
			'subtitle'       => __( 'Nunca te habrá resultado tan fácil, atractivo y rápido estar actualizado/a', 'esitef-minimal' ),
			'layout'         => 'landing',
			'hero'           => array(
				'title'     => __( 'Club de actualización', 'esitef-minimal' ),
				'subtitle'  => __( 'Nunca te habrá resultado tan fácil, atractivo y rápido estar actualizado/a', 'esitef-minimal' ),
				'text_only' => true,
				'hide_cta'  => true,
			),
			'content_grid'   => array(
				'intro'            => __( 'Adquiere acceso directo a 8 bloques de contenido específico, donde te explicamos de forma resumida, amena y súper digerible los artículos científicos más relevantes para tu día a día profesional, sumado a 8 MasterClasses exclusivas de integración práctica.', 'esitef-minimal' ),
				'goals_title'      => __( '¿Qué buscamos con este programa?', 'esitef-minimal' ),
				'goals'            => array(
					__( 'Democratizar el conocimiento: Facilitar el acceso, análisis, entendimiento y aplicación práctica de la última evidencia científica.', 'esitef-minimal' ),
					__( 'Elevar tus estándares: Ayudarte a crecer en tu actividad clínica dedicando poco tiempo a la investigación directa, con la información ya curada y digerida para ti.', 'esitef-minimal' ),
					__( 'Aprendizaje a tu ritmo: Sin mensualidades ni estrés. Compra el programa una sola vez y domina los 8 módulos temáticos estructurados a tu propio ritmo.', 'esitef-minimal' ),
				),
				'video'            => '817939279',
				'audience_title'   => __( '¿A quién va dirigido?', 'esitef-minimal' ),
				'audience_body'    => __( 'A todo profesional de la rehabilitación, la actividad física y el movimiento que desee conocer y dominar la última evidencia disponible para crecer en su día a día.', 'esitef-minimal' ),
				'audience_image'   => 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&h=700&fit=crop&q=80',
				'audience_image_alt' => __( 'Profesional de la salud y el movimiento', 'esitef-minimal' ),
			),
			'planning_title'       => __( '¿Qué artículos y temas incluye el programa?', 'esitef-minimal' ),
			'planning_description' => __( '8 bloques temáticos con artículos científicos resumidos y MasterClasses exclusivas de integración práctica.', 'esitef-minimal' ),
			'planning_style'       => 'accordion',
			'planning'             => esitef_get_hub_club_planning(),
			'pricing'        => array(
				'type'        => 'single',
				'title'       => __( '¿Cuánto cuesta formar parte del Club?', 'esitef-minimal' ),
				'price'       => '59,9',
				'currency'    => 'USD',
				'alt_prices'  => array(
					array( 'flag' => '🇪🇺', 'amount' => '59,9', 'currency' => '€uros' ),
					array( 'flag' => '🇲🇽', 'amount' => '1,190', 'currency' => 'MXN' ),
					array( 'flag' => '🇦🇷', 'amount' => '77,870', 'currency' => 'ARS' ),
				),
				'course_slug' => 'club-actualizacion-semestral',
			),
			'faqs'           => esitef_get_hub_club_faqs(),
			'faq_columns'    => 2,
			'landing_order'  => array( 'content_grid', 'planning', 'pricing', 'faqs' ),
			'cta'            => array(
				'label'       => __( 'Adquirir ahora', 'esitef-minimal' ),
				'course_slug' => 'club-actualizacion-semestral',
			),
		),
		'capacidad-funcional-movimiento' => array(
			'title'           => __( 'Capacidad Funcional de Movimiento', 'esitef-minimal' ),
			'subtitle'        => '',
			'layout'          => 'grid',
			'intro'           => '',
			'grid_style'      => 'masterclass',
			'grid_header'     => 'minimal',
			'grid_cols'       => 3,
			'show_meta'       => false,
			'show_excerpt'    => false,
			'header_title'    => __( '5 Programas de progresiones de ejercicio terapéutico', 'esitef-minimal' ),
			'header_subtitle' => __( '¿Qué es?', 'esitef-minimal' ),
			'header_intro'    => __( "Una serie de movimientos activos para ganar:\nR.O.M. + Estabilidad + Control Motor + Flexibilidad … todo al mismo tiempo y además…\nFacilitando la disociación.\n«Despertando» el SNC respecto a la sinergia.", 'esitef-minimal' ),
			'items'           => array(
				array(
					'title'       => __( 'Progresiones de ejercicio terapéutico Muñeca', 'esitef-minimal' ),
					'excerpt'     => __( 'Progresión de 17 ejercicios', 'esitef-minimal' ),
					'price'       => '15 USD',
					'img'         => $uploads . '/2022/02/capacidad-funcional-movimiento-flexion-cadera.png',
					'course_slug' => 'cfm-muneca',
				),
				array(
					'title'       => __( 'Progresiones de ejercicio terapéutico Pie', 'esitef-minimal' ),
					'excerpt'     => __( 'Progresión de 10 ejercicios', 'esitef-minimal' ),
					'price'       => '20 USD',
					'img'         => 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=450&fit=crop&q=80',
					'course_slug' => 'cfm-pie',
				),
				array(
					'title'       => __( 'Progresiones de ejercicio terapéutico Rotación cadera', 'esitef-minimal' ),
					'excerpt'     => __( 'Progresión de 20 ejercicios', 'esitef-minimal' ),
					'price'       => '20 USD',
					'img'         => 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=450&fit=crop&q=80',
					'course_slug' => 'cfm-rotacion-cadera',
				),
				array(
					'title'       => __( 'Progresiones de ejercicio terapéutico Hombro', 'esitef-minimal' ),
					'excerpt'     => __( 'Progresión de 23 ejercicios', 'esitef-minimal' ),
					'price'       => '25 USD',
					'img'         => 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=450&fit=crop&q=80',
					'course_slug' => 'cfm-hombro',
				),
				array(
					'title'       => __( 'Progresiones de ejercicio terapéutico Flexión cadera', 'esitef-minimal' ),
					'excerpt'     => __( 'Progresión de 11 ejercicios', 'esitef-minimal' ),
					'price'       => '20 USD',
					'img'         => $uploads . '/2022/02/capacidad-funcional-movimiento-flexion-cadera.png',
					'course_slug' => 'cfm-flexion-cadera',
				),
			),
		),
		'comunicat' => array(
			'title'    => __( 'Formación Online en Comunicación Efectiva', 'esitef-minimal' ),
			'subtitle' => __( 'Te damos herramientas sencillas, útiles y muy prácticas para mejorar tus habilidades al hablar en público.', 'esitef-minimal' ),
			'layout'   => 'landing',
			'theme'    => 'club-de-actualizacion',
			'hero'     => array(
				'title'     => __( 'Formación Online en Comunicación Efectiva', 'esitef-minimal' ),
				'subtitle'  => __( 'Te damos herramientas sencillas, útiles y muy prácticas para mejorar tus habilidades al hablar en público.', 'esitef-minimal' ),
				'text_only' => true,
				'hide_cta'  => true,
			),
			'content_grid' => array(
				'eyebrow'    => __( 'Somos', 'esitef-minimal' ),
				'card_title' => 'Comunica-t',
				'paragraphs' => array(
					__( 'Comunica-t es una plataforma de formación que nace de la ilusión de un comunicador y viajero por ayudar a los demás a mejorar en sus habilidades comunicativas.', 'esitef-minimal' ),
					__( 'Se crea para facilitar el trabajo y las relaciones humanas a través de ofrecer herramientas prácticas fáciles y útiles para aprender a hablar mejor en público.', 'esitef-minimal' ),
					__( 'En sus 20 años viajando por el mundo y hablando en público nuestro fundador Tomas Bonino, percibió una dificultad en la mayoría de personas del mundo a la hora de presentar sus ideas, comunicarse verbalmente, impartir una charla o taller, exponer un proyecto o tener una reunión. Y nos hemos propuesto ayudar.', 'esitef-minimal' ),
				),
				'video'         => '440043540',
				'video_title'   => __( 'Presentación de Comunica-t', 'esitef-minimal' ),
				'audience_body' => __( 'Hablar en público es una actividad sumamente necesaria y utilizada en todos los momentos y entornos de la vida. Sin embargo no nos han enseñado nunca a cómo hacerlo de forma efectiva: para que nuestro mensaje, nuestras ideas y nuestras presentaciones lleguen de manera clara, se entiendan y dejen la huella que deseamos.', 'esitef-minimal' ),
			),
			'planning_title' => __( 'Programa', 'esitef-minimal' ),
			'planning_style' => 'accordion',
			'planning'       => esitef_get_hub_comunicat_planning(),
			'pricing'        => array(
				'type'        => 'single',
				'title'       => __( '¿Cuánto cuesta adquirir la formación?', 'esitef-minimal' ),
				'price'       => '55',
				'currency'    => 'USD',
				'alt_prices'  => array(
					array( 'flag' => '🇪🇺', 'amount' => '53', 'currency' => '€uros' ),
					array( 'flag' => '🇲🇽', 'amount' => '1,099', 'currency' => 'MXN' ),
					array( 'flag' => '🇦🇷', 'amount' => '71,500', 'currency' => 'ARS' ),
					array( 'flag' => '🇨🇴', 'amount' => '277,000', 'currency' => 'COP' ),
				),
				'course_slug' => 'comunicat',
			),
			'landing_order'  => array( 'content_grid', 'planning', 'pricing' ),
			'cta'            => array(
				'label'       => __( 'Comprar ahora', 'esitef-minimal' ),
				'course_slug' => 'comunicat',
			),
		),
		'crecerenmovimiento' => array(
			'title'    => __( 'CRECER en movimiento', 'esitef-minimal' ),
			'subtitle' => __( '11 sesiones de 30 minutos cada una', 'esitef-minimal' ),
			'layout'   => 'landing',
			'hero'     => array(
				'title'    => __( 'CRECER en movimiento', 'esitef-minimal' ),
				'subtitle' => __( 'Sesiones de movimiento para experimentar, variar y jugar con el cuerpo. Te aportan muchas ideas para tu práctica y para que, con elementos caseros, puedas aplicar con tus pacientes y alumnos.', 'esitef-minimal' ),
				'image'   => 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=900&h=700&fit=crop&q=80',
				'image_alt' => __( 'Sesiones de movimiento creativo', 'esitef-minimal' ),
			),
			'sections' => array(
				array(
					'type'  => 'text',
					'title' => __( '¿Qué incluye?', 'esitef-minimal' ),
					'body'  => __( 'Buscamos que te muevas más y mejor. Cada clase será diferente buscando experiencias de movimiento variado, saludable, inteligente y creativo. Es accesible a todos los niveles, con progresiones y regresiones que se adapten a todos/as.', 'esitef-minimal' ),
				),
				array(
					'type'  => 'text',
					'title' => __( '¿A quién va dirigido?', 'esitef-minimal' ),
					'body'  => __( 'Es abierto a todas las personas. Si eres profesional de salud, de movimiento, de entrenamiento o artista escénico, sin duda te servirá para obtener ideas, inspiración y referencias para tu trabajo.', 'esitef-minimal' ),
				),
				array(
					'type'  => 'stats',
					'items' => array(
						array( 'value' => '6 hrs.', 'label' => __( 'de movimiento', 'esitef-minimal' ) ),
						array( 'value' => '11', 'label' => __( 'sesiones', 'esitef-minimal' ) ),
					),
				),
			),
			'pricing' => array(
				'type'        => 'promo',
				'price'       => '35',
				'price_old'   => '55',
				'currency'    => 'USD',
				'discount'    => __( '35% de descuento por lanzamiento', 'esitef-minimal' ),
				'alt_prices'  => array(
					array( '35', '55', '€uros' ),
					array( '650', '990', 'MXN' ),
					array( '52,000', '79,000', 'ARS' ),
				),
				'course_slug' => 'crecer-en-movimiento',
			),
			'cta' => array(
				'label'       => __( 'Comprar', 'esitef-minimal' ),
				'course_slug' => 'crecer-en-movimiento',
			),
		),
		'int-curso-dolor' => array(
			'title'    => __( 'Introducción al mundo del dolor', 'esitef-minimal' ),
			'subtitle' => __( 'Categorías: Dolor', 'esitef-minimal' ),
			'layout'   => 'landing',
			'hero'     => array(
				'title'    => __( 'Introducción al mundo del dolor', 'esitef-minimal' ),
				'subtitle' => __( 'Actualización para comprender el dolor desde la neurociencia y cambiar paradigmas en la práctica clínica.', 'esitef-minimal' ),
				'rating'   => '5.0',
				'reviews'  => 7,
				'image'   => 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=900&h=700&fit=crop&q=80',
				'image_alt' => __( 'Introducción al mundo del dolor', 'esitef-minimal' ),
			),
			'curriculum' => esitef_get_hub_dolor_curriculum(),
			'pricing'    => array(
				'type'        => 'single',
				'price'       => '1,390',
				'currency'    => 'MXN',
				'course_slug' => 'int-curso-dolor',
			),
			'cta' => array(
				'label'       => __( 'Ver curso y comprar', 'esitef-minimal' ),
				'course_slug' => 'int-curso-dolor',
			),
			'sticky_cta' => true,
		),
	);

	return apply_filters( 'esitef_formacion_hubs', $hubs );
}

/**
 * @param string $slug Page slug.
 * @return array<string, mixed>|null
 */
function esitef_get_formacion_hub( $slug ) {
	$hubs = esitef_get_formacion_hubs();
	return isset( $hubs[ $slug ] ) ? $hubs[ $slug ] : null;
}

/**
 * Page slugs for activation.
 *
 * @return array<string, string>
 */
function esitef_get_formacion_hub_pages_for_activation() {
	$pages = array();
	foreach ( esitef_get_formacion_hubs() as $slug => $hub ) {
		$pages[ $slug ] = array(
			'title'    => $hub['title'],
			'template' => 'page-templates/page-formacion-hub.php',
		);
	}
	return $pages;
}

/**
 * @return array<int, array<string, mixed>>
 */
function esitef_get_hub_talleres_items( $uploads ) {
	$talleres = array(
		array( 'A', 'Recuperando curvas fisiológicas', '1.5 hrs', '11 USD', 'Propondremos y practicaremos una guía práctica para recuperar la curva cervical y lumbar.', 'taller-online-a', $uploads . '/2022/02/A-Recuperando-curvas-fisiológicas.png' ),
		array( 'B', 'Trabajo en patrones cruzados', '1.5 hrs.', '11 USD', 'Enfocamos el trabajo dinámico en los patrones cruzados para preparar al cuerpo y al SNC.', 'taller-online-b', $uploads . '/2022/02/B-Trabajo-en-patrones-cruzados.png' ),
		array( 'C', 'Estabilidad Dinámico Funcional Del CORE', '3 Hrs.', '22 USD', 'Trabajo para tener una estabilidad lumbo pélvica adaptada al dinamismo y el movimiento humano.', 'taller-online-c', $uploads . '/2022/02/Estabilidad-Dinámico-Funcional-Del-Core.png' ),
		array( 'D', 'Equilibración dinámica de las cadenas miofasciales', '3 hrs.', '22 USD', 'Trabajo desde el movimiento de equilibración a través de activación sinérgica de todas las cadenas miofasciales.', 'taller-online-d', $uploads . '/2022/02/D-Icon-Equilibración-dinámica-de-las-cadenas-miofasciales.png' ),
		array( 'E', 'Biomecánica funcional del MMII', '4 hrs.', '30 USD', 'Biomecánica real y funcional del miembro inferior de forma única, amena y asimilable.', 'taller-online-e', $uploads . '/2022/02/capacidad-funcional-movimiento-flexion-cadera.png' ),
		array( 'F', 'Desde la camilla al movimiento', '8 hrs.', '55 USD', 'Guías terapéuticas sobre cómo abordar las patologías más frecuentes desde una mirada integrada.', 'taller-online-f', $uploads . '/2022/02/Desde-la-camilla-al-movimiento.png' ),
		array( 'G', 'Biomecánica función del tronco-cuello y MMSS', '6 hrs.', '45 USD', 'Biomecánica real y funcional del tronco, cuello y miembro superior.', 'taller-online-g', $uploads . '/2022/02/G-Biomecánica-función-del-tronco-cuello-y-MMSS.png' ),
		array( 'H', 'Evaluación funcional dinámica en disfunciones de rodilla', '2.5 hrs.', '15 USD', 'Evaluaciones funcionales en primera sesión por disfunción de rodilla y cómo interpretar los resultados.', 'taller-online-h', $uploads . '/2022/02/H-Evaluación-funcional-dinámica-en-disfunciones-de-rodilla.png' ),
		array( 'I', 'Guía terapéutica en disfunciones de hombro', '2.5 hrs.', '15 USD', 'Guía terapéutica basada en la última evidencia para disfunciones de hombro.', 'taller-online-i', $uploads . '/2022/02/Guía-terapéutica-en-disfunciones-de-hombro.png' ),
		array( 'J', 'Capacidad funcional de movimiento - hombro-tórax-cervical', '2.5 hrs.', '22 USD', 'Ganar R.O.M. + Estabilidad + Control motor + Flexibilidad todo al mismo tiempo.', 'taller-online-j', $uploads . '/2022/02/J-J-Capacidad-funcional-de-movimiento---hombro-tórax-cervical.png' ),
		array( 'K', 'Capacidad funcional de movimiento cadera-rodilla-tobillo-pie', '3 hrs.', '22 USD', 'Ganar R.O.M. + Estabilidad + Control motor + Flexibilidad todo al mismo tiempo.', 'taller-online-k', $uploads . '/2022/02/Capacidad-funcional-de-movimiento-cadera-rodilla-tobillo-pie.png' ),
		array( 'L', 'Evaluación funcional dinámica de disfunciones lumbares', '3 hrs.', '22 USD', 'Evaluaciones funcionales en primera sesión por disfunción lumbar.', 'taller-online-l', $uploads . '/2022/02/L-Evaluación-funcional-dinámica-de-disfunciones-lumbares.png' ),
		array( 'M', 'Evaluación dinámica y propuestas funcionales en disfunción cervical', '3 hrs.', '22 USD', 'Abordaje dinámico y funcional del cuello con herramientas concretas para tu trabajo diario.', 'taller-online-m', $uploads . '/2022/02/Evaluación-dinámica-y-propuestas-funcionales-en-disfunción-cervical.png' ),
		array( 'N', 'Trabajos dinámicos activación y mejora del pie', '2 hrs.', '20 USD', 'Abordaje dinámico y funcional del pie con herramientas concretas y muy útiles.', 'taller-online-n', $uploads . '/2022/02/Trabajos-dinámicos-de-activación-y-mejora-del-pie.png' ),
		array( 'O', 'Eficiencia en los motores del movimiento', '2 hrs.', '20 USD', 'Qué son los motores del movimiento y cómo usarlos para evaluación y optimización.', 'taller-online-o', $uploads . '/2022/02/Eficiencia-en-los-motores-del-movimiento.png' ),
		array( 'P', 'Trabajo de movilidad y estabilidad dinámica de caderas', '2 hrs.', '22 USD', 'La movilidad, estabilidad y fuerza en las caderas es esencial para la salud del movimiento.', 'taller-online-p', $uploads . '/2022/02/P-Trabajo-de-movilidad-y-estabilidad-dinámica-de-caderas.png' ),
		array( 'Q', '6 estrategias desde las que hacer una evaluación funcional dinámica', '2 hrs.', '18 USD', 'Herramientas concretas para analizar cualquier movimiento y orientar la mejora terapéutica.', 'taller-online-q', $uploads . '/2022/02/6-estrategias-desde-las-que-hacer-una-evaluación-funcional-dinámica.png' ),
		array( 'R', 'Trabajo dinámico del CORE', '3 hrs.', '20 USD', 'Actividades dinámicas que hacen trabajar el core en su función de transferencia de las fuerzas.', 'taller-online-r', $uploads . '/2022/02/R-Trabajo-dinámico-del-CORE.png' ),
	);

	$items = array();
	foreach ( $talleres as $t ) {
		$items[] = array(
			'badge'       => $t[0],
			'title'       => $t[1],
			'duration'    => $t[2],
			'price'       => $t[3],
			'excerpt'     => $t[4],
			'course_slug' => $t[5],
			'img'         => $t[6],
		);
	}
	return $items;
}

/**
 * @return array<int, array<string, string>>
 */
function esitef_get_hub_masterclass_faqs() {
	return array(
		array(
			'q' => __( '¿Quiénes pueden acceder a las Masterclass?', 'esitef-minimal' ),
			'a' => __( 'Nuestras Masterclass se encaminan a profesionales de la salud, la educación física, el movimiento y las artes escénicas. Algunas están orientadas sólo a un perfil profesional concreto.', 'esitef-minimal' ),
		),
		array(
			'q' => __( '¿Qué incluye cada Masterclass?', 'esitef-minimal' ),
			'a' => __( 'Visualización de cada Masterclass que adquieras con acceso durante 6 meses.', 'esitef-minimal' ),
		),
		array(
			'q' => __( '¿Cuándo comienzan las formaciones?', 'esitef-minimal' ),
			'a' => __( 'Después de registrarse y realizar el pago, recibirá acceso inmediato para poder comenzar cuando tú lo desees.', 'esitef-minimal' ),
		),
		array(
			'q' => __( '¿Cuánto tiempo estarán disponibles las Masterclass?', 'esitef-minimal' ),
			'a' => __( 'Tendrá acceso durante 6 meses para vistas ilimitadas de los videos.', 'esitef-minimal' ),
		),
		array(
			'q' => __( '¿Cómo puedo pagar?', 'esitef-minimal' ),
			'a' => __( 'A través de la web con tarjeta de crédito/débito o PayPal. También transferencia bancaria según tu país.', 'esitef-minimal' ),
		),
		array(
			'q' => __( '¿Con quién puedo hablar para obtener más ayuda?', 'esitef-minimal' ),
			'a' => __( 'Contacta en info@esitef.com', 'esitef-minimal' ),
		),
	);
}

/**
 * @return array<int, array<string, string>>
 */
function esitef_get_hub_club_faqs() {
	return array(
		array(
			'q' => __( '¿Qué incluye la compra?', 'esitef-minimal' ),
			'a' => __( 'Acceso completo a los 8 bloques temáticos con análisis de artículos científicos y 8 MasterClasses exclusivas de integración práctica. Sin mensualidades: compras una vez y avanzas a tu ritmo.', 'esitef-minimal' ),
		),
		array(
			'q' => __( '¿Cómo accedo tras comprar?', 'esitef-minimal' ),
			'a' => __( 'Tras registrarte y completar el pago recibirás acceso inmediato a nuestra plataforma online para comenzar cuando quieras.', 'esitef-minimal' ),
		),
		array(
			'q' => __( '¿Cuánto tiempo tengo para ver el contenido?', 'esitef-minimal' ),
			'a' => __( 'Sin presión de suscripción: el programa es tuyo para recorrerlo a tu propio ritmo, revisando cada bloque las veces que necesites.', 'esitef-minimal' ),
		),
		array(
			'q' => __( '¿Cómo puedo pagar?', 'esitef-minimal' ),
			'a' => __( 'Con tarjeta de crédito/débito o PayPal desde cualquier parte del mundo. Si eres de Argentina, también puedes transferir en pesos: BANCO SUPERVIELLE — Número: 1-3095895-3 — CBU: 0270001420030958950036. Envía comprobante a info@esitef.com con asunto: Insc. Club de Actualización.', 'esitef-minimal' ),
		),
		array(
			'q' => __( '¿Con quién puedo contactar?', 'esitef-minimal' ),
			'a' => __( 'Escríbenos a info@esitef.com y te ayudamos con cualquier duda sobre el programa o el proceso de compra.', 'esitef-minimal' ),
		),
	);
}

/**
 * @return array<int, array<string, mixed>>
 */
function esitef_get_hub_club_planning() {
	return array(
		array(
			'month' => __( 'Bloque 1', 'esitef-minimal' ),
			'items' => array(
				__( 'Un marco para que los clínicos mejoren el proceso de toma de decisiones en el regreso al deporte — Yung 2022 · ⏲ 17:08 min', 'esitef-minimal' ),
				__( 'Being Water: how key ideas from the practice of Bruce Lee align with contemporary theorizing in movement skill acquisition — Myszca 2023 · ⏲ 10:42 min', 'esitef-minimal' ),
				__( 'Aplicación del Modelo del Sistema de Movimiento de 4 Elementos a la Práctica y Educación de la Fisioterapia Deportiva — Zarzicky 2022 · ⏲ 10:56 min', 'esitef-minimal' ),
				__( 'El modelo tridente de adaptación neuroplástica: un marco novedoso sugerido para la rehabilitación del LCA — Machan 2021 · ⏲ 26:21 min', 'esitef-minimal' ),
				__( 'Partial vs full range of motion resistance training: A systematic review and metaanalysis — Wolf 2022 · ⏲ 8:30 min', 'esitef-minimal' ),
				__( 'Influencia de las creencias del sobre el abordaje y los resultados — Bonino · ⏲ 30 min', 'esitef-minimal' ),
			),
		),
		array(
			'month' => __( 'Bloque 2', 'esitef-minimal' ),
			'items' => array(
				__( 'Comprender las discrepancias en el miedo al movimiento y el comportamiento de evitación de una persona: una guía para los profesionales de rehabilitación musculoesquelética — De Beats 2023 · ⏲ 16:58 min', 'esitef-minimal' ),
				__( '¿Es hora de pasar del estiramiento obligatorio? Necesitamos diferenciar "¿Puedo?" De "¿Tengo que hacerlo?" — Afonso 2021 · ⏲ 6:25 min', 'esitef-minimal' ),
				__( 'Desarrollo de marcos de terapia manual para mecanismos de dolor específicos — Cook 2023 · ⏲ 12:03 min', 'esitef-minimal' ),
				__( 'El diagnóstico del síndrome de fibromialgia — Berwick 2022 · ⏲ 14:07 min', 'esitef-minimal' ),
				__( 'MasterClass — Bonino · ⏲ —', 'esitef-minimal' ),
			),
		),
		array(
			'month' => __( 'Bloque 3', 'esitef-minimal' ),
			'items' => array(
				__( 'Desarrollo de la experiencia en fisioterapia deportiva - El valor del aprendizaje informal — Peterson 2021 · ⏲ 6:05 min', 'esitef-minimal' ),
				__( 'La distracción del dolor depende de las demandas de la tarea y la motivación — Roy 2022 · ⏲ 5:23 min', 'esitef-minimal' ),
				__( 'Conceptualización de la alianza terapéutica en fisioterapia: ¿es adecuada? — Hebron 2020 · ⏲ 14:13 min', 'esitef-minimal' ),
				__( 'Terapia manual versus localización en pacientes con dolor de cuello inespecífico: un ensayo clínico piloto aleatorizado — Thomaidou 2023 · ⏲ 9:22 min', 'esitef-minimal' ),
				__( 'MasterClass — Bonino · ⏲ —', 'esitef-minimal' ),
			),
		),
		array(
			'month' => __( 'Bloque 4', 'esitef-minimal' ),
			'items' => array(
				__( 'CONTACTO IMPROVISADO — Paxton 1975 · ⏲ 9:36 min', 'esitef-minimal' ),
				__( 'Desentrañando la complejidad del dolor lumbar — O´Sullivan 2016 · ⏲ 15 min', 'esitef-minimal' ),
				__( 'Factores de la Intención de Revisita de los Pacientes del Sistema de Atención Primaria de Salud en Argentina — Pighin 2022 · ⏲ 8:42 min', 'esitef-minimal' ),
				__( 'Distracción del dolor: el papel de la atención selectiva y la catastrofización del dolor — Rischer 2022 · ⏲ 3:29 min', 'esitef-minimal' ),
				__( '¿Cuándo y cómo proporcionar retroalimentación e instrucciones a los atletas? — Klatt 2020 · ⏲ 22:04 min', 'esitef-minimal' ),
				__( 'MasterClass — Bonino · ⏲ —', 'esitef-minimal' ),
			),
		),
		array(
			'month' => __( 'Bloque 5', 'esitef-minimal' ),
			'items' => array(
				__( 'Principios en práctica: un estudio observacional del uso en los fisioterapeutas de los principios de aprendizaje motor en la rehabilitación del accidente cerebrovascular — Johnson 2023 · ⏲ 6:08 min', 'esitef-minimal' ),
				__( 'Síndrome de dolor miofascial: una condición nociceptiva comórbida con dolor neuropático o nociplástico — F. de las peñas 2023 · ⏲ 16:52 min', 'esitef-minimal' ),
				__( 'Intervenciones basadas en ejercicios para prevenir lesiones en la rodilla y el ligamento cruzado anterior — Arundale 2023 · ⏲ 9:26 min', 'esitef-minimal' ),
				__( 'Un enfoque clínicamente razonado de la terapia manual en la fisioterapia deportiva — Short 2023 · ⏲ 9:29 min', 'esitef-minimal' ),
				__( 'MasterClass — Bonino · ⏲ —', 'esitef-minimal' ),
			),
		),
		array(
			'month' => __( 'Bloque 6', 'esitef-minimal' ),
			'items' => array(
				__( 'La ciencia del dolor en la práctica (Parte 1): ¿Qué es la neurociencia del dolor? — Hoegh 2022 · ⏲ 8:30 min', 'esitef-minimal' ),
				__( 'La ciencia del dolor en la práctica (Parte 2): ¿Qué es la neurociencia del dolor? — Hoegh 2022 · ⏲ 5:13 min', 'esitef-minimal' ),
				__( 'La ciencia del dolor en la práctica (Parte 3): Sensibilización periférica — Hoegh 2022 · ⏲ 9:04 min', 'esitef-minimal' ),
				__( 'La ciencia del dolor en la práctica (Parte 4): Sensibilización Central — Hoegh 2023 · ⏲ 11 min', 'esitef-minimal' ),
				__( 'La ciencia del dolor en la práctica (Parte 5): Sensibilización central II — Hoegh 2022 · ⏲ 7:25 min', 'esitef-minimal' ),
				__( 'MasterClass — Bonino · ⏲ —', 'esitef-minimal' ),
			),
		),
		array(
			'month' => __( 'Bloque 7', 'esitef-minimal' ),
			'items' => array(
				__( 'Presentamos el estándar de atención clínica de Australia para el dolor lumbar — Maher 2023 · ⏲ 8:11 min', 'esitef-minimal' ),
				__( 'Comprender la carga de entrenamiento como exposición y dosis — Impellizzieri 2023 · ⏲ 10:30 min', 'esitef-minimal' ),
				__( 'Factores psicológicos durante la rehabilitación de pacientes con tendinopatía de Aquiles o rotuliana: un estudio transversal — Slagers 2021 · ⏲ 3:47 min', 'esitef-minimal' ),
				__( 'Los crecientes expertos en fisioterapia deportiva ocupan un pueblo: el aprendizaje técnico, creativo y contextual no ocurre en el vacío — Phillips 2020 · ⏲ 5:34 min', 'esitef-minimal' ),
				__( 'MasterClass — Sampietro · ⏲ —', 'esitef-minimal' ),
			),
		),
		array(
			'month' => __( 'Bloque 8', 'esitef-minimal' ),
			'items' => array(
				__( '¿Entrenar o Sinergizar? Los principios de los sistemas complejos cambian la comprensión de los procesos deportivos — Balague 2020 · ⏲ 23:43 min', 'esitef-minimal' ),
				__( 'Conozca sus movimientos: una menor precisión propioceptiva está asociada con un comportamiento de evitación sobreprotector — Vendael 2022 · ⏲ 10:13 min', 'esitef-minimal' ),
				__( 'El modelo de razonamiento clínico por qué, dónde y cómo para la evaluación y tratamiento de pacientes con dolor lumbar — Riley 2020 · ⏲ 9:11 min', 'esitef-minimal' ),
				__( 'Tratamientos para la kinesiofobia en personas con dolor crónico: una revisión de alcance — Bordeleau 2022 · ⏲ 5:51 min', 'esitef-minimal' ),
				__( 'MasterClass — Sampietro · ⏲ —', 'esitef-minimal' ),
			),
		),
	);
}

/**
 * Tema visual del hub (reutiliza estilos de otro slug si aplica).
 *
 * @param array<string, mixed> $hub Hub data.
 * @param string             $slug Page slug.
 */
function esitef_get_hub_theme_slug( $hub, $slug ) {
	return ! empty( $hub['theme'] ) ? (string) $hub['theme'] : (string) $slug;
}

/**
 * @return array<int, array<string, mixed>>
 */
function esitef_get_hub_comunicat_planning() {
	return array(
		array(
			'month' => __( 'Video 1. Empecemos. (33 minutos)', 'esitef-minimal' ),
			'items' => array(
				__( 'Capacidad vs habilidad', 'esitef-minimal' ),
				__( 'Glosofobia.', 'esitef-minimal' ),
				__( 'Ámbitos en los que ayuda el conocimiento en comunicación efectiva.', 'esitef-minimal' ),
				__( 'Dificultades habituales.', 'esitef-minimal' ),
			),
		),
		array(
			'month' => __( 'Video 2: Comunicación efectiva. (32 minutos)', 'esitef-minimal' ),
			'items' => array(
				__( '¿Qué es comunicar?', 'esitef-minimal' ),
				__( '¿Al informar y exponer, estás comunicando siempre?', 'esitef-minimal' ),
				__( 'Las 10 claves del buen comunicador.', 'esitef-minimal' ),
				__( 'Tipos de oyentes.', 'esitef-minimal' ),
			),
		),
		array(
			'month' => __( 'Video 3. Hablar en público y la atención. (59 minutos)', 'esitef-minimal' ),
			'items' => array(
				__( 'Los tipos de atención.', 'esitef-minimal' ),
				__( 'Los enemigos de la atención.', 'esitef-minimal' ),
				__( 'Cómo captar y mantener la atención.', 'esitef-minimal' ),
				__( 'Los 5 secretos de la buena comunicación.', 'esitef-minimal' ),
			),
		),
		array(
			'month' => __( 'Video 4. Storytelling, gestualidad y uso del espacio (57 minutos)', 'esitef-minimal' ),
			'items' => array(
				__( 'Storytelling como herramienta.', 'esitef-minimal' ),
				__( 'Uso del espacio disponible.', 'esitef-minimal' ),
				__( 'Uso efectivo del micrófono y puntero.', 'esitef-minimal' ),
				__( 'Postura e imagen corporal.', 'esitef-minimal' ),
				__( 'Uso de las manos y los gestos.', 'esitef-minimal' ),
			),
		),
		array(
			'month' => __( 'Video 5. Organización de tu presentación. (35 minutos)', 'esitef-minimal' ),
			'items' => array(
				__( 'Inicio que engancha y atrae.', 'esitef-minimal' ),
				__( 'Desarrollo dinámico… ideas, simplificación y recapitulación', 'esitef-minimal' ),
				__( 'Final/ conclusión.', 'esitef-minimal' ),
				__( 'El uso del apoyo audiovisual para que facilite el mensaje.', 'esitef-minimal' ),
			),
		),
		array(
			'month' => __( 'Video 6. Cómo hablar (35 minutos)', 'esitef-minimal' ),
			'items' => array(
				__( 'El poder de la pausa, de la mirada y la pasión.', 'esitef-minimal' ),
				__( 'Tono, volumen y ritmo.', 'esitef-minimal' ),
				__( 'Sinónimos.', 'esitef-minimal' ),
				__( 'Vocalización – uso de la respiración.', 'esitef-minimal' ),
				__( 'El poder de la humildad y complicidad.', 'esitef-minimal' ),
			),
		),
		array(
			'month' => __( 'Video 7. El uso del apoyo audiovisual. (51 minutos)', 'esitef-minimal' ),
			'items' => array(
				__( 'Comunicación efectiva con diapositiva.', 'esitef-minimal' ),
				__( 'Uso vs abuso.', 'esitef-minimal' ),
				__( '¿Cantidad y calidad?', 'esitef-minimal' ),
				__( 'Animaciones, colores, tamaños.', 'esitef-minimal' ),
				__( 'El "black".', 'esitef-minimal' ),
			),
		),
		array(
			'month' => __( 'Video 8. Comunicación en vídeo (47 minutos)', 'esitef-minimal' ),
			'items' => array(
				__( 'Hablar en cámara.', 'esitef-minimal' ),
				__( 'Tips a tener en cuenta.', 'esitef-minimal' ),
				__( 'Diferencias con el presencial.', 'esitef-minimal' ),
				__( 'Planificación.', 'esitef-minimal' ),
				__( 'Uso de imágenes.', 'esitef-minimal' ),
				__( 'Iluminación y sonido básico.', 'esitef-minimal' ),
			),
		),
		array(
			'month' => __( 'Video 9. Potenciar la comunicación en cada formato (32 minutos)', 'esitef-minimal' ),
			'items' => array(
				__( 'Características de los diferentes formatos (uno a uno, clase presencial, ponencia en auditorio, Master class grabada, video, zoom-skype)', 'esitef-minimal' ),
				__( 'Acciones que limitan el entendimiento según el formato.', 'esitef-minimal' ),
				__( 'Tips generales para cada uno.', 'esitef-minimal' ),
			),
		),
		array(
			'month' => __( 'Video 10. Los trucos de los grandes comunicadores', 'esitef-minimal' ),
			'items' => array(
				__( 'Ejemplos prácticos de comunicación efectiva.', 'esitef-minimal' ),
				__( 'Los diferentes estilos.', 'esitef-minimal' ),
				__( 'Trucos y habilidades del buen comunicador.', 'esitef-minimal' ),
			),
		),
		array(
			'month' => __( 'Video 11. Uso eficiente de las Apps', 'esitef-minimal' ),
			'items' => array(
				__( 'Skype.', 'esitef-minimal' ),
				__( 'Zoom.', 'esitef-minimal' ),
				__( 'Trello.', 'esitef-minimal' ),
				__( 'Screencast-o-matic.', 'esitef-minimal' ),
				__( 'Otras…', 'esitef-minimal' ),
			),
		),
	);
}

/**
 * @return array<string, array<int, array<string, string>>>
 */
function esitef_get_hub_dolor_curriculum() {
	return array(
		'main' => array(
			array( 'title' => __( '1. Introducción al mundo del dolor', 'esitef-minimal' ), 'duration' => '01:07:47' ),
			array( 'title' => __( '2. Herramientas terapéuticas para el dolor', 'esitef-minimal' ), 'duration' => '53:10' ),
			array( 'title' => __( '3. Recomendación de lecturas', 'esitef-minimal' ), 'duration' => '12:55' ),
		),
		'summaries' => array(
			array( 'title' => __( 'La ciencia del dolor en la práctica (Parte 1) — Hoegh 2022', 'esitef-minimal' ), 'duration' => '08:31' ),
			array( 'title' => __( 'La ciencia del dolor en la práctica (Parte 2) — Hoegh 2022', 'esitef-minimal' ), 'duration' => '05:13' ),
			array( 'title' => __( 'Sensibilización periférica — Hoegh 2022', 'esitef-minimal' ), 'duration' => '09:04' ),
			array( 'title' => __( 'Sensibilización Central — Hoegh 2023', 'esitef-minimal' ), 'duration' => '11:02' ),
			array( 'title' => __( 'Práctica basada en la posibilidad — Vaz 2023', 'esitef-minimal' ), 'duration' => '32:33' ),
			array( 'title' => __( 'Desentrañando la complejidad del dolor lumbar — O´Sullivan 2016', 'esitef-minimal' ), 'duration' => '15:01' ),
		),
	);
}

/**
 * Vimeo embed URL from ID or share link.
 *
 * @param string $video Vimeo ID or URL.
 */
function esitef_hub_vimeo_embed_url( $video ) {
	$video = trim( (string) $video );
	if ( preg_match( '/vimeo\.com\/(?:video\/)?(\d+)/', $video, $m ) ) {
		return 'https://player.vimeo.com/video/' . $m[1];
	}
	if ( ctype_digit( $video ) ) {
		return 'https://player.vimeo.com/video/' . $video;
	}
	return $video;
}

/**
 * CTA URL from hub cta or pricing block.
 *
 * @param array<string, mixed> $hub Hub data.
 */
function esitef_get_hub_cta_url( $hub ) {
	if ( ! empty( $hub['cta']['course_slug'] ) ) {
		return esitef_resolve_course_url( array( 'course_slug' => $hub['cta']['course_slug'] ) );
	}
	if ( ! empty( $hub['pricing']['course_slug'] ) ) {
		return esitef_resolve_course_url( array( 'course_slug' => $hub['pricing']['course_slug'] ) );
	}
	return '#';
}
