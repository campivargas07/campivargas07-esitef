<?php
/**
 * Página Contacto — formulario + redes.
 *
 * @package esitef-minimal
 *
 * @var bool $success
 * @var bool $error
 */

$args = wp_parse_args(
	$args ?? array(),
	array(
		'success' => false,
		'error'   => false,
	)
);

$success = (bool) $args['success'];
$error   = (bool) $args['error'];

$socials = array(
	array(
		'label' => 'ESITEF',
		'network' => 'Facebook',
		'url'   => 'https://www.facebook.com/esitef.sudamerica',
		'icon'  => 'facebook',
	),
	array(
		'label' => 'ESITEF',
		'network' => 'Instagram',
		'url'   => 'https://www.instagram.com/esitef_internacional/',
		'icon'  => 'instagram',
	),
	array(
		'label' => 'Movement Therapy',
		'network' => 'Facebook',
		'url'   => 'https://www.facebook.com/people/Movement-Therapy-by-Esitef/100066335085533/',
		'icon'  => 'facebook',
	),
	array(
		'label' => 'Movement Therapy',
		'network' => 'Instagram',
		'url'   => 'https://www.instagram.com/movementtherapy_esitef/',
		'icon'  => 'instagram',
	),
);
?>
<section class="contacto-section" aria-label="<?php esc_attr_e( 'Contacto', 'esitef-minimal' ); ?>">
  <div class="contacto-inner">

    <div class="contacto-module esitef-module-shell">
      <div class="contacto-card esitef-module-card">
        <h1 class="contacto-title"><?php esc_html_e( 'Contacto', 'esitef-minimal' ); ?></h1>

        <?php if ( $success ) : ?>
        <div class="contacto-success" role="status">
          <p><?php esc_html_e( 'Mensaje enviado. Te responderemos pronto.', 'esitef-minimal' ); ?></p>
        </div>
        <?php else : ?>

        <?php if ( $error ) : ?>
        <p class="contacto-error" role="alert">
          <?php esc_html_e( 'Revisa los campos e inténtalo de nuevo.', 'esitef-minimal' ); ?>
        </p>
        <?php endif; ?>

        <form class="contacto-form" method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" novalidate>
          <input type="hidden" name="action" value="esitef_contacto">
          <?php wp_nonce_field( 'esitef_contacto', 'esitef_contacto_nonce' ); ?>

          <div class="contacto-field">
            <label for="contacto-nombre"><?php esc_html_e( 'Nombre', 'esitef-minimal' ); ?> <span aria-hidden="true">*</span></label>
            <input type="text" id="contacto-nombre" name="nombre" autocomplete="name" required>
          </div>

          <div class="contacto-field">
            <label for="contacto-email"><?php esc_html_e( 'Email', 'esitef-minimal' ); ?> <span aria-hidden="true">*</span></label>
            <input type="email" id="contacto-email" name="email" autocomplete="email" inputmode="email" spellcheck="false" required>
          </div>

          <div class="contacto-field">
            <label for="contacto-mensaje"><?php esc_html_e( 'Mensaje', 'esitef-minimal' ); ?> <span aria-hidden="true">*</span></label>
            <textarea id="contacto-mensaje" name="mensaje" rows="4" required></textarea>
          </div>

          <button type="submit" class="contacto-btn"><?php esc_html_e( 'Enviar', 'esitef-minimal' ); ?></button>
        </form>
        <?php endif; ?>
      </div>
    </div>

    <div class="contacto-module esitef-module-shell">
      <div class="contacto-card esitef-module-card">
        <h2 class="contacto-title contacto-title--social"><?php esc_html_e( 'Redes sociales', 'esitef-minimal' ); ?></h2>
        <ul class="contacto-social-list">
          <?php foreach ( $socials as $item ) : ?>
          <li>
            <a class="contacto-social-link" href="<?php echo esc_url( $item['url'] ); ?>" target="_blank" rel="noopener noreferrer">
              <span class="contacto-social-icon" aria-hidden="true">
                <?php if ( 'instagram' === $item['icon'] ) : ?>
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                <?php else : ?>
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                <?php endif; ?>
              </span>
              <span class="contacto-social-text">
                <span class="contacto-social-label"><?php echo esc_html( $item['label'] ); ?></span>
                <span class="contacto-social-network"><?php echo esc_html( $item['network'] ); ?></span>
              </span>
            </a>
          </li>
          <?php endforeach; ?>
        </ul>
      </div>
    </div>

  </div>
</section>
