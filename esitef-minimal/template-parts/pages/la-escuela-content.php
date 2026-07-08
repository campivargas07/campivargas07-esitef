<?php
// Auto-extracted from la-escuela.html
?>
<!-- =====================================================
       HERO
       ===================================================== -->
    <section class="escuela-hero" aria-label="La Escuela ESITEF">
      <div class="escuela-hero-text">
        <span class="eyebrow">Desde 2007</span>
        <h1>Te ayudamos a <strong>crecer</strong></h1>
        <p class="lead">
          Somos la escuela de formación para profesionales de salud y deporte de mayor crecimiento internacional.
          Formamos a fisioterapeutas, médicos del deporte y profesionales de la salud con un enfoque práctico y riguroso.
        </p>
      </div>

      <div class="escuela-hero-media">
        <img src="https://esitef.com/online/wp-content/uploads/2022/12/esitef-inicio4-escuela-de-fisioterapia.webp"
          alt="Profesionales de salud en formación ESITEF">
        <div class="hero-float-badge">
          <span class="num">18</span>
          <span class="txt">años formando<br>profesionales</span>
        </div>
      </div>
    </section>

    <!-- =====================================================
       STATS
       ===================================================== -->
    <section class="stats-section" aria-label="Cifras de ESITEF">
      <div class="stats-inner">
        <div class="stat-item">
          <div class="stat-num"><span class="counter" data-target="2007">0</span></div>
          <div class="stat-label">Año de fundación</div>
        </div>
        <div class="stat-item">
          <div class="stat-num"><span class="counter" data-target="30">0</span>+</div>
          <div class="stat-label">Sedes formativas</div>
        </div>
        <div class="stat-item">
          <div class="stat-num"><span class="counter" data-target="8">0</span></div>
          <div class="stat-label">Países</div>
        </div>
        <div class="stat-item">
          <div class="stat-num">∞</div>
          <div class="stat-label">Compromiso con la práctica</div>
        </div>
      </div>
    </section>

    <!-- =====================================================
       PRESENCIA INTERNACIONAL
       ===================================================== -->
    <section class="presencia-section" aria-label="Presencia internacional">
      <p class="section-eyebrow">Presencia internacional</p>
      <h2 class="section-title">Una red que crece en 8 países</h2>
      <p class="body-text">
        Disponemos de más de 30 sedes formativas permanentes en las que ofrecemos, junto a instituciones
        universitarias, asociativas y de atención a pacientes, formación de postgrado y de especialización de alta
        calidad — tanto presencial como online.
      </p>
      <div class="country-chips">
        <?php
        $paises       = function_exists( 'esitef_get_paises' ) ? esitef_get_paises() : array();
        $paises_order = array( 'espana', 'mexico', 'argentina', 'colombia', 'peru', 'uruguay' );
        foreach ( $paises_order as $pais_slug ) :
          if ( empty( $paises[ $pais_slug ]['title'] ) ) {
            continue;
          }
          ?>
        <a class="country-chip" href="<?php echo esc_url( home_url( '/' . $pais_slug . '/' ) ); ?>"><?php echo esc_html( $paises[ $pais_slug ]['title'] ); ?></a>
        <?php endforeach; ?>
        <span class="country-chip country-chip--more">+ más</span>
      </div>
    </section>

    <!-- =====================================================
       VALORES / ENFOQUE
       ===================================================== -->
    <section class="valores-section" aria-label="Nuestro enfoque">
      <div class="valores-head">
        <p class="section-eyebrow">Nuestro enfoque</p>
        <h2 class="section-title">Cómo formamos</h2>
      </div>

      <div class="valores-grid">
        <div class="valor-card">
          <div class="valor-icon">
            <svg viewBox="0 0 24 24"><path d="M12 2 2 7l10 5 10-5-10-5Z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/></svg>
          </div>
          <h3>Práctico</h3>
          <p>Vamos a lo concreto, necesario y útil. Lo que aprendes se usa: herramientas que aplicas desde el primer día con tus pacientes y deportistas.</p>
        </div>

        <div class="valor-card">
          <div class="valor-icon">
            <svg viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          </div>
          <h3>Riguroso</h3>
          <p>Formación basada en la última evidencia disponible, con docentes de referencia internacional y un nivel de postgrado y especialización exigente.</p>
        </div>

        <div class="valor-card">
          <div class="valor-icon">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z"/></svg>
          </div>
          <h3>Internacional</h3>
          <p>Más de 30 sedes en 8 países y una comunidad de profesionales que crece cada año junto a instituciones universitarias y asociativas.</p>
        </div>
      </div>
    </section>

    <!-- =====================================================
       MANIFIESTO
       ===================================================== -->
    <section class="manifiesto-section" aria-label="Manifiesto ESITEF">
      <div class="manifiesto-card">
        <span class="quote-mark">“</span>
        <p>Vamos a lo concreto, necesario, útil y que se usa.</p>
      </div>
    </section>
