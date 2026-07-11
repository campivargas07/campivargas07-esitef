(function () {
  var dataEl = document.getElementById('presencial-reserve-data');
  var form = document.querySelector('[data-presencial-reserve-form]');
  if (!dataEl || !form) return;

  var config = {};
  try {
    config = JSON.parse(dataEl.textContent || '{}');
  } catch (e) {
    return;
  }

  var successEl = form.querySelector('[data-presencial-reserve-success]');

  function buildMessage(fields) {
    var lines = [
      'Hola, quiero reservar plaza en: ' + (config.course || ''),
      'Nombre: ' + fields.name,
      'Email: ' + fields.email,
      'Teléfono: ' + fields.phone
    ];
    if (config.deposit) {
      lines.push('Depósito: ' + config.deposit);
    }
    if (config.concept) {
      lines.push('Concepto transferencia: ' + config.concept);
    }
    return lines.join('\n');
  }

  function openContact(message) {
    if (config.whatsappUrl) {
      var base = config.whatsappUrl.split('?')[0];
      window.open(base + '?text=' + encodeURIComponent(message), '_blank', 'noopener,noreferrer');
      return;
    }

    if (config.emailUrl) {
      window.location.href = config.emailUrl + (config.emailUrl.indexOf('?') >= 0 ? '&' : '?') + 'body=' + encodeURIComponent(message);
      return;
    }

    var email = config.contactEmail || 'info@esitef.com';
    var subject = encodeURIComponent('Reserva presencial — ' + (config.course || ''));
    window.location.href = 'mailto:' + email + '?subject=' + subject + '&body=' + encodeURIComponent(message);
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    var name = (form.querySelector('[name="name"]') || {}).value || '';
    var email = (form.querySelector('[name="email"]') || {}).value || '';
    var phone = (form.querySelector('[name="phone"]') || {}).value || '';

    name = name.trim();
    email = email.trim();
    phone = phone.trim();

    if (!name || !email || !phone) {
      form.reportValidity();
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      var emailInput = form.querySelector('[name="email"]');
      if (emailInput) emailInput.setCustomValidity('Email inválido');
      form.reportValidity();
      if (emailInput) emailInput.setCustomValidity('');
      return;
    }

    openContact(buildMessage({ name: name, email: email, phone: phone }));

    if (successEl) {
      successEl.hidden = false;
    }
    form.querySelector('.presencial-reserve__submit').disabled = true;
  });
})();
