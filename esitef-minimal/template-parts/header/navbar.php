<?php
/**
 * Navbar v7.5 — ESITEF
 *
 * @package esitef-minimal
 */

$login_url     = esitef_get_login_url();
$dashboard_url = esitef_get_dashboard_url();
$cart_url      = function_exists( 'wc_get_cart_url' ) ? wc_get_cart_url() : home_url( '/cart/' );
$is_logged_in  = is_user_logged_in();
$current_user  = $is_logged_in ? wp_get_current_user() : null;
$cart_svg      = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" height="19" viewBox="0 0 21 19" width="21"><path d="m18.9375 10.832 1.6523-7.31247c.0704-.25781.0235-.49219-.1406-.70312-.164-.21094-.3867-.31641-.668-.31641h-13.81636l-.3164-1.582031c-.04688-.1875-.15235-.339844-.31641-.457031-.14062-.140626-.30469-.210938-.49219-.210938h-3.62109c-.234375 0-.433594.082031-.597656.246094-.164063.164062-.246094.363281-.246094.597656v.5625c0 .23438.082031.43359.246094.59766.164062.16406.363281.24609.597656.24609h2.46094l2.46093 12.0586c-.30468.1875-.55078.4336-.73828.7383-.16406.3047-.24609.6328-.24609.9843 0 .5391.1875.9961.5625 1.3711.39844.3985.86719.5977 1.40625.5977s.99609-.1992 1.37109-.5977c.39844-.375.59766-.8437.59766-1.4062 0-.5391-.19922-.9961-.59766-1.3711h7.38281c-.3984.375-.5977.832-.5977 1.3711 0 .5625.1876 1.0312.5626 1.4062.3984.3985.8671.5977 1.4062.5977s.9961-.1992 1.3711-.5977c.3984-.375.5977-.832.5977-1.3711 0-.375-.1055-.7148-.3165-1.0195-.1875-.3281-.457-.5742-.8085-.7383l.2109-.8789c.0469-.2578-.0117-.4922-.1758-.7031s-.375-.3164-.6328-.3164h-9.45704l-.21094-1.125h10.30078c.1875 0 .3516-.0586.4922-.1758.1641-.1172.2695-.2812.3164-.4922z" /></svg>';

$mobile_account_item = $is_logged_in
	? '<li class="item-movil-entrar menu-item"><a href="' . esc_url( $dashboard_url ) . '">' . esc_html__( 'Mi cuenta', 'esitef-minimal' ) . '</a></li>'
	: '<li class="item-movil-entrar menu-item"><a href="' . esc_url( $login_url ) . '" class="js-login-link">' . esc_html__( 'Ingresar', 'esitef-minimal' ) . '</a></li>';

$mobile_prefix = $mobile_account_item . '
<li class="item-movil menu-item">
  <a href="' . esc_url( $cart_url ) . '">' . esc_html__( 'Carrito', 'esitef-minimal' ) . '</a>
</li>';

$mobile_suffix = '
<li class="nav-mobile-socials" aria-label="' . esc_attr__( 'Redes sociales', 'esitef-minimal' ) . '">
  <a href="https://www.instagram.com/esitef_oficial/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
  </a>
  <a href="https://www.facebook.com/esitef.sudamerica" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
  </a>
</li>';
?>
<header class="header-default header-navbar-v2" id="masthead">
  <div class="navbar-v2-overlay" aria-hidden="true"></div>
  <nav class="navbar navbar-right full-width">

    <div class="navbar-brand">
      <?php if ( has_custom_logo() ) : ?>
        <?php the_custom_logo(); ?>
      <?php else : ?>
        <a href="<?php echo esc_url( home_url( '/' ) ); ?>" rel="home">
          <img src="<?php echo esc_url( esitef_asset_uri( 'images/logo-placeholder.png' ) ); ?>"
            alt="<?php bloginfo( 'name' ); ?>"
            onerror="this.src='https://esitef.com/online/wp-content/uploads/2026/05/Esitef_logo_icon_preloadeer.png'">
        </a>
      <?php endif; ?>
    </div>

    <div class="search-field">
      <form method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>">
        <input type="search" name="s" value="<?php echo get_search_query(); ?>" placeholder="Search...">
      </form>
    </div>

    <button class="navbar-toggler" id="menu-toggle" aria-label="<? esc_attr_e( 'Abrir menú', 'esitef-minimal' ); ?>" aria-expanded="false">
      <span class="burger-line" aria-hidden="true"></span>
      <span class="burger-line" aria-hidden="true"></span>
    </button>

    <div class="menu-menu-principal-container">
      <?php
      if ( has_nav_menu( 'menu-1' ) ) {
        wp_nav_menu(
          array(
            'theme_location' => 'menu-1',
            'menu_id'        => 'menu-menu-principal',
            'menu_class'     => 'navbar-nav',
            'container'      => false,
            'items_wrap'     => '<ul id="%1$s" class="%2$s">' . $mobile_prefix . '%3$s' . $mobile_suffix . '</ul>',
            'fallback_cb'    => false,
          )
        );
      } else {
        ?>
        <ul id="menu-menu-principal" class="navbar-nav">
          <?php echo $mobile_prefix; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
          <li class="menu-item"><a href="<?php echo esc_url( esitef_get_escuela_url() ); ?>"><? esc_html_e( 'Escuela', 'esitef-minimal' ); ?></a></li>
          <li class="menu-item menu-item-has-children">
            <a href="#"><? esc_html_e( 'Online', 'esitef-minimal' ); ?></a>
            <ul class="sub-menu">
              <li><a href="<?php echo esc_url( esitef_get_formaciones_url() ); ?>"><? esc_html_e( 'Formaciones', 'esitef-minimal' ); ?></a></li>
              <li><a href="<?php echo esc_url( home_url( '/libros/' ) ); ?>"><? esc_html_e( 'Libros', 'esitef-minimal' ); ?></a></li>
              <li><a href="<?php echo esc_url( home_url( '/articulos/' ) ); ?>"><? esc_html_e( 'Artículos', 'esitef-minimal' ); ?></a></li>
              <li><a href="<?php echo esc_url( home_url( '/mentorias/' ) ); ?>"><? esc_html_e( 'Mentorías', 'esitef-minimal' ); ?></a></li>
            </ul>
          </li>
          <li class="menu-item menu-item-has-children">
            <a href="#"><? esc_html_e( 'Presenciales', 'esitef-minimal' ); ?></a>
            <ul class="sub-menu">
              <?php foreach ( esitef_get_paises() as $slug => $pais ) : ?>
              <li><a href="<?php echo esc_url( esitef_get_page_url( $slug ) ); ?>"><?php echo esc_html( $pais['title'] ); ?></a></li>
              <?php endforeach; ?>
            </ul>
          </li>
          <li class="menu-item"><a href="<?php echo esc_url( home_url( '/contacto/' ) ); ?>"><? esc_html_e( 'Contacto', 'esitef-minimal' ); ?></a></li>
          <li class="menu-item"><a href="<?php echo esc_url( home_url( '/faqs/' ) ); ?>"><? esc_html_e( 'FAQs', 'esitef-minimal' ); ?></a></li>
          <?php echo $mobile_suffix; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
        </ul>
        <?php
      }
      ?>
    </div>

    <div class="navbar-utils">
      <?php if ( class_exists( 'WooCommerce' ) && WC()->cart ) : ?>
      <div class="utils-cart">
        <a class="cart-contents" href="<?php echo esc_url( $cart_url ); ?>" title="<? esc_attr_e( 'Ver tu carrito de compras', 'esitef-minimal' ); ?>">
          <span class="btn-cart">
            <?php echo $cart_svg; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
            <span class="cart-count"><?php echo esc_html( WC()->cart->get_cart_contents_count() ); ?></span>
          </span>
        </a>
      </div>
      <?php endif; ?>
      <div class="utils-btn">
        <?php if ( $is_logged_in && $current_user ) : ?>
          <a class="navbar-profile" href="<?php echo esc_url( $dashboard_url ); ?>"
            title="<?php echo esc_attr( $current_user->display_name ); ?>"
            aria-label="<?php echo esc_attr( sprintf( __( 'Mi cuenta: %s', 'esitef-minimal' ), $current_user->display_name ) ); ?>">
            <?php echo get_avatar( $current_user->ID, 40, '', '', array( 'class' => 'navbar-profile__avatar' ) ); ?>
          </a>
        <?php else : ?>
          <a class="btn-getstarted js-login-link" href="<?php echo esc_url( $login_url ); ?>"><? esc_html_e( 'Ingresar', 'esitef-minimal' ); ?></a>
        <?php endif; ?>
      </div>
    </div>

  </nav>
</header>
