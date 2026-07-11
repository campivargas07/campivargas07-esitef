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
		'img' => 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=450&fit=crop&q=80',
		'href' => 'https://equipophysical.com/formaciones-2/experto-en-rehabilitacion-readaptacion-y-reentrenamiento/',
		'external' => true,
	],
	[
		'title' => 'MasterClass',
		'alt' => 'MasterClass',
		'img' => 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=450&fit=crop&q=80',
		'href' => '/formaciones/masterclass',
		'external' => false,
	],
	[
		'title' => 'Tele-Rehabilitación 22 casos clínicos',
		'alt' => 'Tele-Rehabilitación 22 casos clínicos',
		'img' => 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=450&fit=crop&q=80',
		'href' => '/cursos/tele-rehab',
		'external' => false,
	],
	[
		'title' => 'Talleres prácticos Online',
		'alt' => 'Talleres prácticos Online',
		'img' => 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=450&fit=crop&q=80',
		'href' => '/formaciones/talleres',
		'external' => false,
	],
	[
		'title' => 'Club de actualización',
		'alt' => 'Club de actualización',
		'img' => 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=450&fit=crop&q=80',
		'href' => '/formaciones/club-de-actualizacion',
		'external' => false,
	],
	[
		'title' => 'Capacidad funcional de movimiento',
		'alt' => 'Capacidad funcional de movimiento',
		'img' => 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=450&fit=crop&q=80',
		'href' => '/formaciones/capacidad-funcional-movimiento',
		'external' => false,
	],
	[
		'title' => 'Formación online en comunicación efectiva',
		'alt' => 'Formación online en comunicación efectiva',
		'img' => 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=450&fit=crop&q=80',
		'href' => '/formaciones/comunicat',
		'external' => false,
	],
	[
		'title' => 'Introducción al mundo del dolor',
		'alt' => 'Introducción al mundo del dolor',
		'img' => 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=450&fit=crop&q=80',
		'href' => '/formaciones/int-curso-dolor',
		'external' => false,
	],
	[
		'title' => 'CRECER en movimiento',
		'alt' => 'CRECER en movimiento',
		'img' => 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=450&fit=crop&q=80',
		'href' => '/formaciones/crecerenmovimiento',
		'external' => false,
	],
	[
		'title' => 'Biomecánica del Movimiento Principios Básicos y Aplicaciones Prácticas.',
		'alt' => 'Biomecánica del Movimiento',
		'img' => 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=450&fit=crop&q=80',
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
