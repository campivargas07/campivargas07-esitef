(function () {
  var topics = document.querySelectorAll('.landing-online-page .landing-curriculum__topic-header');
  topics.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var topic = btn.closest('.landing-curriculum__topic');
      var body = topic.querySelector('.landing-curriculum__topic-body');
      var isActive = topic.classList.contains('active');

      document.querySelectorAll('.landing-online-page .landing-curriculum__topic').forEach(function (t) {
        t.classList.remove('active');
        var b = t.querySelector('.landing-curriculum__topic-body');
        if (b) {
          b.style.maxHeight = null;
        }
        var h = t.querySelector('.landing-curriculum__topic-header');
        if (h) {
          h.setAttribute('aria-expanded', 'false');
        }
      });

      if (!isActive && body) {
        topic.classList.add('active');
        body.style.maxHeight = body.scrollHeight + 'px';
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // ponytail: open first topic on load if none expanded
  var first = document.querySelector('.landing-online-page .landing-curriculum__topic.active .landing-curriculum__topic-body');
  if (first) {
    first.style.maxHeight = first.scrollHeight + 'px';
  }
})();
