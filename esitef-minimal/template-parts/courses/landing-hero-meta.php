<?php
/**
 * Landing hero meta — course stats list.
 *
 * @package esitef-minimal
 *
 * @var array $args {
 *     @type string $context desktop|mobile placement.
 * }
 */

$meta_context = get_query_var( 'esitef_landing_meta_context', '' );
if ( ! $meta_context && ! empty( $args['context'] ) ) {
	$meta_context = $args['context'];
}
if ( ! $meta_context ) {
	$meta_context = 'desktop';
}
$meta_context = sanitize_html_class( $meta_context );

$course_id      = esitef_landing_course_id();
$enrolled       = esitef_landing_get_enrolled_count( $course_id );
$duration       = esitef_landing_format_duration( $course_id );
$enrolled_label = sprintf(
	/* translators: %d: student count */
	_n( '%d inscrito', '%d inscritos', $enrolled, 'esitef-minimal' ),
	$enrolled
);
$duration_label = $duration ? $duration : __( 'Por definir', 'esitef-minimal' );

$items = array(
	array(
		'label' => __( 'Inscritos', 'esitef-minimal' ),
		'value' => $enrolled_label,
		'icon'  => 'users',
	),
	array(
		'label' => __( 'Duración', 'esitef-minimal' ),
		'value' => $duration_label,
		'icon'  => 'clock',
	),
	array(
		'label' => __( 'Acceso de por vida', 'esitef-minimal' ),
		'value' => '',
		'icon'  => 'lifetime',
	),
	array(
		'label' => __( 'Acceso en dispositivos móviles y TV', 'esitef-minimal' ),
		'value' => '',
		'icon'  => 'devices',
	),
);
?>
<div class="landing-hero__meta-panel landing-hero__meta-panel--<?php echo esc_attr( $meta_context ); ?>">
	<ul class="landing-hero__meta" aria-label="<? esc_attr_e( 'Datos del curso', 'esitef-minimal' ); ?>">
		<?php foreach ( $items as $item ) : ?>
			<li class="landing-hero__meta-item">
				<span class="landing-hero__meta-icon" aria-hidden="true">
					<?php
					switch ( $item['icon'] ) {
						case 'users':
							?>
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
							<?php
							break;
						case 'clock':
							?>
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
							<?php
							break;
						case 'lifetime':
							?>
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 6v6l4 2"/></svg>
							<?php
							break;
						default:
							?>
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
							<?php
							break;
					}
					?>
				</span>
				<span class="landing-hero__meta-text">
					<strong class="landing-hero__meta-label"><?php echo esc_html( $item['label'] ); ?></strong>
					<?php if ( $item['value'] ) : ?>
						<span class="landing-hero__meta-value"><?php echo esc_html( $item['value'] ); ?></span>
					<?php endif; ?>
				</span>
			</li>
		<?php endforeach; ?>
	</ul>
</div>
