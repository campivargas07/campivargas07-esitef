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
					'course_slug' => 'masterclass-gestion-fuerzas',
				),
				array(
					'title'       => __( 'La conciencia corporal y sus 4 componentes diferenciados', 'esitef-minimal' ),
					'img'         => 'https://images.unsplash.com/photo-1545205597-3b0399b8f4b8?w=400&h=400&fit=crop&q=80',
					'course_slug' => 'masterclass-conciencia-corporal',
				),
				array(
					'title'       => __( 'Entendiendo, por fin, qué es la estabilidad del CORE', 'esitef-minimal' ),
					'img'         => 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&q=80',
					'course_slug' => 'masterclass-estabilidad-core',
				),
				array(
					'title'       => __( '¿Qué hay que hacer para conseguir un movimiento eficiente?', 'esitef-minimal' ),
					'img'         => 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=400&fit=crop&q=80',
					'course_slug' => 'masterclass-movimiento-eficiente',
				),
				array(
					'title'       => __( 'Estabilidad estática y dinámica. Diferencias y cómo trabajarlas', 'esitef-minimal' ),
					'img'         => 'https://images.unsplash.com/photo-1599058945522-28d584b6f841?w=400&h=400&fit=crop&q=80',
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
			'title'    => __( 'Club de actualización', 'esitef-minimal' ),
			'subtitle' => __( 'Nunca te habrá resultado tan fácil, atractivo y rápido estar actualizado/a', 'esitef-minimal' ),
			'layout'   => 'landing',
			'hero'     => array(
				'eyebrow' => __( 'Bienvenido/a al', 'esitef-minimal' ),
				'title'   => __( 'Club de actualización', 'esitef-minimal' ),
				'subtitle' => __( 'Cada semana te ofrecemos un video explicándote de forma resumida, amena y super digerible los artículos científicos más relevantes para tu día a día profesional + una MasterClass por mes.', 'esitef-minimal' ),
				'image'   => 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&h=700&fit=crop&q=80',
				'image_alt' => __( 'Profesionales en formación continua', 'esitef-minimal' ),
			),
			'sections' => array(
				array(
					'type'  => 'text',
					'title' => __( '¿Qué buscamos con este CLUB?', 'esitef-minimal' ),
					'body'  => __( 'Facilitar y democratizar el acceso, análisis, entendimiento y aplicación práctica de la última evidencia científica disponible para elevar los estándares de calidad profesional. Ayudarte a crecer en tu actividad diaria dedicando muy poco tiempo y muy muy poco dinero.', 'esitef-minimal' ),
				),
				array(
					'type'  => 'text',
					'title' => __( '¿A quién va dirigido?', 'esitef-minimal' ),
					'body'  => __( 'A todo profesional de la rehabilitación, la actividad física y el movimiento que desee conocer la última evidencia disponible para crecer en su día a día profesional.', 'esitef-minimal' ),
				),
			),
			'pricing'  => array(
				'type'  => 'plans',
				'plans' => array(
					array(
						'name'       => __( 'Plan mensual', 'esitef-minimal' ),
						'price'      => '9,9',
						'currency'   => 'USD',
						'period'     => __( 'Por mes', 'esitef-minimal' ),
						'highlight'  => false,
						'features'   => array( '9,9 €uros', '200 MXN', '12,870 ARS', __( '+ 1 MasterClass de regalo', 'esitef-minimal' ) ),
						'course_slug' => 'club-actualizacion-mensual',
					),
					array(
						'name'       => __( 'Plan semestral', 'esitef-minimal' ),
						'price'      => '59,9',
						'currency'   => 'USD',
						'period'     => __( '6 meses + 1 gratis', 'esitef-minimal' ),
						'highlight'  => true,
						'features'   => array( '59,9 €uros', '1,190 MXN', '77,870 ARS' ),
						'course_slug' => 'club-actualizacion-semestral',
					),
				),
			),
			'planning' => esitef_get_hub_club_planning(),
			'faqs'     => esitef_get_hub_club_faqs(),
			'cta'      => array(
				'label'       => __( 'Comprar Plan Semestral', 'esitef-minimal' ),
				'course_slug' => 'club-actualizacion-semestral',
			),
		),
		'capacidad-funcional-movimiento' => array(
			'title'    => __( 'Capacidad Funcional de Movimiento', 'esitef-minimal' ),
			'subtitle' => __( '5 Programas de progresiones de ejercicio terapéutico', 'esitef-minimal' ),
			'layout'   => 'grid',
			'intro'    => __( '¿Qué es? Una serie de movimientos activos para ganar: R.O.M. + Estabilidad + Control Motor + Flexibilidad… todo al mismo tiempo y además facilitando la disociación. «Despertando» el SNC respecto a la sinergia.', 'esitef-minimal' ),
			'grid_style' => 'showcase',
			'cover_image' => 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1400&h=600&fit=crop&q=80',
			'grid_cols' => 2,
			'show_meta' => true,
			'items'    => array(
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
			'hero'     => array(
				'eyebrow' => __( 'Somos', 'esitef-minimal' ),
				'title'   => 'Comunica-t',
				'subtitle' => __( 'Comunica-t es una plataforma de formación que nace de la ilusión de un comunicador y viajero por ayudar a los demás a mejorar en sus habilidades comunicativas. Hablar en público es una actividad sumamente necesaria y utilizada en todos los momentos y entornos de la vida.', 'esitef-minimal' ),
				'image'   => 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=900&h=700&fit=crop&q=80',
				'image_alt' => __( 'Comunicación efectiva en público', 'esitef-minimal' ),
			),
			'sections' => array(
				array(
					'type' => 'text',
					'body' => __( 'Se crea para facilitar el trabajo y las relaciones humanas a través de ofrecer herramientas prácticas fáciles y útiles para aprender a hablar mejor en público. Sin embargo no nos han enseñado nunca a cómo hacerlo de forma efectiva: para que nuestro mensaje, nuestras ideas y nuestras presentaciones lleguen de manera clara, se entiendan y dejen la huella que deseamos.', 'esitef-minimal' ),
				),
			),
			'curriculum' => esitef_get_hub_comunicat_curriculum(),
			'pricing'    => array(
				'type'     => 'single',
				'price'    => '55',
				'currency' => 'USD',
				'alt_prices' => array( '53 €uros', '1,099 MXN', '71,500 ARS', '277,000 COP' ),
				'course_slug' => 'comunicat',
			),
			'cta' => array(
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
			'q' => __( 'Si eres de Argentina', 'esitef-minimal' ),
			'a' => __( 'Por políticas de PayPal facilitamos transferencia en pesos argentinos (Plan Semestral). BANCO SUPERVIELLE — Número: 1-3095895-3 — CBU: 0270001420030958950036. Envía comprobante a info@esitef.com con asunto: Insc. Club de Actualización.', 'esitef-minimal' ),
		),
		array(
			'q' => __( '¿Cómo accedo a los videos?', 'esitef-minimal' ),
			'a' => __( 'Al inscribirte tendrás acceso a nuestra plataforma ONLINE. Cada viernes subiremos el video-análisis de un artículo, disponible durante 3 meses.', 'esitef-minimal' ),
		),
		array(
			'q' => __( '¿Cada cuánto suben los contenidos?', 'esitef-minimal' ),
			'a' => __( 'Cada viernes: MX 8 hrs. · AR 11 hrs. · ES 16 hrs.', 'esitef-minimal' ),
		),
		array(
			'q' => __( '¿Cuánto tiempo tengo para ver el contenido?', 'esitef-minimal' ),
			'a' => __( 'Podrás verlos cuantas veces quieras durante 3 meses, hasta el fin de tu suscripción.', 'esitef-minimal' ),
		),
		array(
			'q' => __( '¿Cómo puedo pagar?', 'esitef-minimal' ),
			'a' => __( 'Vía PayPal o con cualquier tarjeta de crédito/débito desde cualquier parte del mundo.', 'esitef-minimal' ),
		),
	);
}

/**
 * @return array<int, array<string, mixed>>
 */
function esitef_get_hub_club_planning() {
	return array(
		array(
			'month' => __( 'Mayo', 'esitef-minimal' ),
			'items' => array(
				__( 'Será hora de dejar el estiramiento obligatorio? — Alfonso 2021', 'esitef-minimal' ),
				__( 'Es hora de ir más allá de las regiones corporales — Caneiro 2019', 'esitef-minimal' ),
				__( 'Optimización del movimiento — Guccione 2022', 'esitef-minimal' ),
				__( 'MasterClass: Entendiendo qué es la estabilidad — Matías Sampietro', 'esitef-minimal' ),
			),
		),
		array(
			'month' => __( 'Junio', 'esitef-minimal' ),
			'items' => array(
				__( 'Un enfoque de procesos en terapias manuales — Lederman 2015', 'esitef-minimal' ),
				__( 'Evaluación de la salud del movimiento — Dingenen 2018', 'esitef-minimal' ),
				__( 'MasterClass: La conciencia corporal — Tomás Bonino', 'esitef-minimal' ),
			),
		),
		array(
			'month' => __( 'Julio', 'esitef-minimal' ),
			'items' => array(
				__( '¿Es hora de replantear el dolor musculoesquelético? — Lewis 2018', 'esitef-minimal' ),
				__( 'Variabilidad de la práctica y foco externo — Chua 2019', 'esitef-minimal' ),
				__( 'MasterClass: Destrezas básicas — Tomás Bonino', 'esitef-minimal' ),
			),
		),
	);
}

/**
 * @return array<int, array<string, string>>
 */
function esitef_get_hub_comunicat_curriculum() {
	$videos = array(
		array( '1. Empecemos.', '33 minutos' ),
		array( '2. Comunicación efectiva.', '32 minutos' ),
		array( '3. Hablar en público y la atención.', '59 minutos' ),
		array( '4. Storytelling, gestualidad y uso del espacio', '57 minutos' ),
		array( '5. Organización de tu presentación.', '35 minutos' ),
		array( '6. Cómo hablar', '35 minutos' ),
		array( '7. El uso del apoyo audiovisual.', '51 minutos' ),
		array( '8. Comunicación en vídeo', '47 minutos' ),
		array( '9. Potenciar la comunicación en cada formato', '32 minutos' ),
		array( '10. Los trucos de los grandes comunicadores', '' ),
		array( '11. Uso eficiente de las Apps', '' ),
	);
	$out = array();
	foreach ( $videos as $v ) {
		$out[] = array( 'title' => 'Video ' . $v[0], 'duration' => $v[1] );
	}
	return $out;
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
