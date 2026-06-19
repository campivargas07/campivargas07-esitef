<?php
/**
 * The main template file
 *
 * @package esitef-minimal
 */

get_header();
?>

<main id="primary" class="site-main container" style="padding: 40px 20px; min-height: 60vh;">
    <?php
    if ( have_posts() ) :
        while ( have_posts() ) :
            the_post();
            ?>
            <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
                <header class="entry-header">
                    <?php the_title( '<h1 class="entry-title" style="margin-bottom: 24px;">', '</h1>' ); ?>
                </header>
                <div class="entry-content">
                    <?php the_content(); ?>
                </div>
            </article>
            <?php
        endwhile;
    else :
        echo '<p>No se encontró contenido.</p>';
    endif;
    ?>
</main>

<?php
get_footer();
