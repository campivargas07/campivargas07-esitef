<?php
/**
 * The front page template file
 *
 * @package esitef-minimal
 */

get_header();
?>

<style>
    /* Front Page Specific Styles */
    .hero-section {
        text-align: center;
        padding: 80px 20px;
        background: var(--color-bg);
    }
    .hero-title {
        font-size: 3rem;
        font-weight: 800;
        margin-bottom: 20px;
        color: var(--color-text-main);
        max-width: 800px;
        margin-left: auto;
        margin-right: auto;
    }
    .hero-subtitle {
        font-size: 1.25rem;
        color: var(--color-text-muted);
        max-width: 600px;
        margin: 0 auto 40px;
    }
    .country-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        justify-content: center;
    }
    .btn-country {
        background: #fff;
        border: 1px solid var(--color-border);
        padding: 10px 24px;
        border-radius: var(--radius-lg);
        color: var(--color-text-main);
        font-weight: 600;
        transition: all 0.2s ease;
    }
    .btn-country:hover {
        border-color: var(--color-text-main);
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
    .btn-country.active {
        background: var(--color-text-main);
        color: #fff;
    }

    .services-section {
        padding: 80px 20px;
        background: #fff;
    }
    .section-title {
        text-align: center;
        font-size: 2.5rem;
        margin-bottom: 60px;
    }
    .services-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 30px;
        max-width: var(--container-width);
        margin: 0 auto;
    }
    .service-card {
        text-align: center;
        padding: 20px;
        border-radius: var(--radius-md);
        transition: transform 0.3s ease;
    }
    .service-card:hover {
        transform: translateY(-5px);
    }
    .service-image {
        width: 100%;
        max-width: 200px;
        aspect-ratio: 1;
        object-fit: cover;
        border-radius: var(--radius-sm);
        margin: 0 auto 20px;
        background: #f0f0f0;
    }
    .service-title {
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--color-text-main);
    }

    .blog-section {
        padding: 80px 20px;
        background: var(--color-bg);
    }
</style>

<main id="primary" class="site-main">

    <!-- Hero Section -->
    <section class="hero-section">
        <div class="container">
            <h1 class="hero-title">Te ayudamos a crecer en tu profesión</h1>
            <p class="hero-subtitle">A través de herramientas útiles, prácticas y actualizadas.</p>
            
            <div class="country-buttons">
                <a href="https://esitef.com/espana/" class="btn-country">España</a>
                <a href="https://esitef.com/peru/" class="btn-country">Perú</a>
                <a href="https://esitef.com/argentina" class="btn-country">Argentina</a>
                <a href="https://esitef.com/mexico" class="btn-country">México</a>
                <a href="https://esitef.com/colombia" class="btn-country">Colombia</a>
                <a href="https://esitef.com/online/pedagogia-aplicada-montevideo/" class="btn-country">Uruguay</a>
                <a href="https://esitef.com/online" class="btn-country active">Online</a>
            </div>
        </div>
    </section>

    <!-- Services Section -->
    <section class="services-section">
        <div class="container">
            <h2 class="section-title">Ofrecemos</h2>
            <div class="services-grid">
                
                <a href="https://esitef.com/formaciones/" class="service-card">
                    <img src="https://esitef.com/online/wp-content/uploads/2022/02/Desde-la-camilla-al-movimiento.png" alt="Nuestras formaciones" class="service-image">
                    <h3 class="service-title">Nuestras formaciones</h3>
                </a>

                <a href="#" class="service-card">
                    <img src="https://esitef.com/online/wp-content/uploads/2022/05/Asesoria-clinicas-fisioterapia_.png" alt="Mentoría" class="service-image">
                    <h3 class="service-title">Mentoría profesional con Tomás</h3>
                </a>

                <a href="https://esitef.com/sesiones-online-con-tomas-bonino/" class="service-card">
                    <img src="https://esitef.com/online/wp-content/uploads/2022/05/sesiones-online-fisioterapia-.png" alt="Sesiones Online" class="service-image">
                    <h3 class="service-title">Sesiones Online con Tomás</h3>
                </a>

                <a href="https://esitef.com/talleres-privados-clinicas/" class="service-card">
                    <img src="https://esitef.com/online/wp-content/uploads/2022/02/Evaluacion-funcional-rodilla.png" alt="Talleres privados" class="service-image">
                    <h3 class="service-title">Talleres privados clinicas / Instituciones</h3>
                </a>

                <a href="https://esitef.com/blog" class="service-card">
                    <img src="https://esitef.com/online/wp-content/uploads/2022/05/blog-esitef-.png" alt="Blog" class="service-image">
                    <h3 class="service-title">Blog</h3>
                </a>

            </div>
        </div>
    </section>

    <!-- Blog Section -->
    <section class="blog-section">
        <div class="container">
            <h2 class="section-title">Blog</h2>
            
            <div class="services-grid">
                <?php
                // Fetch recent 3 posts for the blog section
                $recent_posts = new WP_Query(array(
                    'posts_per_page' => 3,
                    'post_status'    => 'publish'
                ));

                if ( $recent_posts->have_posts() ) :
                    while ( $recent_posts->have_posts() ) : $recent_posts->the_post();
                        ?>
                        <article class="service-card" style="text-align: left; background: #fff; padding: 0; overflow: hidden; border: 1px solid var(--color-border);">
                            <a href="<?php the_permalink(); ?>">
                                <?php if ( has_post_thumbnail() ) : ?>
                                    <?php the_post_thumbnail('medium', array('class' => 'service-image', 'style' => 'width: 100%; max-width: none; margin: 0; border-radius: 0; aspect-ratio: 16/9;')); ?>
                                <?php else: ?>
                                    <div class="service-image" style="width: 100%; max-width: none; margin: 0; border-radius: 0; aspect-ratio: 16/9;"></div>
                                <?php endif; ?>
                                <div style="padding: 20px;">
                                    <h3 class="service-title" style="margin-bottom: 10px; font-size: 1.2rem;"><?php the_title(); ?></h3>
                                    <p style="font-size: 0.9rem; color: var(--color-text-muted); margin-bottom: 15px;"><?php echo wp_trim_words(get_the_excerpt(), 15); ?></p>
                                    <span style="font-weight: 600; font-size: 0.9rem; color: var(--color-text-main);">Leer más &rarr;</span>
                                </div>
                            </a>
                        </article>
                        <?php
                    endwhile;
                    wp_reset_postdata();
                else :
                    echo '<p>No hay artículos recientes.</p>';
                endif;
                ?>
            </div>
            
            <div style="text-align: center; margin-top: 40px;">
                <a href="<?php echo home_url('/blog'); ?>" class="btn-country" style="background: var(--color-text-main); color: #fff;">Ver todos los artículos</a>
            </div>
        </div>
    </section>

</main>

<?php get_footer(); ?>
