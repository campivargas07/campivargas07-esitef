<?php
/**
 * Formación hub — orquestador de layout.
 *
 * @package esitef-minimal
 *
 * @var array<string, mixed> $args
 */

$hub  = isset( $args['hub'] ) ? $args['hub'] : array();
$slug = isset( $args['slug'] ) ? (string) $args['slug'] : '';
if ( empty( $hub ) ) {
	return;
}

$layout = isset( $hub['layout'] ) ? (string) $hub['layout'] : 'grid';

get_template_part( 'template-parts/pages/formacion-hub/breadcrumb', null, array( 'hub' => $hub ) );

if ( 'grid' === $layout ) {
	$grid_header = isset( $hub['grid_header'] ) ? (string) $hub['grid_header'] : 'banner';
	if ( 'minimal' === $grid_header ) {
		get_template_part( 'template-parts/pages/formacion-hub/grid-header-minimal', null, array( 'hub' => $hub, 'slug' => $slug ) );
	} else {
		get_template_part( 'template-parts/pages/formacion-hub/grid-hero', null, array( 'hub' => $hub, 'slug' => $slug ) );
	}
	get_template_part( 'template-parts/pages/formacion-hub/grid', null, array( 'hub' => $hub, 'slug' => $slug ) );
	if ( ! empty( $hub['faqs'] ) ) {
		get_template_part(
			'template-parts/pages/formacion-hub/faq',
			null,
			array(
				'faqs'    => $hub['faqs'],
				'columns' => isset( $hub['faq_columns'] ) ? (int) $hub['faq_columns'] : 1,
				'slug'    => $slug,
			)
		);
	}
} else {
	get_template_part( 'template-parts/pages/formacion-hub/landing-hero', null, array( 'hub' => $hub, 'slug' => $slug ) );
	get_template_part( 'template-parts/pages/formacion-hub/landing-sections', null, array( 'hub' => $hub ) );
	if ( ! empty( $hub['pricing'] ) ) {
		get_template_part( 'template-parts/pages/formacion-hub/pricing', null, array( 'hub' => $hub ) );
	}
	if ( ! empty( $hub['planning'] ) ) {
		get_template_part( 'template-parts/pages/formacion-hub/planning', null, array( 'planning' => $hub['planning'] ) );
	}
	if ( ! empty( $hub['curriculum'] ) ) {
		get_template_part( 'template-parts/pages/formacion-hub/curriculum', null, array( 'curriculum' => $hub['curriculum'] ) );
	}
	if ( ! empty( $hub['faqs'] ) ) {
		get_template_part(
			'template-parts/pages/formacion-hub/faq',
			null,
			array(
				'faqs'    => $hub['faqs'],
				'columns' => isset( $hub['faq_columns'] ) ? (int) $hub['faq_columns'] : 1,
				'slug'    => $slug,
			)
		);
	}
	if ( ! empty( $hub['sticky_cta'] ) && ! empty( $hub['cta'] ) ) {
		get_template_part( 'template-parts/pages/formacion-hub/sticky-cta', null, array( 'hub' => $hub ) );
	}
}
