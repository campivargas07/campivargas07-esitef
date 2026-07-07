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
  var mobileMq = window.matchMedia('(max-width: 991px)');
  var tabList = root.querySelector('.pais-tabs');
  var grid = root.querySelector('.pais-grid');
  var stackExpanded = true; // al cargar, lista completa; se pliega tras la primera selección

  function syncMultiLayout() {
    if (!grid) return;
    var activePanel = root.querySelector('.pais-sede-panel.is-active.pais-sede-panel--multi');
    grid.classList.toggle('pais-grid--courses-multi', Boolean(activePanel));
  }

  /* En mobile, la sede activa sube al tope y las demás se apilan como cartas debajo. */
  function updateStack(animate) {
    var activeIndex = -1;
    tabs.forEach(function (tab, i) {
      if (tab.classList.contains('is-active')) {
        activeIndex = i;
      }
    });

    var collapse = mobileMq.matches && !stackExpanded && activeIndex > -1;

    var firstTop = null;
    if (animate) {
      firstTop = [];
      tabs.forEach(function (tab, i) {
        firstTop[i] = tab.getBoundingClientRect().top;
      });
    }

    if (collapse) {
      tabList.style.setProperty('--pais-tab-h', tabs[activeIndex].offsetHeight + 'px');
    }

    var depth = 0;
    tabs.forEach(function (tab, i) {
      var stacked = collapse && i !== activeIndex;
      tab.classList.toggle('is-stacked', stacked);
      if (stacked) {
        depth += 1;
        tab.style.order = String(depth);
        tab.style.setProperty('--stack-i', String(depth));
        tab.style.zIndex = String(tabs.length - depth);
      } else {
        tab.style.order = collapse ? '0' : '';
        tab.style.removeProperty('--stack-i');
        tab.style.zIndex = collapse ? String(tabs.length + 1) : '';
      }
    });

    if (animate) {
      // FLIP: compensa el reordenamiento para que el movimiento sea continuo.
      tabs.forEach(function (tab, i) {
        var dy = firstTop[i] - tab.getBoundingClientRect().top;
        if (dy) {
          tab.style.transition = 'none';
          tab.style.transform = 'translateY(' + dy + 'px)';
        }
      });
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          tabs.forEach(function (tab) {
            tab.style.transition = '';
            tab.style.transform = '';
          });
        });
      });
    }
  }

  function activate(slug) {
    tabs.forEach(function (tab) {
      var on = tab.dataset.sede === slug;
      tab.classList.toggle('is-active', on);
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
    });

    updateStack(true);

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

    syncMultiLayout();
  }

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      if (mobileMq.matches) {
        // Tocar la pila (o el botón activo) expande/colapsa la lista sin cambiar de sede.
        if (tab.classList.contains('is-stacked')) {
          stackExpanded = true;
          updateStack(true);
          return;
        }
        if (tab.classList.contains('is-active')) {
          stackExpanded = !stackExpanded;
          updateStack(true);
          return;
        }
      }
      if (tab.classList.contains('is-active')) return;
      stackExpanded = false;
      activate(tab.dataset.sede);
    });
  });

  mobileMq.addEventListener('change', function () {
    updateStack(false);
  });
  updateStack(false);
  syncMultiLayout();
})();
