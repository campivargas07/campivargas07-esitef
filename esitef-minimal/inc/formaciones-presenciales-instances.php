<?php
/**
 * Instancias presenciales por ciudad (slugs WP).
 *
 * @package esitef-minimal
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @return array<string, array<string, mixed>>
 */
function esitef_get_presenciales_ciudades() {
	$thumb = esitef_presencial_thumb();

	$email_fields = array(
		'Nombre del Participante',
		'Teléfono (con prefijos locales) + e-mail',
		'Universidad donde se graduó o donde estudia',
	);

	return array(
		'dolor-y-movimiento-arbucies' => array(
			'page_title'  => 'Dolor y movimiento — Arbúcies',
			'catalog_key' => 'dolor-movimiento',
			'pais'        => 'espana',
			'sede'        => 'arbucies',
			'subtitle'    => 'Formación',
			'hero_meta'   => esitef_presencial_hero_meta( '10, 11, 12 y 13 DIC 2026', 'Arbúcies (ESP)', 'Jue–Dom (ver detalle)' ),
			'hero_image'  => esitef_presencial_hero_image( 'Dolor y movimiento — Arbúcies' ),
			'mission'     => esitef_presencial_mission_dolor(),
			'stats'       => array(
				esitef_presencial_stat( 'ubicacion', 'Ubicación', 'Arbúcies, España<br>Jueves: 16–20:30 h · Vie–Sáb: 9–18:30 h · Dom: 9–14 h' ),
				esitef_presencial_stat( 'dirigido', 'Dirigido a', 'Fisioterapeutas, profesores de educación física, médicos y estudiantes de los últimos años.' ),
				esitef_presencial_stat( 'inversion', 'Inversión', '100 EUR inscripción + 325 EUR día del curso<br>Total: 425 EUR' ),
			),
			'stats_media' => esitef_presencial_stats_media(),
			'inscription' => esitef_presencial_inscription_email(
				array(
					'investment'     => '425 EUR total (100 EUR inscripción + 325 EUR día del curso)',
					'deposit'        => '100 EUR',
					'concept'        => 'Insc. Dolor Arbúcies',
					'email_subject'  => 'Insc. Dolor Arbúcies',
					'email_fields'   => $email_fields,
				)
			),
		),
		'dolor-y-movimiento-madrid' => array(
			'page_title'  => 'Dolor y movimiento — Madrid',
			'catalog_key' => 'dolor-movimiento',
			'pais'        => 'espana',
			'sede'        => 'madrid',
			'subtitle'    => 'Formación',
			'hero_meta'   => esitef_presencial_hero_meta( '2, 3 y 4 OCT 2026', 'Madrid (ESP)', 'Vie–Dom (ver detalle)' ),
			'hero_image'  => esitef_presencial_hero_image( 'Dolor y movimiento — Madrid' ),
			'mission'     => esitef_presencial_mission_dolor(),
			'stats'       => array(
				esitef_presencial_stat( 'ubicacion', 'Ubicación', 'Madrid, España' ),
				esitef_presencial_stat( 'dirigido', 'Dirigido a', 'Fisioterapeutas y estudiantes de los últimos años.' ),
				esitef_presencial_stat( 'inversion', 'Inversión', 'Consultar inversión e inscripción con el organizador' ),
			),
			'stats_media' => esitef_presencial_stats_media(),
			'inscription' => esitef_presencial_inscription_email(
				array(
					'investment'    => 'Consultar con el organizador',
					'deposit'       => '100 EUR',
					'concept'       => 'Insc. Dolor Madrid',
					'email_subject' => 'Insc. Dolor Madrid',
					'email_fields'  => $email_fields,
				)
			),
		),
		'especializacion-movement-coaching-madrid' => array(
			'page_title'  => 'Especialización Movement Coaching — Madrid',
			'catalog_key' => 'movement-coaching',
			'pais'        => 'espana',
			'sede'        => 'madrid',
			'subtitle'    => 'Especialización',
			'hero_meta'   => esitef_presencial_hero_meta( 'Inicio 27, 28 y 29 NOV 2026', 'Madrid (ESP)', '5 módulos presenciales' ),
			'hero_image'  => esitef_presencial_hero_image( 'Movement Coaching — Madrid' ),
			'mission'     => esitef_presencial_mission_movement_coaching(),
			'stats'       => array(
				esitef_presencial_stat( 'ubicacion', 'Ubicación', 'Madrid, España<br>Vie–Sáb 9–18:30 h · Dom 9–14 h' ),
				esitef_presencial_stat( 'dirigido', 'Dirigido a', 'Profesionales de salud y deporte que trabajan desde y para el movimiento.' ),
				esitef_presencial_stat( 'inversion', 'Inversión', 'Inscripción: 100 EUR (único pago)<br>+ 325 EUR por módulo' ),
			),
			'stats_media' => esitef_presencial_stats_media(),
			'inscription' => esitef_presencial_inscription_email(
				array(
					'investment'    => '100 EUR inscripción + 325 EUR por módulo',
					'deposit'       => '100 EUR',
					'concept'       => 'Insc. Movement Coaching MAD',
					'email_subject' => 'Insc. Movement Coaching MAD',
					'email_fields'  => $email_fields,
				)
			),
		),
		'dolor-y-movimiento-cordoba' => array(
			'page_title'  => 'Dolor y movimiento — Córdoba',
			'catalog_key' => 'dolor-movimiento',
			'pais'        => 'argentina',
			'sede'        => 'cordoba',
			'subtitle'    => 'Formación',
			'hero_meta'   => esitef_presencial_hero_meta( '7, 8 y 9 SEPT 2026', 'Córdoba (ARG)', 'Lun–Mié (ver detalle)' ),
			'hero_image'  => esitef_presencial_hero_image( 'Dolor y movimiento — Córdoba' ),
			'mission'     => esitef_presencial_mission_dolor(),
			'stats'       => array(
				esitef_presencial_stat( 'ubicacion', 'Ubicación', 'Astrid Training Center<br>9 de Julio 424, Córdoba<br>Lun–Mar 9–18 h · Mié 9–14 h' ),
				esitef_presencial_stat( 'dirigido', 'Dirigido a', 'Fisioterapeutas y estudiantes de los últimos años.' ),
				esitef_presencial_stat( 'inversion', 'Inversión', 'Reserva: $100.000 ARS<br>+ Día del curso: $350 USD' ),
			),
			'stats_media' => esitef_presencial_stats_media(),
			'inscription' => esitef_presencial_inscription_email(
				array(
					'investment'    => '$100.000 ARS reserva + $350 USD día del curso',
					'deposit'       => '$100.000 ARS',
					'concept'       => 'Insc. Dolor Córdoba',
					'email_subject' => 'Insc. Dolor Córdoba',
					'email_fields'  => $email_fields,
				)
			),
		),
		'pedagogia-aplicada-montevideo' => array(
			'page_title'  => 'Pedagogía aplicada — Montevideo',
			'catalog_key' => 'pedagogia-aprendizaje-motor',
			'pais'        => 'uruguay',
			'sede'        => 'montevideo',
			'subtitle'    => 'Formación',
			'hero_meta'   => esitef_presencial_hero_meta( '11, 12 y 13 SEPT 2026', 'Montevideo (URU)', 'Vie–Dom (ver detalle)' ),
			'hero_image'  => esitef_presencial_hero_image( 'Pedagogía aplicada — Montevideo' ),
			'mission'     => esitef_presencial_mission_pedagogia(),
			'stats'       => array(
				esitef_presencial_stat( 'ubicacion', 'Ubicación', 'Montevideo, Uruguay<br>Vie 15–20:30 h · Sáb 9–18:30 h · Dom 9–14 h' ),
				esitef_presencial_stat( 'dirigido', 'Dirigido a', 'Profesionales que enseñan movimiento y ejercicio terapéutico.' ),
				esitef_presencial_stat( 'inversion', 'Inversión', 'Pronto pago: 325 USD (hasta 1 AGO)<br>Regular: 375 USD · Reserva: 100 USD' ),
				esitef_presencial_stat( 'cupo', 'Cupo', 'Limitado' ),
			),
			'stats_media' => esitef_presencial_stats_media(),
			'inscription' => esitef_presencial_inscription_email(
				array(
					'investment'    => '325 USD pronto pago / 375 USD regular',
					'deposit'       => '100 USD',
					'concept'       => 'Insc. Pedagogía MVD',
					'email_subject' => 'Insc. Pedagogía MVD',
					'email_fields'  => $email_fields,
				)
			),
		),
		'dolor-y-movimiento-guadalajara' => array(
			'page_title'  => 'Dolor y movimiento — Guadalajara',
			'catalog_key' => 'dolor-movimiento',
			'pais'        => 'mexico',
			'sede'        => 'guadalajara',
			'subtitle'    => 'Formación',
			'hero_meta'   => esitef_presencial_hero_meta( '24, 25 y 26 JULIO 2026', 'Guadalajara (MEX)', 'Vie–Dom (ver detalle)' ),
			'hero_image'  => esitef_presencial_hero_image( 'Dolor y movimiento — Guadalajara' ),
			'mission'     => esitef_presencial_mission_dolor(),
			'stats'       => array(
				esitef_presencial_stat( 'ubicacion', 'Ubicación', 'Guadalajara, México' ),
				esitef_presencial_stat( 'dirigido', 'Dirigido a', 'Fisioterapeutas y estudiantes avanzados.' ),
				esitef_presencial_stat( 'inversion', 'Inversión', 'Consultar inversión con el organizador local' ),
			),
			'stats_media' => esitef_presencial_stats_media(),
			'inscription' => esitef_presencial_inscription_email(
				array(
					'investment'    => 'Consultar con el organizador',
					'deposit'       => '$1.000 MXN',
					'concept'       => 'Insc. Dolor GDL',
					'email_subject' => 'Insc. Dolor GDL',
					'email_fields'  => $email_fields,
				)
			),
		),
		'especializacion-movement-coaching-guadalajara' => array(
			'page_title'  => 'Especialización Movement Coaching — Guadalajara',
			'catalog_key' => 'movement-coaching',
			'pais'        => 'mexico',
			'sede'        => 'guadalajara',
			'subtitle'    => 'Especialización',
			'hero_meta'   => esitef_presencial_hero_meta( 'Inicio 20, 21 y 22 NOV 2026', 'Guadalajara (MEX)', '5 módulos presenciales' ),
			'hero_image'  => esitef_presencial_hero_image( 'Movement Coaching — Guadalajara' ),
			'mission'     => esitef_presencial_mission_movement_coaching(),
			'stats'       => array(
				esitef_presencial_stat( 'ubicacion', 'Ubicación', 'Guadalajara, México' ),
				esitef_presencial_stat( 'dirigido', 'Dirigido a', 'Profesionales de salud y deporte.' ),
				esitef_presencial_stat( 'inversion', 'Inversión', 'Consultar inversión e inscripción con el organizador' ),
			),
			'stats_media' => esitef_presencial_stats_media(),
			'inscription' => esitef_presencial_inscription_email(
				array(
					'investment'    => 'Consultar con el organizador',
					'deposit'       => 'Consultar reserva',
					'concept'       => 'Insc. Movement Coaching GDL',
					'email_subject' => 'Insc. Movement Coaching GDL',
					'email_fields'  => $email_fields,
				)
			),
		),
		'evaluacion-dinamica-funcional-gdl' => array(
			'page_title'  => 'Evaluación dinámica funcional — Guadalajara',
			'catalog_key' => 'evaluacion-dinamica-funcional',
			'pais'        => 'mexico',
			'sede'        => 'guadalajara',
			'subtitle'    => 'Formación',
			'hero_meta'   => esitef_presencial_hero_meta( '20, 21 y 22 NOV 2026', 'Guadalajara (MEX)', 'Vie–Dom (ver detalle)' ),
			'hero_image'  => esitef_presencial_hero_image( 'Evaluación dinámica funcional — Guadalajara' ),
			'mission'     => esitef_presencial_mission_evaluacion_dinamica(),
			'stats'       => array(
				esitef_presencial_stat( 'ubicacion', 'Ubicación', 'IUVARE, P.º de Los Castaños 2551, Zapopan, Jal.<br>Vie–Sáb 9–18 h · Dom 9–14 h' ),
				esitef_presencial_stat( 'dirigido', 'Dirigido a', 'Fisioterapeutas y profesionales del movimiento.' ),
				esitef_presencial_stat( 'inversion', 'Inversión', '$1.000 MXN inscripción + $4.900 MXN día del curso<br>Total: $5.900 MXN' ),
				esitef_presencial_stat( 'cupo', 'Cupo', '30 alumnos' ),
			),
			'stats_media' => esitef_presencial_stats_media(),
			'inscription' => esitef_presencial_inscription_email(
				array(
					'investment'    => '$5.900 MXN total',
					'deposit'       => '$1.000 MXN',
					'concept'       => 'Insc. Eval. Dinámica GDL',
					'email_subject' => 'Insc. Eval. Dinámica GDL',
					'email_fields'  => $email_fields,
				)
			),
		),
		'dolor-y-movimiento-toluca' => array(
			'page_title'  => 'Dolor y movimiento — Toluca',
			'catalog_key' => 'dolor-movimiento',
			'pais'        => 'mexico',
			'sede'        => 'toluca',
			'subtitle'    => 'Formación',
			'hero_meta'   => esitef_presencial_hero_meta( '17, 18 y 19 JULIO 2026', 'Toluca (MEX)', 'Vie–Dom (ver detalle)' ),
			'hero_image'  => esitef_presencial_hero_image( 'Dolor y movimiento — Toluca' ),
			'mission'     => esitef_presencial_mission_dolor(),
			'stats'       => array(
				esitef_presencial_stat( 'ubicacion', 'Ubicación', 'Toluca, México' ),
				esitef_presencial_stat( 'dirigido', 'Dirigido a', 'Fisioterapeutas y estudiantes avanzados.' ),
				esitef_presencial_stat( 'inversion', 'Inversión', 'Consultar inversión con el organizador local' ),
			),
			'stats_media' => esitef_presencial_stats_media(),
			'inscription' => esitef_presencial_inscription_email(
				array(
					'investment'    => 'Consultar con el organizador',
					'deposit'       => '$1.000 MXN',
					'concept'       => 'Insc. Dolor Toluca',
					'email_subject' => 'Insc. Dolor Toluca',
					'email_fields'  => $email_fields,
				)
			),
		),
		'formacion-en-dolor-y-movimiento-aguascalientes' => array(
			'page_title'  => 'Dolor y movimiento — Aguascalientes',
			'catalog_key' => 'dolor-movimiento',
			'pais'        => 'mexico',
			'sede'        => 'aguascalientes',
			'subtitle'    => 'Formación',
			'hero_meta'   => esitef_presencial_hero_meta( '16, 17 y 18 NOV 2026', 'Aguascalientes (MEX)', 'Vie–Dom (ver detalle)' ),
			'hero_image'  => esitef_presencial_hero_image( 'Dolor y movimiento — Aguascalientes' ),
			'mission'     => esitef_presencial_mission_dolor(),
			'stats'       => array(
				esitef_presencial_stat( 'ubicacion', 'Ubicación', 'Aguascalientes, México' ),
				esitef_presencial_stat( 'dirigido', 'Dirigido a', 'Fisioterapeutas y estudiantes avanzados.' ),
				esitef_presencial_stat( 'inversion', 'Inversión', 'Consultar inversión con el organizador local' ),
			),
			'stats_media' => esitef_presencial_stats_media(),
			'inscription' => esitef_presencial_inscription_email(
				array(
					'investment'    => 'Consultar con el organizador',
					'deposit'       => '$1.000 MXN',
					'concept'       => 'Insc. Dolor AGS',
					'email_subject' => 'Insc. Dolor AGS',
					'email_fields'  => $email_fields,
				)
			),
		),
		'especializacion-movement-coaching-cdmx' => array(
			'page_title'  => 'Especialización Movement Coaching — CDMX',
			'catalog_key' => 'movement-coaching',
			'pais'        => 'mexico',
			'sede'        => 'cdmx',
			'subtitle'    => 'Especialización',
			'hero_meta'   => esitef_presencial_hero_meta( 'Inicio 2027', 'CDMX (MEX)', '5 módulos presenciales' ),
			'hero_image'  => esitef_presencial_hero_image( 'Movement Coaching — CDMX' ),
			'mission'     => esitef_presencial_mission_movement_coaching(),
			'stats'       => array(
				esitef_presencial_stat( 'ubicacion', 'Ubicación', 'Ciudad de México, México' ),
				esitef_presencial_stat( 'dirigido', 'Dirigido a', 'Profesionales de salud y deporte.' ),
				esitef_presencial_stat( 'inversion', 'Inversión', 'Consultar inversión e inscripción con el organizador' ),
			),
			'stats_media' => esitef_presencial_stats_media(),
			'inscription' => esitef_presencial_inscription_email(
				array(
					'investment'    => 'Consultar con el organizador',
					'deposit'       => 'Consultar reserva',
					'concept'       => 'Insc. Movement Coaching CDMX',
					'email_subject' => 'Insc. Movement Coaching CDMX',
					'email_fields'  => $email_fields,
				)
			),
		),
		'gestion-funcional-fuerzas-arequipa' => array(
			'page_title'  => 'Gestión funcional de las fuerzas — Arequipa',
			'catalog_key' => 'gestion-fuerzas',
			'pais'        => 'peru',
			'sede'        => 'arequipa',
			'subtitle'    => 'Formación',
			'hero_meta'   => esitef_presencial_hero_meta( 'Aplazado Abril 2027', 'Arequipa (PER)', 'Fechas por confirmar' ),
			'hero_image'  => esitef_presencial_hero_image( 'Gestión funcional de las fuerzas — Arequipa' ),
			'mission'     => esitef_presencial_mission_gestion_fuerzas(),
			'stats'       => array(
				esitef_presencial_stat( 'ubicacion', 'Ubicación', 'Arequipa, Perú' ),
				esitef_presencial_stat( 'dirigido', 'Dirigido a', 'Fisioterapeutas y estudiantes avanzados.' ),
				esitef_presencial_stat( 'inversion', 'Inversión', 'Consultar inversión con el organizador' ),
			),
			'stats_media' => esitef_presencial_stats_media(),
			'inscription' => esitef_presencial_inscription_email(
				array(
					'investment'    => 'Consultar con el organizador',
					'deposit'       => 'Consultar reserva',
					'concept'       => 'Insc. Fuerzas Arequipa',
					'email_subject' => 'Insc. Fuerzas Arequipa',
					'email_fields'  => $email_fields,
				)
			),
		),
		'aprendizaje-motor-lima' => array(
			'page_title'  => 'Pedagogía aplicada — Lima',
			'catalog_key' => 'pedagogia-aprendizaje-motor',
			'pais'        => 'peru',
			'sede'        => 'lima',
			'subtitle'    => 'Formación',
			'hero_meta'   => esitef_presencial_hero_meta( 'Aplazado Abril 2027', 'Lima (PER)', 'Fechas por confirmar' ),
			'hero_image'  => esitef_presencial_hero_image( 'Pedagogía aplicada — Lima' ),
			'mission'     => esitef_presencial_mission_pedagogia(),
			'stats'       => array(
				esitef_presencial_stat( 'ubicacion', 'Ubicación', 'Lima, Perú' ),
				esitef_presencial_stat( 'dirigido', 'Dirigido a', 'Profesionales que enseñan movimiento y ejercicio terapéutico.' ),
				esitef_presencial_stat( 'inversion', 'Inversión', 'Consultar inversión con el organizador' ),
			),
			'stats_media' => esitef_presencial_stats_media(),
			'inscription' => esitef_presencial_inscription_email(
				array(
					'investment'    => 'Consultar con el organizador',
					'deposit'       => 'Consultar reserva',
					'concept'       => 'Insc. Pedagogía Lima',
					'email_subject' => 'Insc. Pedagogía Lima',
					'email_fields'  => $email_fields,
				)
			),
		),
	);
}
