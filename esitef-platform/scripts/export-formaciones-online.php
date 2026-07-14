#!/usr/bin/env php
<?php
/**
 * Export formaciones index + hub catalog to JSON for Next.js.
 * Usage: npm run export:formaciones
 */

declare(strict_types=1);

define('ABSPATH', true);

$root = dirname(__DIR__);
$outDir = $root . '/apps/web/src/data';
$themeInc = dirname($root) . '/esitef-minimal/inc/formaciones-online-hubs.php';

if (!is_file($themeInc)) {
	fwrite(STDERR, "Missing theme file: {$themeInc}\n");
	exit(1);
}

function __($s) { return $s; }
function _n($single, $plural, $number) { return (int) $number === 1 ? $single : $plural; }
function home_url($path = '') { return 'https://esitef.com/online' . $path; }
function get_page_by_path() { return null; }
function get_permalink() { return ''; }
function apply_filters($hook, $value) { return $value; }

require $themeInc;

function resolve_item_href(array $item): string {
	if (!empty($item['url'])) {
		$url = (string) $item['url'];
		if (str_starts_with($url, 'https://esitef.com/online/')) {
			$path = parse_url($url, PHP_URL_PATH) ?: '';
			$path = trim($path, '/');
			if (str_starts_with($path, 'courses/')) {
				return '/cursos/' . substr($path, strlen('courses/'));
			}
			$hubSlugs = array_keys(esitef_get_formacion_hubs());
			$first = explode('/', $path)[0] ?? '';
			if (in_array($first, $hubSlugs, true)) {
				return '/formaciones/' . $first;
			}
			return '/cursos/' . $path;
		}
		return $url;
	}
	if (!empty($item['course_slug'])) {
		return '/cursos/' . sanitize_slug((string) $item['course_slug']);
	}
	return '#';
}

function sanitize_slug(string $slug): string {
	return preg_replace('/[^a-z0-9-]/', '', strtolower($slug)) ?: $slug;
}

function normalize_hub(string $slug, array $hub): array {
	$hub['slug'] = $slug;
	$hub['theme'] = esitef_get_hub_theme_slug($hub, $slug);

	if (!empty($hub['items']) && is_array($hub['items'])) {
		foreach ($hub['items'] as $i => $item) {
			if (!is_array($item)) {
				continue;
			}
			$hub['items'][$i]['href'] = resolve_item_href($item);
		}
	}

	if (!empty($hub['cta']) && is_array($hub['cta'])) {
		if (!empty($hub['cta']['course_slug'])) {
			$hub['cta']['href'] = '/cursos/' . $hub['cta']['course_slug'];
		} elseif (!empty($hub['pricing']['course_slug'])) {
			$hub['cta']['href'] = '/cursos/' . $hub['pricing']['course_slug'];
		} else {
			$hub['cta']['href'] = '#';
		}
	}

	if (!empty($hub['pricing']) && is_array($hub['pricing'])) {
		if (!empty($hub['pricing']['course_slug'])) {
			$hub['pricing']['href'] = '/cursos/' . $hub['pricing']['course_slug'];
		}
		if (!empty($hub['pricing']['plans']) && is_array($hub['pricing']['plans'])) {
			foreach ($hub['pricing']['plans'] as $i => $plan) {
				if (!empty($plan['course_slug'])) {
					$hub['pricing']['plans'][$i]['href'] = '/cursos/' . $plan['course_slug'];
				}
			}
		}
	}

	if (!empty($hub['hero']['video'])) {
		$hub['hero']['video_embed'] = esitef_hub_vimeo_embed_url($hub['hero']['video']);
	}
	if (!empty($hub['content_grid']['video'])) {
		$hub['content_grid']['video_embed'] = esitef_hub_vimeo_embed_url($hub['content_grid']['video']);
	}

	return $hub;
}

$index = [
	[
		'title' => 'Experto en Rehabilitación, Readaptación y Reentrenamiento',
		'alt' => 'Experto en Rehabilitación, Readaptación y Reentrenamiento',
		'img' => 'https://esitef.com/online/wp-content/uploads/2026/07/Experto-en-Rehabilitacion-Readaptacion-y-Reentrenamiento-2026.webp',
		'href' => 'https://equipophysical.com/formaciones-2/experto-en-rehabilitacion-readaptacion-y-reentrenamiento/',
		'external' => true,
	],
	[
		'title' => 'MasterClass',
		'alt' => 'MasterClass',
		'img' => 'https://esitef.com/online/wp-content/uploads/2026/07/Masterclass.webp',
		'href' => '/formaciones/masterclass',
		'external' => false,
	],
	[
		'title' => 'Tele-Rehabilitación 22 casos clínicos',
		'alt' => 'Tele-Rehabilitación 22 casos clínicos',
		'img' => 'https://esitef.com/online/wp-content/uploads/2026/07/Tele-Rehabilitacion.webp',
		'href' => '/cursos/tele-rehab',
		'external' => false,
	],
	[
		'title' => 'Talleres prácticos Online',
		'alt' => 'Talleres prácticos Online',
		'img' => 'https://esitef.com/online/wp-content/uploads/2026/07/talleres-practicos-online-.webp',
		'href' => '/formaciones/talleres',
		'external' => false,
	],
	[
		'title' => 'Club de actualización',
		'alt' => 'Club de actualización',
		'img' => 'https://esitef.com/online/wp-content/uploads/2026/07/club-de-actualizacion.webp',
		'href' => '/formaciones/club-de-actualizacion',
		'external' => false,
	],
	[
		'title' => 'Capacidad funcional de movimiento',
		'alt' => 'Capacidad funcional de movimiento',
		'img' => 'https://esitef.com/online/wp-content/uploads/2026/07/progresiones-de-ejercicio-terapeutico.webp',
		'href' => '/formaciones/capacidad-funcional-movimiento',
		'external' => false,
	],
	[
		'title' => 'Formación online en comunicación efectiva',
		'alt' => 'Formación online en comunicación efectiva',
		'img' => 'https://esitef.com/online/wp-content/uploads/2026/07/Formacion-online-en-comunicacion-efectiva.webp',
		'href' => '/formaciones/comunicat',
		'external' => false,
	],
	[
		'title' => 'Introducción al mundo del dolor',
		'alt' => 'Introducción al mundo del dolor',
		'img' => 'https://esitef.com/online/wp-content/uploads/2026/07/mundo-dolor.webp',
		'href' => '/formaciones/int-curso-dolor',
		'external' => false,
	],
	[
		'title' => 'CRECER en movimiento',
		'alt' => 'CRECER en movimiento',
		'img' => 'https://esitef.com/online/wp-content/uploads/2026/07/crecer-en-movimiento.webp',
		'href' => '/formaciones/crecerenmovimiento',
		'external' => false,
	],
	[
		'title' => 'Biomecánica del Movimiento Principios Básicos y Aplicaciones Prácticas.',
		'alt' => 'Biomecánica del Movimiento',
		'img' => 'https://esitef.com/online/wp-content/uploads/2026/07/Biomecanica-del-Movimiento.webp',
		'href' => '/cursos/biomecanica-del-movimiento',
		'external' => false,
	],
];

$hubs = [];
foreach (esitef_get_formacion_hubs() as $slug => $hub) {
	$hubs[$slug] = normalize_hub($slug, $hub);
}

if (!is_dir($outDir)) {
	mkdir($outDir, 0755, true);
}

file_put_contents(
	$outDir . '/formaciones-index.json',
	json_encode($index, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n"
);
file_put_contents(
	$outDir . '/formaciones-hubs.json',
	json_encode($hubs, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n"
);

echo 'Exported ' . count($index) . ' index cards and ' . count($hubs) . " hubs\n";
