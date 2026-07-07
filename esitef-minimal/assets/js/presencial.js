(function () {
  function bindAccordion(items, closeOthers) {
    items.forEach(function (item) {
      var header = item.querySelector('.accordion-header');
      var content = item.querySelector('.accordion-content');
      if (!header || !content) return;

      header.addEventListener('click', function () {
        var isActive = item.classList.contains('active');

        if (closeOthers) {
          items.forEach(function (acc) {
            acc.classList.remove('active');
            var h = acc.querySelector('.accordion-header');
            var c = acc.querySelector('.accordion-content');
            if (h) h.setAttribute('aria-expanded', 'false');
            if (c) c.style.maxHeight = null;
          });
        }

        if (isActive) {
          item.classList.remove('active');
          header.setAttribute('aria-expanded', 'false');
          content.style.maxHeight = null;
          return;
        }

        if (!closeOthers || !isActive) {
          item.classList.add('active');
          header.setAttribute('aria-expanded', 'true');
          content.style.maxHeight = content.scrollHeight + 'px';
        }
      });
    });
  }

  function bindTeacherAccordions() {
    var items = document.querySelectorAll('.presencial-page .teacher-card.accordion-item');
    var mq = window.matchMedia('(max-width: 991px)');

    function syncDesktopState() {
      if (mq.matches) return;

      items.forEach(function (item) {
        var header = item.querySelector('.accordion-header');
        var content = item.querySelector('.accordion-content');
        item.classList.remove('active');
        if (header) header.setAttribute('aria-expanded', 'true');
        if (content) content.style.maxHeight = null;
      });
    }

    items.forEach(function (item) {
      var header = item.querySelector('.accordion-header');
      var content = item.querySelector('.accordion-content');
      if (!header || !content) return;

      header.addEventListener('click', function () {
        if (!mq.matches) return;

        var isActive = item.classList.contains('active');

        if (isActive) {
          item.classList.remove('active');
          header.setAttribute('aria-expanded', 'false');
          content.style.maxHeight = null;
          return;
        }

        item.classList.add('active');
        header.setAttribute('aria-expanded', 'true');
        content.style.maxHeight = content.scrollHeight + 'px';
      });
    });

    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', syncDesktopState);
    } else if (typeof mq.addListener === 'function') {
      mq.addListener(syncDesktopState);
    }

    syncDesktopState();
  }

  bindAccordion(
    document.querySelectorAll('.presencial-page .course-syllabus .accordion-item'),
    true
  );

  bindTeacherAccordions();

  function bindInscriptionModal() {
    var modal = document.querySelector('.presencial-inscribe');
    if (!modal) return;

    var openers = document.querySelectorAll('.js-presencial-inscribe, a[href="#inscribirme"]');
    var closers = modal.querySelectorAll('[data-presencial-close]');
    var dialog = modal.querySelector('.presencial-inscribe__dialog');

    function openModal(event) {
      if (event) event.preventDefault();
      modal.hidden = false;
      modal.setAttribute('aria-hidden', 'false');
      modal.classList.add('is-open');
      document.body.classList.add('presencial-inscribe-open');
    }

    function closeModal() {
      modal.hidden = true;
      modal.setAttribute('aria-hidden', 'true');
      modal.classList.remove('is-open');
      document.body.classList.remove('presencial-inscribe-open');
    }

    openers.forEach(function (btn) {
      btn.addEventListener('click', openModal);
    });

    closers.forEach(function (btn) {
      btn.addEventListener('click', closeModal);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && modal.classList.contains('is-open')) {
        closeModal();
      }
    });

    if (dialog) {
      modal.addEventListener('click', function (event) {
        if (!dialog.contains(event.target)) {
          closeModal();
        }
      });
    }
  }

  bindInscriptionModal();
})();
