<?php
/**
 * Formaciones presenciales — catálogo, instancias por ciudad y helpers.
 *
 * @package esitef-minimal
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Docentes reutilizables.
 *
 * @return array<string, array<string, mixed>>
 */
function esitef_get_presencial_professors() {
	$professors = array(
		'tomas-bonino' => array(
			'name'  => 'Tomás Bonino',
			'role'  => 'ESP',
			'image' => 'https://esitef.com/online/wp-content/uploads/2026/06/Tomas_Bonino.jpg',
			'bio'   => array(
				'Autor del libro «DOLOR. Conceptos esenciales para fisioterapeutas (y pacientes)» (2024).',
				'Creador de la formación en «Desarrollo de habilidades en gestión de grupos orientado al ejercicio terapéutico» (2024).',
				'Socio de la Sociedad Española de Fisioterapia y Dolor (SEFID) y la International Association for the Study of Pain (IASP) (2024).',
				'Creador del Podcast «CRECER» (2024).',
				'Investigador-colaborador en I_mBody_LAb y Move_Int_Play_Lab (Univ. Carlos III, Madrid). Desde 2023.',
				'Investigador-colaborador en «Neurocognition and Action» y «Center of Excellence Cognitive Interaction Technology» (Universidad Bielefeld, Alemania). Desde 2023.',
				'Docente en el «Experto en rehabilitación, readaptación y reentrenamiento» (Equipo Physical). Desde 2023.',
				'Profesor del «Postgrado en movimiento y ejercicio terapéutico» (España), 4 ediciones (2020–2023).',
				'Autor del libro «Fisioterapia desde y para el movimiento» (2022).',
				'Fundador y director de ESITEF (Escuela Internacional de Terapia Física). 12 países. Desde 2007.',
				'Fisioterapeuta en España desde 2001. Movement coach. Experto en movimiento terapéutico.',
				'Asesor clínico y colaborador en hospitales, clínicas, equipos deportivos, ballets, circos y artistas escénicos PRO en 12 países.',
			),
		),
		'noelia-martinez' => array(
			'name'  => 'Noelia Martínez',
			'role'  => 'ARG',
			'image' => 'https://esitef.com/online/wp-content/uploads/2026/06/Noelia_Martinez.jpg',
			'bio'   => array(
				'Fundadora y coordinadora de NUTA.',
				'Formada, desde hace más de 20 años, en diversos métodos de trabajo postural y variadas disciplinas de movimiento (Feldenkrais, Flying Low, Contact Impro, Movimiento Eficiente, Ejercicio Terapéutico, JEMS Method, RPG, GDS, SGA, entre otros).',
				'Maestría en Salud: Entrenamiento, nutrición y descanso (España).',
				'Co-creadora del Formato de Entrenamiento Nuta y E.N +65.',
				'Mamá de dos varones; disfruta tanto de enseñar como aprender y vive en Mendoza, Argentina.',
			),
		),
		'matias-sampietro' => array(
			'name'  => 'Matías Sampietro',
			'role'  => 'ARG',
			'image' => 'https://esitef.com/online/wp-content/uploads/2026/06/Matias_Sampietro.jpg',
			'bio'   => array(
				'Doctorando en Ciencias de la Salud.',
				'Especialista en Fisioterapia deportiva.',
				'Master en Prevención y Readaptación de lesiones.',
				'CEO y fundador de Equipophysical — Staff Docente ESITEF internacional.',
				'Coordinador Académico Maestría en Reentrenamiento y Prevención de lesiones (UGR).',
				'Ex jefe del departamento de rehabilitación Club Atlético Belgrano.',
				'Speaker en múltiples congresos y cursos internacionales.',
				'Docente e Investigador asociado (UNRAF).',
			),
		),
	);

	return apply_filters( 'esitef_presencial_professors', $professors );
}

/**
 * Plantillas de formación (contenido compartido entre ciudades).
 *
 * @return array<string, array<string, mixed>>
 */
function esitef_get_presencial_catalog() {
	$thumb = 'https://esitef.com/online/wp-content/uploads/2022/12/esitef-inicio4-escuela-de-fisioterapia.webp';

	$catalog = array(
		'gestion-fuerzas' => array(
			'title'       => 'Análisis y optimización del Movimiento y el ejercicio desde la «Gestión funcional de las fuerzas»',
			'title_bold'  => '(Creación-distribución-transferencia-disipación)',
			'professors'  => array( 'tomas-bonino' ),
			'syllabus'    => array(
				'title'       => 'Programa',
				'description' => 'La evaluación dinámica funcional nos da un abanico de enfoques desde el movimiento útiles para evaluar de manera activa y dinámica a nuestros pacientes y clientes.',
				'pdf_url'     => '',
			),
			'program'     => array(
				array(
					'title' => '1. Creación de fuerzas',
					'items' => array(
						'Estabilidad y objetivo.',
						'Funcionamiento del «core». Estabilidad vs rigidez.',
						'1.1 Propulsión (empuje e inercia).',
						'Evaluación dinámica de bases.',
						'Evaluación dinámica funcional.',
						'Tratamiento fases: empuje, inercia, combinación.',
					),
				),
				array(
					'title' => '2. Distribución eficiente de las fuerzas',
					'items' => array(
						'Evaluación (tests dinámicos) y tratamiento.',
					),
				),
				array(
					'title' => '3. Transferencia de las fuerzas',
					'items' => array(
						'Alteraciones de la transferencia y optimización del movimiento por planos.',
						'Acción y fluidez en el plano frontal.',
						'Acción y fluidez en el plano sagital.',
						'Acción y fluidez en el plano transverso — alteraciones en el movimiento por planos.',
					),
				),
				array(
					'title' => '4. Disipación eficiente de las fuerzas',
					'items' => array(
						'Evaluación (tests dinámicos) y tratamiento.',
						'Las leyes de la disipación.',
						'Los «muelles» de la disipación.',
						'La absorción de fuerzas.',
						'Espirales y caída.',
						'Estrategia de desensibilización por exposición progresiva en algo demandante.',
					),
				),
			),
		),
		'dolor-movimiento' => array(
			'title'       => 'Formación en Dolor y Movimiento',
			'title_bold'  => 'Nuevos paradigmas desde la evidencia',
			'professors'  => array( 'tomas-bonino' ),
			'syllabus'    => array(
				'title'       => 'Programa del curso',
				'description' => 'Aplicación práctica y clínica de los nuevos paradigmas desde la última evidencia disponible.',
				'pdf_url'     => '',
			),
			'program'     => array(
				array(
					'title' => '1. Comprendiendo el dolor',
					'items' => array(
						'Neurociencia actual del dolor: nociceptivo, neuropático y nociplástico.',
						'Modelos explicativos: de lo biomédico al biopsicosocial y enactivo.',
						'Mitos y creencias erróneas: «dolor = daño».',
						'Errores comunes de la fisioterapia en el abordaje de personas con dolor.',
					),
				),
				array(
					'title' => '2. Evaluación y razonamiento clínico',
					'items' => array(
						'Entrevista clínica con enfoque biopsicosocial.',
						'Evaluación física basada en capacidades y función.',
						'Interpretación y comunicación de hallazgos sin nocebos.',
						'Evaluación desde y para el movimiento.',
					),
				),
				array(
					'title' => '3. Intervención: educación, ejercicio y decisiones clínicas',
					'items' => array(
						'Abordaje activo y conductual (CFT, Fisioterapia Bioconductual).',
						'Educación en dolor y neurociencia.',
						'Ejercicio terapéutico y entrenamiento en presencia de dolor.',
						'Estrategias activas para cambio conductual y autogestión.',
					),
				),
			),
		),
		'movement-coaching' => array(
			'title'       => 'Especialización en Movement Coaching',
			'title_bold'  => '(Movimiento eficiente y ejercicio terapéutico)',
			'professors'  => array( 'tomas-bonino' ),
			'syllabus'    => array(
				'title'       => 'Programa',
				'description' => 'Ayudarte a trabajar desde y para el movimiento en la prevención, la rehabilitación y el rendimiento.',
				'pdf_url'     => '',
			),
			'program'     => array(
				array(
					'title' => 'Módulo A — Evaluación dinámica funcional',
					'items' => array(
						'Evaluación dinámica funcional y ejercicio terapéutico.',
						'Razonamiento clínico desde y para el movimiento.',
						'12 estrategias para analizar cualquier acción y generar un plan de optimización.',
						'Presencial — 24 h.',
					),
				),
				array(
					'title' => 'Módulo B — Aprendizaje motor',
					'items' => array(
						'Optimización del aprendizaje motor en ejercicio terapéutico.',
						'Pedagogía de la motricidad y material de estudio.',
						'Presencial 24 h + Online 10 h.',
					),
				),
				array(
					'title' => 'Módulo C — Gestión funcional de las fuerzas',
					'items' => array(
						'Creación, distribución, transferencia y disipación de las fuerzas.',
						'Presencial — 24 h.',
					),
				),
				array(
					'title' => 'Módulo D — Patrones motores funcionales',
					'items' => array(
						'Capacidad funcional de movimiento + activación y equilibración de patrones.',
						'Presencial — 24 h.',
					),
				),
				array(
					'title' => 'Módulo E — Movimiento y dolor',
					'items' => array(
						'Incorporación del movimiento en alteraciones motrices y/o dolor.',
						'Equilibrio, estabilidad, codificación predictiva, consciencia corporal.',
						'Abordaje activo del dolor y técnicas conductuales.',
						'Presencial — 24 h.',
					),
				),
			),
		),
		'pedagogia-aprendizaje-motor' => array(
			'title'       => 'Pedagogía aplicada a la optimización del aprendizaje motor',
			'title_bold'  => 'y el ejercicio terapéutico',
			'professors'  => array( 'tomas-bonino' ),
			'syllabus'    => array(
				'title'       => 'Programa académico',
				'description' => '20% teórico | 80% práctico. Herramientas de educación basadas en la última evidencia para enseñar movimiento de forma efectiva.',
				'pdf_url'     => '',
			),
			'program'     => array(
				array(
					'title' => 'Fundamentos pedagógicos',
					'items' => array(
						'Qué evitar: espejo, instrucción directa, guiar con las manos, lenguaje nocebo.',
						'Establecer objetivos externos.',
						'Despertar al SNC respecto a lo motor.',
						'Los 5 pasos de la ejecución de cualquier acción.',
					),
				),
				array(
					'title' => 'Tipos de aprendizaje',
					'items' => array(
						'Aprendizaje implícito: foco externo, holístico, constraints-led, metáforas.',
						'Aprendizaje explícito: foco interno, autoobservación, imitación, video.',
						'Aprendizaje diferencial, autogestionado y cooperativo.',
					),
				),
				array(
					'title' => 'Aplicación clínica',
					'items' => array(
						'Respeto a patrones de movimiento y ley de transferibilidad.',
						'Coordinación interpersonal y motivación (O.P.T.I.M.A.L., T.A.R.G.E.T.).',
						'Exploración guiada con opciones y «comentar la jugada».',
					),
				),
			),
		),
		'evaluacion-dinamica-funcional' => array(
			'title'       => 'Evaluación dinámica funcional y reeducación del movimiento',
			'title_bold'  => '14 estrategias para analizar cualquier acción y generar un plan de optimización',
			'professors'  => array( 'tomas-bonino' ),
			'syllabus'    => array(
				'title'       => 'Programa',
				'description' => 'El movimiento desde el abordaje neuro-motor. Capacidades vs demandas.',
				'pdf_url'     => '',
			),
			'program'     => array(
				array(
					'title' => 'Evaluación funcional y dinámica',
					'items' => array(
						'Reglas para evaluar cualquier movimiento.',
						'14 estrategias para analizar y abordar cualquier alteración.',
						'Por pre-set, mirada, orientación, motores, planos, simetría dinámica.',
					),
				),
				array(
					'title' => 'Estrategias neuro-motoras',
					'items' => array(
						'Por dominancia o sustitución de patrón, velocidad, sensación.',
						'Por amortiguación, distribución, armadura/soporte elástico/mixta.',
						'Por secuenciación, disociación, timing y capacidades motoras.',
					),
				),
				array(
					'title' => 'Plan de reeducación',
					'items' => array(
						'Identificación de objetivos de mejora desde el movimiento.',
						'Plan de ejercicios orientado a reeducación motora.',
						'Visión neuro-motora: software (SN) antes que hardware (estructura).',
					),
				),
			),
		),
		'adultos-mayores' => array(
			'title'       => 'Programa activo de autonomía motriz y funcional en adultos mayores:',
			'title_bold'  => 'Longevidad en movimiento',
			'professors'  => array( 'noelia-martinez', 'tomas-bonino', 'matias-sampietro' ),
			'syllabus'    => array(
				'title'       => 'Panorama general',
				'description' => 'Comprender el envejecimiento va mucho más allá de lo biológico; implica factores sociales, económicos y de vida. Conoce los pilares de esta nueva realidad:',
				'pdf_url'     => '',
			),
			'program'     => array(
				array(
					'title' => '5 Ejes de Trabajo',
					'items' => array(
						'A) Entrenamiento Basal',
						'B) Manipulación de objetos',
						'C) Movimiento expresivo, rítmico y creativo',
						'D) Conciencia somática/Inteligencia biológica',
						'E) Comunidad, relación con el entorno y naturaleza',
					),
				),
				array(
					'title' => 'Contenido Online (8 hrs)',
					'items' => array(
						'Panorama actual de la adultez',
						'Valoración estructural VS conocer la red de la persona',
						'Sistema de Movimiento Humano',
						'Aprendizaje Motor',
						'Cambios en la estructura y función muscular asociados al envejecimiento',
						'Valoración del Adulto Mayor',
						'Presentación del programa +65',
					),
				),
				array(
					'title' => 'Contenido Presencial (20 hrs)',
					'items' => array(
						'Elementos prácticos para el armado de clases',
						'Entrenamiento basal',
						'Manipulación de objetos',
						'Movimiento expresivo, rítmico y creativo',
						'Conciencia somática e Inteligencia Biológica',
						'Transferencia del trabajo en sala al contexto natural y de «calle»',
						'Creación de Comunidad',
					),
				),
			),
		),
	);

	return apply_filters( 'esitef_presencial_catalog', $catalog );
}

/**
 * Imagen por defecto de formaciones presenciales.
 */
function esitef_presencial_thumb() {
	return 'https://esitef.com/online/wp-content/uploads/2022/12/esitef-inicio4-escuela-de-fisioterapia.webp';
}

/**
 * @param string $dates Fechas.
 * @param string $location Ciudad.
 * @param string $schedule Horario resumido.
 * @return array<int, array<string, string>>
 */
function esitef_presencial_hero_meta( $dates, $location, $schedule = '' ) {
	$meta = array(
		array(
			'icon'  => 'calendar',
			'value' => $dates,
		),
	);
	if ( $schedule ) {
		$meta[] = array(
			'icon'  => 'clock',
			'value' => $schedule,
		);
	}
	$meta[] = array(
		'icon'  => 'location',
		'value' => $location,
	);
	return $meta;
}

/**
 * @param string $alt Texto alternativo.
 * @return array<string, string>
 */
function esitef_presencial_hero_image( $alt ) {
	return array(
		'url' => esitef_presencial_thumb(),
		'alt' => $alt,
	);
}

/**
 * @return array<string, string>
 */
function esitef_presencial_stats_media() {
	return array(
		'url' => esitef_presencial_thumb(),
		'alt' => 'Formación presencial ESITEF',
	);
}

/**
 * @param string $key Stat key.
 * @param string $label Etiqueta.
 * @param string $value Valor HTML permitido.
 * @return array<string, string>
 */
function esitef_presencial_stat( $key, $label, $value ) {
	return array(
		'key'   => $key,
		'label' => $label,
		'value' => $value,
	);
}

/**
 * @param array<string, mixed> $args Datos de inscripción por email.
 * @return array<string, mixed>
 */
function esitef_presencial_inscription_email( $args ) {
	$subject = isset( $args['email_subject'] ) ? (string) $args['email_subject'] : '';
	$fields  = isset( $args['email_fields'] ) && is_array( $args['email_fields'] ) ? $args['email_fields'] : array();
	$body    = $subject ? "Asunto: {$subject}\n" . implode( "\n", $fields ) : implode( "\n", $fields );

	return array(
		'investment'     => isset( $args['investment'] ) ? (string) $args['investment'] : '',
		'discounts'      => isset( $args['discounts'] ) && is_array( $args['discounts'] ) ? $args['discounts'] : array(),
		'deposit'        => isset( $args['deposit'] ) ? (string) $args['deposit'] : '',
		'concept'        => isset( $args['concept'] ) ? (string) $args['concept'] : '',
		'accounts'       => isset( $args['accounts'] ) && is_array( $args['accounts'] ) ? $args['accounts'] : array(),
		'holder'         => isset( $args['holder'] ) ? (string) $args['holder'] : '',
		'contact_email'  => isset( $args['contact_email'] ) ? (string) $args['contact_email'] : 'info@esitef.com',
		'email_subject'  => $subject,
		'email_body'     => $body,
		'whatsapp_phone' => '',
		'whatsapp_text'  => $body,
	);
}

/**
 * Texto misión — Dolor y movimiento.
 */
function esitef_presencial_mission_dolor() {
	return 'Durante décadas, el abordaje del dolor ha estado dominado por un paradigma biomédico, centrado en la estructura, el daño tisular y la corrección de supuestos desequilibrios biomecánicos. Hoy, la ciencia nos muestra un escenario diferente: el dolor como experiencia compleja, influida por factores biológicos, psicológicos y sociales.<br><br>La formación en «Dolor y Movimiento. Nuevos paradigmas desde la evidencia» ofrece a fisioterapeutas herramientas clínicas actualizadas para comprender y abordar el dolor desde una perspectiva contemporánea, aplicando el modelo biopsicosocial y ecológico-enactivo con rigor científico y aplicabilidad clínica.';
}

/**
 * Texto misión — Movement Coaching.
 */
function esitef_presencial_mission_movement_coaching() {
	return 'Quinta edición de esta formación transformadora. Este es el camino para convertirte en <strong>Movement Coach</strong> (especialista en movimiento): trabajar desde y para el movimiento en la prevención, la rehabilitación y el rendimiento, sea cual sea tu entorno de trabajo.<br><br>La especialización combina evaluación dinámica funcional, pedagogía del aprendizaje motor, gestión de fuerzas, patrones motores y abordaje activo del dolor en cinco módulos presenciales.';
}

/**
 * Texto misión — Pedagogía aplicada.
 */
function esitef_presencial_mission_pedagogia() {
	return 'En esta formación aprenderemos cómo enseñar movimiento —en la aplicación del ejercicio terapéutico— para que lo enseñado sea realmente asimilado e integrado por el usuario, de forma autónoma y autosuficiente. Se trata de conocer y aplicar los conocimientos de la neurociencia de la pedagogía y de la mecánica neuro-motora para optimizar el aprendizaje en el ejercicio terapéutico.<br><br>Desafortunadamente no recibimos formación en esta área durante nuestras carreras, siendo de lo más importante, usemos el método terapéutico que usemos. Esta formación aporta el conocimiento esencial para obtener mejores resultados con pacientes, clientes o estudiantes.';
}

/**
 * Texto misión — Evaluación dinámica funcional.
 */
function esitef_presencial_mission_evaluacion_dinamica() {
	return 'La evaluación dinámica funcional nos da un abanico de enfoques desde el movimiento útiles para evaluar de manera activa y dinámica a nuestros pacientes y clientes. Nos aporta herramientas diagnósticas de exploración del movimiento propio y del otro, el análisis de los patrones adquiridos y la relación entre lesiones o patologías y las estrategias de movimiento consecuentes.<br><br>Todo el análisis y abordaje desde el movimiento se hace desde una visión neuro-motora, pensando primero en el software (sistema nervioso) y cómo influye en las alteraciones estructurales asociadas.';
}

/**
 * Texto misión — Gestión funcional de las fuerzas.
 */
function esitef_presencial_mission_gestion_fuerzas() {
	return 'La evaluación dinámica funcional nos da un abanico de enfoques desde el movimiento útiles para evaluar de manera activa y dinámica a nuestros pacientes y clientes. Nos aporta herramientas diagnósticas de exploración del movimiento propio y del otro, el análisis de los patrones adquiridos, la relación que se establece entre diversas lesiones o patologías y las estrategias de movimiento consecuentes.<br><br>Existe una necesidad urgente entre los profesionales de la terapia física y la educación física en incluir el análisis dinámico funcional, el diagnóstico del movimiento e implementar estrategias terapéuticas o de optimización que impliquen movimiento como herramientas para el trabajo clínico o de entrenamiento.<br><br>La lógica y simpleza del concepto de «GESTIÓN DE FUERZAS» ofrece una herramienta universal para valorar y trabajar cualquier movimiento, acción o función.';
}

/**
 * Instancias por página (slug WP).
 *
 * @return array<string, array<string, mixed>>
 */
function esitef_get_presenciales() {
	$thumb = 'https://esitef.com/online/wp-content/uploads/2022/12/esitef-inicio4-escuela-de-fisioterapia.webp';

	$presenciales = array(
		'gestion-funcional-fuerzas-medellin' => array(
			'page_title'  => 'Gestión funcional de las fuerzas — Medellín',
			'catalog_key' => 'gestion-fuerzas',
			'pais'        => 'colombia',
			'sede'        => 'medellin',
			'subtitle'    => 'Formación',
			'hero_meta'   => array(
				array(
					'icon'  => 'calendar',
					'value' => '19 y 20 SEPT 2026',
				),
				array(
					'icon'  => 'clock',
					'value' => 'Sáb y Dom 9–18 h',
				),
				array(
					'icon'  => 'location',
					'value' => 'Medellín (COL)',
				),
			),
			'hero_image'  => array(
				'url' => $thumb,
				'alt' => 'Gestión funcional de las fuerzas — Medellín',
			),
			'mission'     => esitef_presencial_mission_gestion_fuerzas(),
			'stats'       => array(
				array(
					'key'   => 'ubicacion',
					'label' => 'Ubicación',
					'value' => 'Medellín, Colombia<br>Sábado y Domingo de 9 a 18 h',
				),
				array(
					'key'   => 'dirigido',
					'label' => 'Dirigido a',
					'value' => 'Fisioterapeutas y estudiantes avanzados.',
				),
				array(
					'key'   => 'inversion',
					'label' => 'Inversión',
					'value' => '1.200.000 COP<br>10% otros módulos · 15% grupos 5 · 50% MOVICO<br><small>Las promociones no son acumulables</small>',
				),
				array(
					'key'   => 'cupo',
					'label' => 'Cupo',
					'value' => '30 alumnos',
				),
			),
			'stats_media' => array(
				'url' => $thumb,
				'alt' => 'Formación presencial ESITEF',
			),
			'inscription' => array(
				'investment'     => '1.200.000 COP',
				'discounts'      => array(
					'10% descuento para alumnos que ya hicieron los otros módulos',
					'15% descuento grupos de 5 personas',
					'50% descuento equipo MOVICO',
				),
				'deposit'        => '250.000 COP',
				'concept'        => 'Insc. Fuerzas MED',
				'accounts'       => array(
					array(
						'label'  => 'Bancolombia ahorros',
						'number' => '51185076567',
					),
					array(
						'label'  => 'Nequi',
						'number' => '3012149652',
					),
				),
				'holder'         => 'Juan Jose Patiño',
				'whatsapp_phone' => '573012149652',
				'whatsapp_text'  => "Asunto: Insc. Fuerzas MED\nNombre del Participante\nTeléfono (con prefijos locales) + e-mail\nUniversidad donde se graduó o donde estudia",
			),
		),
		'autonomia-motriz-adultos-mayores-cordoba' => array(
			'page_title'  => 'Programa activo de autonomía motriz y funcional en adultos mayores — Córdoba',
			'catalog_key' => 'adultos-mayores',
			'pais'        => 'argentina',
			'sede'        => 'cordoba',
			'subtitle'    => 'Formación Híbrida',
			'hero_meta'   => array(
				array(
					'icon'  => 'monitor',
					'value' => 'Parte Online: 17 y 31 OCT',
				),
				array(
					'icon'  => 'calendar',
					'value' => 'Parte Presencial: 27, 28 y 29 NOV',
				),
				array(
					'icon'  => 'location',
					'value' => 'Córdoba (ARG)',
				),
			),
			'hero_image'  => array(
				'url'        => 'https://esitef.com/online/wp-content/uploads/2026/07/Programa-activo-de-autonomia-motriz-y-funcional-en-adultos-mayores-cba-hero.jpg',
				'url_tablet' => 'https://esitef.com/online/wp-content/uploads/2026/07/Programa-activo-de-autonomia-motriz-y-funcional-en-adultos-mayores-cba-tablet.jpg',
				'url_mobile' => 'https://esitef.com/online/wp-content/uploads/2026/07/Programa-activo-de-autonomia-motriz-y-funcional-en-adultos-mayores-cba-mobile.jpg',
				'alt'        => 'Adultos mayores en movimiento en clase grupal',
			),
			'mission'     => 'La población mundial mayor de 60 años se duplicará para 2050. Vivimos más tiempo, pero surge una pregunta crítica: ¿Estamos viviendo mejor?<br><br>Hoy, nuestro sistema de salud enfrenta una realidad preocupante: una extensión de la vida (Lifespan) sin autonomía, capacidad funcional o comunidad que acompañe esta etapa.<br><br>Aquí nace el Programa Activo de Autonomía Motriz y Funcional. Este programa desarrollado por kinesiólogos, profesionales de las artes y la educación tiene una experiencia de más de 15 años. El Programa no sólo constituye un sistema de entrenamiento; es una posibilidad de ampliar tus servicios profesionales con actividades grupales, enmarcando prácticas en cooperación y aprendizaje compartido que genera la adherencia que esta población requiere.',
			'stats'       => array(
				array(
					'key'   => 'ubicacion',
					'label' => 'Ubicación',
					'value' => 'Astrid Training Center<br>9 de Julio 424, Córdoba',
				),
				array(
					'key'   => 'dirigido',
					'label' => 'Dirigido a',
					'value' => 'Fisioterapeutas y estudiantes de los últimos años.',
				),
				array(
					'key'   => 'inversion',
					'label' => 'Inversión',
					'value' => 'Reserva: $100,000 ARS<br>+ Día del curso: $350 USD',
				),
			),
			'stats_media' => array(
				'url' => 'https://esitef.com/online/wp-content/uploads/2026/06/Programa-activo-de-autonomia-motriz-y-funcional-en-adultos-mayores-3.jpg',
				'alt' => 'Entrenamiento grupal',
			),
			'inscription' => array(
				'investment' => 'Consultar con el organizador',
				'deposit'    => '$100,000 ARS',
				'concept'    => 'Inscripción programa adultos mayores',
				'accounts'   => array(),
				'holder'     => '',
				'whatsapp_phone' => '',
				'whatsapp_text'  => '',
			),
		),
	);

	require_once get_template_directory() . '/inc/formaciones-presenciales-instances.php';
	$presenciales = array_merge( $presenciales, esitef_get_presenciales_ciudades() );

	return apply_filters( 'esitef_presenciales', $presenciales );
}

/**
 * Redirecciones 301 de slugs legacy.
 *
 * @return array<string, string> old_slug => new_slug
 */
function esitef_get_presencial_redirects() {
	return apply_filters(
		'esitef_presencial_redirects',
		array(
			'gestion-funcional-fuerzas-medelli' => 'gestion-funcional-fuerzas-medellin',
			'presencial-ejemplo'                => 'autonomia-motriz-adultos-mayores-cordoba',
		)
	);
}

/**
 * @param string $slug Page slug.
 * @return array<string, mixed>|null
 */
function esitef_get_presencial_by_slug( $slug ) {
	$presenciales = esitef_get_presenciales();
	if ( ! isset( $presenciales[ $slug ] ) ) {
		return null;
	}

	$instance = $presenciales[ $slug ];
	$catalog  = esitef_get_presencial_catalog();
	$key      = isset( $instance['catalog_key'] ) ? (string) $instance['catalog_key'] : '';

	if ( '' === $key || ! isset( $catalog[ $key ] ) ) {
		return null;
	}

	$merged = array_merge( $catalog[ $key ], $instance );
	$merged['page_slug'] = $slug;

	$professor_keys = isset( $merged['professors'] ) && is_array( $merged['professors'] ) ? $merged['professors'] : array();
	$all_professors = esitef_get_presencial_professors();
	$professors     = array();

	foreach ( $professor_keys as $prof_key ) {
		if ( isset( $all_professors[ $prof_key ] ) ) {
			$professors[] = $all_professors[ $prof_key ];
		}
	}

	$merged['professors_resolved'] = $professors;

	if ( ! empty( $merged['inscription']['whatsapp_phone'] ) ) {
		$phone = preg_replace( '/\D+/', '', (string) $merged['inscription']['whatsapp_phone'] );
		$text  = isset( $merged['inscription']['whatsapp_text'] ) ? (string) $merged['inscription']['whatsapp_text'] : '';
		$merged['inscription']['whatsapp_url'] = 'https://wa.me/' . $phone . ( $text ? '?text=' . rawurlencode( $text ) : '' );
	}

	if ( ! empty( $merged['inscription']['contact_email'] ) ) {
		$email   = (string) $merged['inscription']['contact_email'];
		$subject = isset( $merged['inscription']['email_subject'] ) ? (string) $merged['inscription']['email_subject'] : '';
		$body    = isset( $merged['inscription']['email_body'] ) ? (string) $merged['inscription']['email_body'] : '';
		$merged['inscription']['email_url'] = 'mailto:' . $email . '?subject=' . rawurlencode( $subject ) . '&body=' . rawurlencode( $body );
	}

	return $merged;
}

/**
 * Páginas para sincronización en activation.php.
 *
 * @return array<string, array<string, string>>
 */
function esitef_get_presencial_pages_for_activation() {
	$pages = array();

	foreach ( esitef_get_presenciales() as $slug => $instance ) {
		$pages[ $slug ] = array(
			'title'    => isset( $instance['page_title'] ) ? (string) $instance['page_title'] : $slug,
			'template' => 'page-templates/page-presencial.php',
		);
	}

	return $pages;
}

/**
 * SVG icon for hero meta items.
 *
 * @param string $icon Icon key.
 */
function esitef_presencial_hero_icon_svg( $icon ) {
	switch ( $icon ) {
		case 'clock':
			return '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>';
		case 'monitor':
			return '<svg viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>';
		case 'location':
			return '<svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>';
		case 'calendar':
		default:
			return '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>';
	}
}

/**
 * SVG icon for stat cards.
 *
 * @param string $key Stat key.
 */
function esitef_presencial_stat_icon_svg( $key ) {
	switch ( $key ) {
		case 'dirigido':
			return '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>';
		case 'inversion':
			return '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>';
		case 'cupo':
			return '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>';
		case 'ubicacion':
		default:
			return '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>';
	}
}

/**
 * Redirect legacy presencial slugs.
 */
function esitef_presencial_legacy_redirect() {
	if ( is_admin() ) {
		return;
	}

	$redirects = esitef_get_presencial_redirects();
	$slug      = '';

	if ( is_page() ) {
		$queried = get_queried_object();
		if ( $queried instanceof WP_Post ) {
			$slug = $queried->post_name;
		}
	} elseif ( is_404() ) {
		global $wp;
		$slug = isset( $wp->request ) ? trim( (string) $wp->request, '/' ) : '';
	}

	if ( '' === $slug || ! isset( $redirects[ $slug ] ) ) {
		return;
	}

	$target = get_page_by_path( $redirects[ $slug ] );
	if ( $target ) {
		wp_safe_redirect( get_permalink( $target ), 301 );
		exit;
	}
}
add_action( 'template_redirect', 'esitef_presencial_legacy_redirect' );
