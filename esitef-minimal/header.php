<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo( 'charset' ); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="profile" href="https://gmpg.org/xfn/11">
    <?php wp_head(); ?>
    <style>
        /* Base Header Styles embedded for critical render path, will move to style.css */
        .site-header {
            background: var(--color-bg-secondary);
            border-bottom: 1px solid var(--color-border);
            padding: 20px 0;
            position: sticky;
            top: 0;
            z-index: 100;
        }
        .header-container {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .site-branding .custom-logo {
            max-height: 50px;
            width: auto;
        }
        .site-title a {
            font-size: 1.5rem;
            color: var(--color-text-main);
            font-weight: 800;
        }
        .main-navigation ul {
            display: flex;
            list-style: none;
            gap: 24px;
            margin: 0;
            padding: 0;
        }
        .main-navigation a {
            color: var(--color-text-main);
            font-weight: 500;
            font-size: 1rem;
        }
        .main-navigation a:hover {
            color: var(--color-primary);
        }
        .header-actions {
            display: flex;
            align-items: center;
            gap: 16px;
        }
        .btn-login {
            background-color: var(--color-text-main);
            color: #fff;
            padding: 10px 20px;
            border-radius: var(--radius-sm);
            font-weight: 600;
            transition: background 0.3s;
        }
        .btn-login:hover {
            background-color: var(--color-text-muted);
            color: #fff;
        }
        .cart-customlocation {
            color: var(--color-text-main);
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 5px;
        }
    </style>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<div id="page" class="site">
    <header id="masthead" class="site-header">
        <div class="container header-container">
            <div class="site-branding">
                <?php if ( has_custom_logo() ) : ?>
                    <?php the_custom_logo(); ?>
                <?php else : ?>
                    <h1 class="site-title"><a href="<?php echo esc_url( home_url( '/' ) ); ?>" rel="home"><?php bloginfo( 'name' ); ?></a></h1>
                <?php endif; ?>
            </div>
            
            <nav id="site-navigation" class="main-navigation">
                <?php
                if (has_nav_menu('menu-1')) {
                    wp_nav_menu(
                        array(
                            'theme_location' => 'menu-1',
                            'menu_id'        => 'primary-menu',
                            'container'      => false,
                        )
                    );
                } else {
                    // Fallback menu for development
                    echo '<ul><li><a href="/">Inicio</a></li><li><a href="/cursos">Cursos</a></li><li><a href="/contacto">Contacto</a></li></ul>';
                }
                ?>
            </nav>
            
            <div class="header-actions">
                <?php if ( class_exists( 'WooCommerce' ) ) : ?>
                    <a class="cart-customlocation" href="<?php echo wc_get_cart_url(); ?>" title="<?php _e( 'Ver carrito', 'esitef-minimal' ); ?>">
                        🛒 <span class="cart-count"><?php echo WC()->cart->get_cart_contents_count(); ?></span>
                    </a>
                <?php endif; ?>
                <a href="<?php echo home_url('/mi-cuenta'); ?>" class="btn-login">Acceso Alumnos</a>
            </div>
        </div>
    </header>
