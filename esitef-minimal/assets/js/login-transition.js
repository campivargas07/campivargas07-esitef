/* ESITEF — transición difuminada hacia login */
(function () {
  var DURATION = 520;
  var KEY = 'esitef-login-transition';
  var RETURN_KEY = 'esitef-login-return';

  function isLoginPath(path) {
    return /login\.html$/i.test(path) || /\/ingresar\/?$/i.test(path);
  }

  function isLoginPage() {
    return isLoginPath(location.pathname);
  }

  function isLoginLink(link) {
    if (!link || link.tagName !== 'A') return false;
    if (link.target === '_blank') return false;
    var href = (link.getAttribute('href') || '').trim();
    return link.classList.contains('js-login-link')
      || href === 'login.html'
      || /\/login\.html$/.test(href)
      || /\/ingresar\/?$/.test(href);
  }

  function getLoginBaseUrl() {
    return (window.esitefAuth && window.esitefAuth.loginUrl) || '/ingresar/';
  }

  function buildLoginUrl(returnUrl) {
    var url = new URL(getLoginBaseUrl(), location.origin);
    if (returnUrl) {
      url.searchParams.set('redirect_to', returnUrl);
    }
    return url.href;
  }

  function isTutorLoginTrigger(el) {
    return el && el.classList && el.classList.contains('esitef-tutor-login-redirect');
  }

  function runExitTransition(url) {
    if (document.querySelector('.login-transition-veil')) return;

    var veil = document.createElement('div');
    veil.className = 'login-transition-veil';
    veil.setAttribute('aria-hidden', 'true');
    document.body.appendChild(veil);

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        veil.classList.add('login-transition-veil--active');
      });
    });

    setTimeout(function () {
      window.location.href = url;
    }, DURATION);
  }

  function resolveReturnUrl() {
    var closeBtn = document.getElementById('login-close');
    var fallback = (closeBtn && closeBtn.getAttribute('data-fallback')) || '/';

    var stored = sessionStorage.getItem(RETURN_KEY);
    sessionStorage.removeItem(RETURN_KEY);
    sessionStorage.removeItem(KEY);

    if (stored) {
      try {
        var storedUrl = new URL(stored, location.origin);
        if (storedUrl.origin === location.origin && !isLoginPath(storedUrl.pathname)) {
          return storedUrl.href;
        }
      } catch (err) { /* ponytail: URL inválida → fallback */ }
    }

    if (document.referrer) {
      try {
        var ref = new URL(document.referrer);
        if (ref.origin === location.origin && !isLoginPath(ref.pathname)) {
          return ref.href;
        }
      } catch (err) { /* same */ }
    }

    return fallback;
  }

  function closeLoginPage() {
    window.location.href = resolveReturnUrl();
  }

  document.addEventListener('click', function (e) {
    var tutorBtn = e.target.closest('.esitef-tutor-login-redirect, .tutor-open-login-modal');
    if (tutorBtn) {
      e.preventDefault();
      sessionStorage.setItem(KEY, '1');
      sessionStorage.setItem(RETURN_KEY, location.href);
      runExitTransition(buildLoginUrl(location.href));
      return;
    }

    var link = e.target.closest('a');
    if (!isLoginLink(link)) return;
    e.preventDefault();
    sessionStorage.setItem(KEY, '1');
    sessionStorage.setItem(RETURN_KEY, location.href);
    runExitTransition(link.href);
  });

  if (isLoginPage()) {
    if (sessionStorage.getItem(KEY)) {
      sessionStorage.removeItem(KEY);
      document.documentElement.classList.add('login-transition-enter');
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          document.documentElement.classList.add('login-transition-enter--done');
        });
      });
    }

    var closeBtn = document.getElementById('login-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeLoginPage);
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeLoginPage();
      });
    }
  }
})();
