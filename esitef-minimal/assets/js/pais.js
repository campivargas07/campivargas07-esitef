/**
 * País — tabs ciudades + panel de cursos (estilo Grovia).
 */
(function () {
  'use strict';

  var root = document.querySelector('.pais-stage');
  if (!root) return;

  var tabs = root.querySelectorAll('.pais-tab');
  var panels = root.querySelectorAll('.pais-sede-panel');
  if (!tabs.length || !panels.length) return;

  var duration = 320;

  function activate(slug) {
    tabs.forEach(function (tab) {
      var on = tab.dataset.sede === slug;
      tab.classList.toggle('is-active', on);
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
    });

    panels.forEach(function (panel) {
      var on = panel.dataset.sede === slug;
      if (on) {
        panel.removeAttribute('hidden');
        requestAnimationFrame(function () {
          panel.classList.add('is-active');
        });
      } else {
        panel.classList.remove('is-active');
        window.setTimeout(function () {
          if (!panel.classList.contains('is-active')) {
            panel.setAttribute('hidden', '');
          }
        }, duration);
      }
    });
  }

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      if (tab.classList.contains('is-active')) return;
      activate(tab.dataset.sede);
    });
  });
})();
