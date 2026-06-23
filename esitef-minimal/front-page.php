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

    /* ---- BLOG SECTION (SECCIÓN 3) ---- */
    .blog-section {
      padding: 100px 20px 180px 20px; /* Extra bottom padding for staggered cards */
      background: #ffffff;
    }

    .blog-inner {
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
    }

    .blog-titulo {
      font-family: "Bricolage Grotesque", sans-serif;
      font-size: 46px;
      font-weight: 800;
      color: #000000;
      text-align: center;
      margin-bottom: 60px;
    }

    .blog-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 30px;
      align-items: stretch;
    }

    .blog-card {
      background: #f2f2f2;
      border-radius: 32px;
      padding: 40px 30px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 450px;
      position: relative;
      transition: transform 0.4s ease, box-shadow 0.4s ease;
      text-decoration: none;
      color: inherit;
    }

    /* Hover micro-animation for blog cards */
    .blog-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
    }

    /* Stagger effect on desktop */
    @media (min-width: 992px) {
      .blog-card:nth-child(1) {
        transform: translateY(0);
      }
      .blog-card:nth-child(2) {
        transform: translateY(40px);
      }
      .blog-card:nth-child(3) {
        transform: translateY(80px);
      }
      
      /* Hover combined with stagger */
      .blog-card:nth-child(1):hover {
        transform: translateY(-5px);
      }
      .blog-card:nth-child(2):hover {
        transform: translateY(35px);
      }
      .blog-card:nth-child(3):hover {
        transform: translateY(75px);
      }
    }

    .blog-card-quote {
      font-family: "Georgia", serif;
      font-size: 72px;
      line-height: 1;
      color: #d8d8d8;
      margin-bottom: -10px;
      margin-left: -5px;
      user-select: none;
    }

    .blog-card-content {
      margin-bottom: auto;
    }

    .blog-card-content h3 {
      font-family: "Inter", sans-serif;
      font-size: 22px;
      font-weight: 600;
      color: #111;
      margin-bottom: 12px;
      line-height: 1.25;
      letter-spacing: -0.5px;
    }

    .blog-card-content p {
      font-family: "Inter", sans-serif;
      font-size: 15px;
      color: #555;
      line-height: 1.5;
      margin: 0;
    }

    .blog-card-footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 30px;
    }

    .blog-card-author {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding-right: 15px;
    }

    .author-name {
      font-family: "Inter", sans-serif;
      font-weight: 700;
      font-size: 15px;
      color: #111;
      line-height: 1.2;
    }

    .author-role {
      font-family: "Inter", sans-serif;
      font-size: 13px;
      color: #666;
      line-height: 1.2;
    }

    .blog-card-image {
      width: 80px;
      height: 80px;
      border-radius: 20px;
      overflow: hidden;
      flex-shrink: 0;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    }

    .blog-card-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    /* Responsive styling for tablet/mobile */
    @media (max-width: 991px) {
      .blog-section {
        padding: 80px 20px;
      }
      .blog-grid {
        grid-template-columns: 1fr;
        gap: 30px;
      }
      .blog-card {
        min-height: auto;
        padding: 35px 24px;
      }
      .blog-titulo {
        font-size: 36px;
        margin-bottom: 40px;
      }
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

    <!-- ================================================
       SECCIÓN 3: BLOG — Entradas del Blog Staggered
       ================================================ -->
    <section class="blog-section" aria-label="Últimas entradas del blog">
      <div class="blog-inner">
        <h2 class="blog-titulo">Blog</h2>
        
        <div class="blog-grid">
          <?php
          $recent_posts = new WP_Query(array(
              'posts_per_page' => 3,
              'post_status'    => 'publish'
          ));

          if ( $recent_posts->have_posts() ) :
              while ( $recent_posts->have_posts() ) : $recent_posts->the_post();
                  $author_name = get_the_author();
                  $author_role = 'Docente ESITEF'; // Rol predeterminado
                  
                  $img_url = get_the_post_thumbnail_url(get_the_ID(), 'medium');
                  if (!$img_url) {
                      $img_url = 'https://esitef.com/online/wp-content/uploads/2022/05/blog-esitef-.png';
                  }
                  ?>
                  <a href="<?php the_permalink(); ?>" class="blog-card">
                    <div class="blog-card-quote">“</div>
                    <div class="blog-card-content">
                      <h3><?php the_title(); ?></h3>
                      <p><?php echo wp_trim_words(get_the_excerpt(), 20, '...'); ?></p>
                    </div>
                    <div class="blog-card-footer">
                      <div class="blog-card-author">
                        <span class="author-name"><?php echo esc_html($author_name); ?></span>
                        <span class="author-role"><?php echo esc_html($author_role); ?></span>
                      </div>
                      <div class="blog-card-image">
                        <img src="<?php echo esc_url($img_url); ?>" alt="<?php the_title_attribute(); ?>">
                      </div>
                    </div>
                  </a>
                  <?php
              endwhile;
              wp_reset_postdata();
          else :
              echo '<p>No hay artículos en el blog.</p>';
          endif;
          ?>
        </div>

        <?php if ( $recent_posts->have_posts() ) : ?>
        <div style="text-align: center; margin-top: 140px;">
            <a href="<?php echo home_url('/blog'); ?>" class="btn-country" style="background: var(--color-text-main); color: #fff; padding: 12px 34px; border-radius: 50px; font-weight: 600; font-family: 'Inter', sans-serif;">Ver todos los artículos</a>
        </div>
        <?php endif; ?>
      </div>
    </section>

</main>

<?php get_footer(); ?>
