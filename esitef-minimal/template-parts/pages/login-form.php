<?php
/**
 * Login / Register form
 *
 * @package esitef-minimal
 */

$redirect         = esitef_get_auth_redirect_url();
$login_action     = add_query_arg( 'redirect_to', rawurlencode( $redirect ), site_url( 'wp-login.php' ) );
$register_action  = admin_url( 'admin-post.php' );
$register_error   = isset( $_GET['reg_error'] ) ? sanitize_key( wp_unslash( $_GET['reg_error'] ) ) : '';
$lost_password    = wp_lostpassword_url();
$close_url        = wp_get_referer() ? wp_get_referer() : home_url( '/' );
?>
<button type="button" class="login-close" id="login-close"
  aria-label="<? esc_attr_e( 'Cerrar', 'esitef-minimal' ); ?>"
  data-fallback="<?php echo esc_url( $close_url ); ?>">
  <span class="login-close__line" aria-hidden="true"></span>
  <span class="login-close__line" aria-hidden="true"></span>
</button>
<main class="login-main">
  <div class="login-form auth-panels">

    <section class="auth-panel auth-panel--login" id="auth-login" aria-labelledby="auth-login-title">
      <h1 class="login-form__title" id="auth-login-title"><? esc_html_e( 'Bienvenid@ de nuevo', 'esitef-minimal' ); ?></h1>
      <p class="login-form__subtitle"><? esc_html_e( 'Ingresa con tu usuario y contraseña.', 'esitef-minimal' ); ?></p>

      <form action="<?php echo esc_url( $login_action ); ?>" method="post" novalidate>
        <input type="hidden" name="redirect_to" value="<?php echo esc_url( $redirect ); ?>">

        <div class="login-field">
          <label for="user_login"><? esc_html_e( 'Usuario', 'esitef-minimal' ); ?></label>
          <input type="text" id="user_login" name="log" autocomplete="username"
            placeholder="<? esc_attr_e( 'Tu email o nombre de usuario', 'esitef-minimal' ); ?>" required>
        </div>

        <div class="login-field login-field--password">
          <label for="user_pass"><? esc_html_e( 'Contraseña', 'esitef-minimal' ); ?></label>
          <input type="password" id="user_pass" name="pwd" autocomplete="current-password"
            placeholder="••••••••" required>
          <button type="button" class="login-toggle-pw" aria-label="<? esc_attr_e( 'Mostrar contraseña', 'esitef-minimal' ); ?>" data-toggle-password="user_pass"><? esc_html_e( 'ver', 'esitef-minimal' ); ?></button>
        </div>

        <button type="submit" class="login-submit"><? esc_html_e( 'Entrar', 'esitef-minimal' ); ?></button>
      </form>

      <nav class="login-links" aria-label="<? esc_attr_e( 'Ayuda con la cuenta', 'esitef-minimal' ); ?>">
        <a href="<?php echo esc_url( $lost_password ); ?>"><? esc_html_e( '¿Olvidaste tu contraseña?', 'esitef-minimal' ); ?></a>
        <span aria-hidden="true">·</span>
        <button type="button" class="js-auth-toggle" data-auth-panel="register"><? esc_html_e( 'Registro', 'esitef-minimal' ); ?></button>
      </nav>
    </section>

    <section class="auth-panel auth-panel--register" id="auth-register" hidden aria-labelledby="auth-register-title">
      <h1 class="login-form__title" id="auth-register-title"><? esc_html_e( 'Crea tu cuenta', 'esitef-minimal' ); ?></h1>
      <p class="login-form__subtitle"><? esc_html_e( 'Únete a ESITEF Online en unos segundos.', 'esitef-minimal' ); ?></p>

      <?php if ( $register_error ) : ?>
        <p class="login-form__error" role="alert"><?php echo esc_html( esitef_get_register_error_message( $register_error ) ); ?></p>
      <?php endif; ?>

      <form action="<?php echo esc_url( $register_action ); ?>" method="post" novalidate id="register-form">
        <input type="hidden" name="action" value="esitef_register">
        <?php wp_nonce_field( 'esitef_register', 'esitef_register_nonce' ); ?>
        <input type="hidden" name="redirect_to" value="<?php echo esc_url( $redirect ); ?>">

        <div class="login-field-row">
          <div class="login-field">
            <label for="reg_first_name"><? esc_html_e( 'Nombre', 'esitef-minimal' ); ?></label>
            <input type="text" id="reg_first_name" name="first_name" autocomplete="given-name"
              placeholder="<? esc_attr_e( 'Tu nombre', 'esitef-minimal' ); ?>" required>
          </div>
          <div class="login-field">
            <label for="reg_last_name"><? esc_html_e( 'Apellidos', 'esitef-minimal' ); ?></label>
            <input type="text" id="reg_last_name" name="last_name" autocomplete="family-name"
              placeholder="<? esc_attr_e( 'Tus apellidos', 'esitef-minimal' ); ?>" required>
          </div>
        </div>

        <div class="login-field">
          <label for="reg_user_login"><? esc_html_e( 'Usuario', 'esitef-minimal' ); ?></label>
          <input type="text" id="reg_user_login" name="user_login" autocomplete="username"
            placeholder="<? esc_attr_e( 'Elige un nombre de usuario', 'esitef-minimal' ); ?>" required>
        </div>

        <div class="login-field">
          <label for="reg_user_email"><? esc_html_e( 'Email', 'esitef-minimal' ); ?></label>
          <input type="email" id="reg_user_email" name="user_email" autocomplete="email"
            placeholder="nombre@email.com" required inputmode="email" spellcheck="false">
        </div>

        <div class="login-field login-field--password">
          <label for="reg_user_pass"><? esc_html_e( 'Contraseña', 'esitef-minimal' ); ?></label>
          <input type="password" id="reg_user_pass" name="user_pass" autocomplete="new-password"
            placeholder="••••••••" required minlength="9">
          <button type="button" class="login-toggle-pw" aria-label="<? esc_attr_e( 'Mostrar contraseña', 'esitef-minimal' ); ?>" data-toggle-password="reg_user_pass"><? esc_html_e( 'ver', 'esitef-minimal' ); ?></button>
          <p class="login-field-hint"><? esc_html_e( 'Más de 8 caracteres e incluye un carácter especial (!@#$…).', 'esitef-minimal' ); ?></p>
        </div>

        <div class="login-field login-field--password">
          <label for="reg_user_pass_confirm"><? esc_html_e( 'Confirmar contraseña', 'esitef-minimal' ); ?></label>
          <input type="password" id="reg_user_pass_confirm" autocomplete="new-password"
            placeholder="••••••••" required minlength="9">
          <button type="button" class="login-toggle-pw" aria-label="<? esc_attr_e( 'Mostrar contraseña', 'esitef-minimal' ); ?>" data-toggle-password="reg_user_pass_confirm"><? esc_html_e( 'ver', 'esitef-minimal' ); ?></button>
        </div>

        <button type="submit" class="login-submit"><? esc_html_e( 'Crear cuenta', 'esitef-minimal' ); ?></button>
      </form>

      <nav class="login-links" aria-label="<? esc_attr_e( 'Volver al inicio de sesión', 'esitef-minimal' ); ?>">
        <span class="login-links__muted"><? esc_html_e( '¿Ya tienes cuenta?', 'esitef-minimal' ); ?></span>
        <span aria-hidden="true">·</span>
        <button type="button" class="js-auth-toggle" data-auth-panel="login"><? esc_html_e( 'Iniciar sesión', 'esitef-minimal' ); ?></button>
      </nav>
    </section>

  </div>
</main>
