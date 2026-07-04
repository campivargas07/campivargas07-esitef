<?php
/**
 * Disable Elementor Header & Footer Builder — theme provides header/footer.
 *
 * @package esitef-minimal
 */

add_filter( 'hfe_header_enabled', '__return_false' );
add_filter( 'hfe_footer_enabled', '__return_false' );
add_filter( 'hfe_render_header', '__return_false' );
add_filter( 'hfe_render_footer', '__return_false' );
add_filter( 'ehf_header_enabled', '__return_false' );
add_filter( 'ehf_footer_enabled', '__return_false' );

/**
 * Elementor Pro Theme Builder locations — prefer theme templates.
 */
function esitef_disable_elementor_locations( $need_override, $location ) {
	if ( in_array( $location, array( 'header', 'footer' ), true ) ) {
		return false;
	}
	if ( 'single' === $location && is_singular( esitef_course_post_type() ) ) {
		return false;
	}
	return $need_override;
}
add_filter( 'elementor/theme/need_override_location', 'esitef_disable_elementor_locations', 10, 2 );

/**
 * Tutor course post type slug.
 */
function esitef_course_post_type() {
	return function_exists( 'tutor' ) ? tutor()->course_post_type : 'courses';
}

/**
 * Single courses: theme landing (tutor/single-course.php), not Elementor/Tutor LMS builder.
 */
function esitef_course_not_built_with_elementor( $is_built, $post_id ) {
	if ( esitef_course_post_type() === get_post_type( $post_id ) ) {
		return false;
	}
	return $is_built;
}
add_filter( 'elementor/db/is_built_with_elementor', 'esitef_course_not_built_with_elementor', 10, 2 );

/**
 * Force theme course template over Elementor full-width / Tutor Elementor widgets.
 */
function esitef_force_course_landing_template( $template ) {
	if ( ! is_singular( esitef_course_post_type() ) ) {
		return $template;
	}
	$landing = get_template_directory() . '/tutor/single-course.php';
	if ( is_readable( $landing ) ) {
		return $landing;
	}
	return $template;
}
add_filter( 'template_include', 'esitef_force_course_landing_template', 999 );
