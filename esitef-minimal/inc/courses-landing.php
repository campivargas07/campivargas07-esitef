<?php
/**
 * Helpers for landing-online single course templates.
 *
 * @package esitef-minimal
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Current course ID.
 */
function esitef_landing_course_id() {
	return (int) get_the_ID();
}

/**
 * Whether course has intro video (YouTube, etc.) for landing media.
 */
function esitef_landing_has_course_video( $course_id = 0 ) {
	if ( ! function_exists( 'tutor_utils' ) ) {
		return false;
	}
	$course_id = $course_id ? $course_id : esitef_landing_course_id();
	$video     = tutor_utils()->get_video( $course_id );
	if ( ! is_array( $video ) || empty( $video['source'] ) || '-1' === $video['source'] ) {
		return false;
	}
	return ! empty( $video['source_video_id'] )
		|| ! empty( $video['source_youtube'] )
		|| ! empty( $video['source_vimeo'] )
		|| ! empty( $video['source_external_url'] )
		|| ! empty( $video['source_embedded'] );
}

/**
 * Demo YouTube meta for local seeding.
 *
 * @return array<string, mixed>
 */
function esitef_landing_demo_youtube_video_meta() {
	return array(
		'source'         => 'youtube',
		'source_youtube' => 'https://www.youtube.com/watch?v=LXb3EKWsInQ',
		'runtime'        => array(
			'hours'   => '0',
			'minutes' => '4',
			'seconds' => '30',
		),
	);
}

/**
 * Course rating object or null.
 */
function esitef_landing_get_rating( $course_id = 0 ) {
	if ( ! function_exists( 'tutor_utils' ) ) {
		return null;
	}
	$course_id = $course_id ? $course_id : esitef_landing_course_id();
	return tutor_utils()->get_course_rating( $course_id );
}

/**
 * Instructors for a course.
 *
 * @return array
 */
function esitef_landing_get_instructors( $course_id = 0 ) {
	if ( ! function_exists( 'tutor_utils' ) ) {
		return array();
	}
	$course_id = $course_id ? $course_id : esitef_landing_course_id();
	$instructors = tutor_utils()->get_instructors_by_course( $course_id );
	return is_array( $instructors ) ? $instructors : array();
}

/**
 * Primary instructor (first).
 */
function esitef_landing_get_primary_instructor( $course_id = 0 ) {
	$instructors = esitef_landing_get_instructors( $course_id );
	return ! empty( $instructors ) ? $instructors[0] : null;
}

/**
 * Human-readable course duration.
 */
function esitef_landing_format_duration( $course_id = 0 ) {
	$course_id = $course_id ? $course_id : esitef_landing_course_id();

	if ( function_exists( 'tutor_utils' ) ) {
		$duration = get_post_meta( $course_id, '_course_duration', true );
		if ( is_array( $duration ) ) {
			$hours   = isset( $duration['hours'] ) ? (int) $duration['hours'] : 0;
			$minutes = isset( $duration['minutes'] ) ? (int) $duration['minutes'] : 0;
			if ( $hours || $minutes ) {
				$parts = array();
				if ( $hours ) {
					$parts[] = sprintf(
						/* translators: %d: hours */
						_n( '%d hora', '%d horas', $hours, 'esitef-minimal' ),
						$hours
					);
				}
				if ( $minutes ) {
					$parts[] = sprintf(
						/* translators: %d: minutes */
						_n( '%d minuto', '%d minutos', $minutes, 'esitef-minimal' ),
						$minutes
					);
				}
				return implode( ' ', $parts );
			}
		}

		$content_time = tutor_utils()->course_content_time( $course_id );
		if ( $content_time ) {
			return $content_time;
		}
	}

	return '';
}

/**
 * Enrolled students count.
 */
function esitef_landing_get_enrolled_count( $course_id = 0 ) {
	if ( ! function_exists( 'tutor_utils' ) ) {
		return 0;
	}
	$course_id = $course_id ? $course_id : esitef_landing_course_id();

	if ( method_exists( tutor_utils(), 'count_enrolled_users_by_course' ) ) {
		return (int) tutor_utils()->count_enrolled_users_by_course( $course_id );
	}

	return (int) tutor_utils()->get_total_students( $course_id );
}

/**
 * Whether course offers a certificate.
 */
function esitef_landing_has_certificate( $course_id = 0 ) {
	$course_id = $course_id ? $course_id : esitef_landing_course_id();

	if ( get_post_meta( $course_id, '_tutor_course_certificate_template', true ) ) {
		return true;
	}

	if ( function_exists( 'tutor_utils' ) && tutor_utils()->get_option( 'enable_certificate' ) ) {
		return true;
	}

	return false;
}

/**
 * Course category names (comma-separated).
 */
function esitef_landing_get_category_label( $course_id = 0 ) {
	$course_id = $course_id ? $course_id : esitef_landing_course_id();
	$terms     = get_the_terms( $course_id, 'course-category' );

	if ( empty( $terms ) || is_wp_error( $terms ) ) {
		return __( 'Formación Online', 'esitef-minimal' );
	}

	return implode( ', ', wp_list_pluck( $terms, 'name' ) );
}

/**
 * Related courses query.
 *
 * @return WP_Query
 */
function esitef_landing_get_related_query( $course_id = 0 ) {
	$course_id   = $course_id ? $course_id : esitef_landing_course_id();
	$post_type   = function_exists( 'tutor' ) ? tutor()->course_post_type : 'courses';
	$base_args   = array(
		'post_type'      => $post_type,
		'posts_per_page' => 3,
		'post__not_in'   => array( $course_id ),
		'post_status'    => 'publish',
	);
	$terms       = get_the_terms( $course_id, 'course-category' );
	$tax_query   = array();

	if ( ! empty( $terms ) && ! is_wp_error( $terms ) ) {
		$tax_query[] = array(
			'taxonomy' => 'course-category',
			'field'    => 'term_id',
			'terms'    => wp_list_pluck( $terms, 'term_id' ),
		);
	}

	$related = new WP_Query(
		array_merge(
			$base_args,
			array( 'tax_query' => $tax_query )
		)
	);

	// ponytail: si solo hay un curso o sin categoría compartida, mostrar otros publicados
	if ( ! $related->have_posts() ) {
		$related = new WP_Query( $base_args );
	}

	return $related;
}

/**
 * Review initials from display name.
 */
function esitef_landing_review_initials( $name ) {
	$parts = preg_split( '/\s+/', trim( (string) $name ) );
	$init  = '';
	foreach ( array_slice( $parts, 0, 2 ) as $part ) {
		$init .= mb_strtoupper( mb_substr( $part, 0, 1 ) );
	}
	return $init ?: '?';
}

/**
 * Star string for rating value.
 */
function esitef_landing_star_string( $rating ) {
	$rating = max( 0, min( 5, (float) $rating ) );
	$full   = (int) round( $rating );
	return str_repeat( '★', $full ) . str_repeat( '☆', 5 - $full );
}
