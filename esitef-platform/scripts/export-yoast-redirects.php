<?php
/**
 * Export Yoast SEO Premium redirects to JSON for Next.js.
 * Usage: php scripts/export-yoast-redirects.php
 * Output: apps/web/src/data/wp-redirects.json
 */

$out = dirname( __DIR__ ) . '/apps/web/src/data/wp-redirects.json';
$compose = dirname( __DIR__, 2 ) . '/docker-compose.yml';
$cwd     = dirname( __DIR__, 2 );

$user = getenv( 'WP_MYSQL_USER' ) ?: 'wordpress';
$pass = getenv( 'WP_MYSQL_PASSWORD' ) ?: 'wordpress';
$db   = getenv( 'WP_MYSQL_DATABASE' ) ?: 'wordpress';
$prefix = getenv( 'WP_TABLE_PREFIX' ) ?: 'wp_';
$table = $prefix . 'yoast_seo_redirects';

$check = shell_exec(
	'cd ' . escapeshellarg( $cwd ) . ' && docker compose -f ' . escapeshellarg( $compose ) .
	' exec -T db mariadb -u' . escapeshellarg( $user ) . ' -p' . escapeshellarg( $pass ) . ' ' .
	escapeshellarg( $db ) . ' -N -B -e ' . escapeshellarg( "SHOW TABLES LIKE '$table'" ) . ' 2>/dev/null'
);

if ( ! trim( (string) $check ) ) {
	file_put_contents( $out, "{}\n" );
	echo "No Yoast redirects table; wrote empty {}\n";
	exit( 0 );
}

$tsv = shell_exec(
	'cd ' . escapeshellarg( $cwd ) . ' && docker compose -f ' . escapeshellarg( $compose ) .
	' exec -T db mariadb -u' . escapeshellarg( $user ) . ' -p' . escapeshellarg( $pass ) . ' ' .
	escapeshellarg( $db ) . ' -N -B -e ' . escapeshellarg(
		"SELECT origin, url FROM $table WHERE type = '301' OR type IS NULL OR type = ''"
	) . ' 2>/dev/null'
);

$redirects = array();
foreach ( preg_split( '/\r?\n/', trim( (string) $tsv ) ) as $line ) {
	if ( $line === '' ) {
		continue;
	}
	$parts = explode( "\t", $line, 2 );
	if ( count( $parts ) < 2 ) {
		continue;
	}
	$from = trim( $parts[0], '/' );
	$to   = trim( $parts[1] );
	$to   = preg_replace( '#^https?://[^/]+#', '', $to );
	$to   = trim( $to, '/' );
	if ( $from && $to && $from !== $to ) {
		$redirects[ $from ] = $to;
	}
}

file_put_contents(
	$out,
	json_encode( $redirects, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES ) . "\n"
);

echo 'Exported ' . count( $redirects ) . " Yoast redirects to wp-redirects.json\n";
