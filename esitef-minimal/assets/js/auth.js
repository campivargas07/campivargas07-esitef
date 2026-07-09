(function () {
  var loginPanel = document.getElementById('auth-login');
  var registerPanel = document.getElementById('auth-register');
  var registerForm = document.getElementById('register-form');

  if (!loginPanel || !registerPanel) return;

  function showPanel(name) {
    var isRegister = name === 'register';
    loginPanel.hidden = isRegister;
    registerPanel.hidden = !isRegister;
    document.body.classList.toggle('auth-mode-register', isRegister);
    document.title = isRegister ? 'Registrarse | ESITEF Online' : 'Ingresar | ESITEF Online';
    history.replaceState(null, '', isRegister ? '#registro' : '#login');
    var focusEl = isRegister ? document.getElementById('reg_first_name') : document.getElementById('user_login');
    if (focusEl) focusEl.focus();
  }

  document.querySelectorAll('.js-auth-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      showPanel(btn.getAttribute('data-auth-panel'));
    });
  });

  if (location.hash === '#registro' || /[?&]reg_error=/.test(location.search)) showPanel('register');

  document.querySelectorAll('[data-toggle-password]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var input = document.getElementById(btn.getAttribute('data-toggle-password'));
      if (!input) return;
      var show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.textContent = show ? 'ocultar' : 'ver';
      btn.setAttribute('aria-label', show ? 'Ocultar contraseña' : 'Mostrar contraseña');
    });
  });

  if (registerForm) {
    // Evita formularios en caché que aún apuntan a wp-login.php / admin-post.php.
    var safeAction = (window.esitefAuth && window.esitefAuth.loginUrl) || '/ingresar/';
    var currentAction = registerForm.getAttribute('action') || '';
    if (/wp-login\.php|admin-post\.php|\/register\/?/i.test(currentAction)) {
      registerForm.setAttribute('action', safeAction);
      if (!registerForm.querySelector('input[name="action"]')) {
        var actionInput = document.createElement('input');
        actionInput.type = 'hidden';
        actionInput.name = 'action';
        actionInput.value = 'esitef_register';
        registerForm.insertBefore(actionInput, registerForm.firstChild);
      }
    }

    registerForm.addEventListener('submit', function (e) {
      var email = document.getElementById('reg_user_email');
      var pass = document.getElementById('reg_user_pass');
      var confirm = document.getElementById('reg_user_pass_confirm');
      var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      var specialRe = /[^A-Za-z0-9]/;

      [email, pass, confirm].forEach(function (el) {
        if (el) el.setCustomValidity('');
      });

      if (!emailRe.test(email.value.trim())) {
        e.preventDefault();
        email.setCustomValidity('Introduce un email válido (ej. nombre@dominio.com).');
        email.reportValidity();
        return;
      }

      if (pass.value.length <= 8) {
        e.preventDefault();
        pass.setCustomValidity('La contraseña debe tener más de 8 caracteres.');
        pass.reportValidity();
        return;
      }

      if (!specialRe.test(pass.value)) {
        e.preventDefault();
        pass.setCustomValidity('Incluye al menos un carácter especial (ej. ! @ # $ % &).');
        pass.reportValidity();
        return;
      }

      if (pass.value !== confirm.value) {
        e.preventDefault();
        confirm.setCustomValidity('Las contraseñas no coinciden.');
        confirm.reportValidity();
      }
    });
  }

  ['reg_user_email', 'reg_user_pass', 'reg_user_pass_confirm'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', function () {
        this.setCustomValidity('');
      });
    }
  });
})();
