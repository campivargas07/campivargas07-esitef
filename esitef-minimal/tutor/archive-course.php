<?php
/**
 * Template for displaying courses
 *
 * @package esitef-minimal
 */

get_header();

$course_filter = (bool) tutor_utils()->get_option( 'course_archive_filter', false );
$supported_filters = tutor_utils()->get_option( 'supported_course_filters', array() );

if ( $course_filter && count( $supported_filters ) ) {
	$course_filter = true;
}

?>

<main id="primary" class="site-main container tutor-archive-minimal" style="padding: 40px 20px; min-height: 60vh;">
    
    <header class="entry-header" style="margin-bottom: 40px;">
        <h1 class="entry-title"><?php echo esc_html__( 'Cursos', 'esitef-minimal' ); ?></h1>
    </header>

	<div class="<?php tutor_container_classes(); ?>">
        <!-- This calls Tutor's internal course loop -->
		<?php tutor_load_template( 'archive-course-loop' ); ?>
	</div>

</main>

<?php get_footer(); ?>
