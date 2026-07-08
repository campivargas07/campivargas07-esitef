/* Formación hub — FAQ accordion y planning tabs */
(function () {
  function bindAccordion(items) {
    items.forEach(function (item) {
      var header = item.querySelector('.accordion-header');
      var content = item.querySelector('.accordion-content');
      if (!header || !content) return;

      header.addEventListener('click', function () {
        var isActive = item.classList.contains('active');

        items.forEach(function (acc) {
          acc.classList.remove('active');
          var h = acc.querySelector('.accordion-header');
          var c = acc.querySelector('.accordion-content');
          if (h) h.setAttribute('aria-expanded', 'false');
          if (c) c.style.maxHeight = '';
        });

        if (!isActive) {
          item.classList.add('active');
          header.setAttribute('aria-expanded', 'true');
          content.style.maxHeight = content.scrollHeight + 'px';
        }
      });
    });
  }

  function bindPlanningTabs() {
    var tabs = document.querySelectorAll('.hub-planning__tab');
    var panels = document.querySelectorAll('.hub-planning__panel');
    if (!tabs.length) return;

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var id = tab.getAttribute('data-planning-tab');
        tabs.forEach(function (t) {
          t.classList.remove('is-active');
          t.setAttribute('aria-selected', 'false');
        });
        panels.forEach(function (p) {
          var match = p.getAttribute('data-planning-panel') === id;
          p.classList.toggle('is-active', match);
          if (match) {
            p.removeAttribute('hidden');
          } else {
            p.setAttribute('hidden', '');
          }
        });
        tab.classList.add('is-active');
        tab.setAttribute('aria-selected', 'true');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.accordion-container').forEach(function (container) {
      bindAccordion(container.querySelectorAll('.accordion-item'));
    });
    bindPlanningTabs();
  });
})();
