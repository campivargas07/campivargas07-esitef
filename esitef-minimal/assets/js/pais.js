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

  // ponytail: en mobile, permitir swipe horizontal sin activar el enlace
  root.querySelectorAll('.pais-courses-scroll').forEach(function (track) {
    var startX = 0;
    var startY = 0;
    var moved = false;

    track.addEventListener(
      'touchstart',
      function (e) {
        if (!e.touches[0]) return;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        moved = false;
      },
      { passive: true }
    );

    track.addEventListener(
      'touchmove',
      function (e) {
        if (!e.touches[0]) return;
        var dx = Math.abs(e.touches[0].clientX - startX);
        var dy = Math.abs(e.touches[0].clientY - startY);
        if (dx > dy && dx > 8) {
          moved = true;
        }
      },
      { passive: true }
    );

    track.addEventListener('click', function (e) {
      if (!moved) return;
      var link = e.target.closest('.pais-course-card');
      if (link) {
        e.preventDefault();
      }
    });
  });
})();
