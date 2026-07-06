<?php
/**
 * Home hero + marquee
 *
 * @package esitef-minimal
 */
?>
<section class="hero-section" aria-label="<? esc_attr_e( 'Inicio ESITEF', 'esitef-minimal' ); ?>">
  <div class="hero-bg" aria-hidden="true"></div>

  <div class="hero-body">
    <div class="hero-inner">
      <article class="hero-left">
        <h1 class="titulo-esitef">
          <span class="texto-estatico"><?php echo esc_html( 'Sé el profesional' ); ?><br><?php echo esc_html( 'que ' ); ?></span>
          <span class="texto-animado" id="texto-animado"></span><span class="cursor">|</span>
        </h1>
        <p class="hero-subtitle"><? esc_html_e( 'Te ayudamos a crecer en tu profesión a través de herramientas útiles, prácticas y actualizadas.', 'esitef-minimal' ); ?></p>
      </article>

      <nav class="hero-paises" aria-label="<? esc_attr_e( 'Selecciona tu país', 'esitef-minimal' ); ?>">
        <div class="paises-row">
          <a class="country-btn" href="<?php echo esc_url( home_url( '/espana/' ) ); ?>"><? esc_html_e( 'España', 'esitef-minimal' ); ?></a>
          <a class="country-btn" href="<?php echo esc_url( home_url( '/peru/' ) ); ?>"><? esc_html_e( 'Perú', 'esitef-minimal' ); ?></a>
        </div>
        <div class="paises-row">
          <a class="country-btn" href="<?php echo esc_url( home_url( '/argentina/' ) ); ?>"><? esc_html_e( 'Argentina', 'esitef-minimal' ); ?></a>
          <a class="country-btn" href="<?php echo esc_url( home_url( '/mexico/' ) ); ?>"><? esc_html_e( 'México', 'esitef-minimal' ); ?></a>
        </div>
        <div class="paises-row">
          <a class="country-btn" href="<?php echo esc_url( home_url( '/colombia/' ) ); ?>"><? esc_html_e( 'Colombia', 'esitef-minimal' ); ?></a>
          <a class="country-btn" href="<?php echo esc_url( home_url( '/uruguay/' ) ); ?>"><? esc_html_e( 'Uruguay', 'esitef-minimal' ); ?></a>
        </div>
        <div class="paises-row">
          <a class="country-btn btn-online" href="<?php echo esc_url( home_url( '/' ) ); ?>"><? esc_html_e( 'Online', 'esitef-minimal' ); ?></a>
        </div>
      </nav>
    </div>
  </div>

  <section class="marquee-section" aria-label="<? esc_attr_e( 'Nuestros partners y menciones', 'esitef-minimal' ); ?>">
    <div class="marquee-inner">
      <?php
      $marquee_items = array( 'Media', 'NovaTech', 'Pluto Inc', 'VitaHealth', 'BoxMedia' );
      for ( $g = 0; $g < 2; $g++ ) :
        foreach ( $marquee_items as $label ) :
          $hidden = $g > 0 ? ' aria-hidden="true"' : '';
          ?>
      <div class="marquee-item"<?php echo $hidden; // phpcs:ignore ?>>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
        <?php echo esc_html( $label ); ?>
      </div>
          <?php
        endforeach;
      endfor;
      ?>
    </div>
  </section>
</section>
