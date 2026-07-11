/**
 * ESITEF cart conflict guard — modal before incompatible add-to-cart.
 */
(function () {
  'use strict';

  var cfg = window.esitefCartGuard || {};

  function $(sel, ctx) {
    return (ctx || document).querySelector(sel);
  }

  function parseAddToCartUrl(href) {
    try {
      var url = new URL(href, window.location.origin);
      var productId = url.searchParams.get('add-to-cart');
      if (!productId) {
        return null;
      }
      return {
        productId: parseInt(productId, 10),
        variationId: parseInt(url.searchParams.get('variation_id') || '0', 10),
        href: href,
        url: url
      };
    } catch (e) {
      return null;
    }
  }

  function ensureModal() {
    var existing = $('#esitefCartConflictModal');
    if (existing) {
      return existing;
    }

    var strings = cfg.strings || {};
    var modal = document.createElement('div');
    modal.id = 'esitefCartConflictModal';
    modal.className = 'esitef-cart-conflict-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'esitefCartConflictTitle');
    modal.hidden = true;
    modal.innerHTML =
      '<div class="esitef-cart-conflict-modal__backdrop" data-action="cancel"></div>' +
      '<div class="esitef-cart-conflict-modal__panel esitef-module-card">' +
        '<h2 id="esitefCartConflictTitle" class="esitef-cart-conflict-modal__title"></h2>' +
        '<p class="esitef-cart-conflict-modal__message"></p>' +
        '<div class="esitef-cart-conflict-modal__actions">' +
          '<a href="#" class="cart-continue-btn cart-continue-btn--primary" data-action="complete"></a>' +
          '<a href="#" class="cart-continue-btn" data-action="replace"></a>' +
          '<button type="button" class="cart-back" data-action="save"></button>' +
          '<button type="button" class="cart-back" data-action="cancel"></button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(modal);
    return modal;
  }

  function openModal(parsed, data) {
    var modal = ensureModal();
    var strings = cfg.strings || {};
    var title = $('.esitef-cart-conflict-modal__title', modal);
    var message = $('.esitef-cart-conflict-modal__message', modal);
    var completeBtn = $('[data-action="complete"]', modal);
    var replaceBtn = $('[data-action="replace"]', modal);
    var saveBtn = $('[data-action="save"]', modal);
    var cancelBtn = $('[data-action="cancel"]', modal);

    if (title) {
      title.textContent = strings.title || 'Formas de pago distintas';
    }
    if (message) {
      message.textContent = data.message || '';
    }
    if (completeBtn) {
      completeBtn.textContent = strings.complete || 'Completar compra actual';
      completeBtn.href = data.checkoutUrl || cfg.checkoutUrl || cfg.cartUrl || '#';
    }
    if (replaceBtn) {
      replaceBtn.textContent = strings.replace || 'Reemplazar carrito';
      parsed.url.searchParams.set('esitef_replace_cart', '1');
      replaceBtn.href = parsed.url.toString();
    }
    if (saveBtn) {
      saveBtn.textContent = strings.save || 'Guardar y continuar después';
      saveBtn.hidden = !data.canSave;
      saveBtn.onclick = function () {
        if (!cfg.ajaxUrl || !cfg.nonce) {
          return;
        }
        var body = new FormData();
        body.append('action', 'esitef_cart_stash_pending');
        body.append('nonce', cfg.nonce);
        body.append('product_id', String(data.productId || parsed.productId));
        body.append('variation_id', String(data.variationId || parsed.variationId || 0));
        fetch(cfg.ajaxUrl, { method: 'POST', body: body, credentials: 'same-origin' })
          .then(function (r) { return r.json(); })
          .then(function (res) {
            window.location.href = (res.data && res.data.cartUrl) || cfg.cartUrl || '/';
          });
      };
    }
    if (cancelBtn) {
      cancelBtn.textContent = strings.cancel || 'Cancelar';
    }

    modal.hidden = false;
    document.body.classList.add('esitef-cart-conflict-open');

    modal.onclick = function (e) {
      var target = e.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }
      var action = target.getAttribute('data-action');
      if (action === 'cancel' || target.classList.contains('esitef-cart-conflict-modal__backdrop')) {
        modal.hidden = true;
        document.body.classList.remove('esitef-cart-conflict-open');
      }
    };
  }

  function checkConflict(parsed, e) {
    if (!cfg.ajaxUrl || !cfg.nonce || !parsed.productId) {
      return;
    }

    e.preventDefault();

    var body = new FormData();
    body.append('action', 'esitef_cart_conflict_check');
    body.append('nonce', cfg.nonce);
    body.append('product_id', String(parsed.productId));
    body.append('variation_id', String(parsed.variationId || 0));

    fetch(cfg.ajaxUrl, { method: 'POST', body: body, credentials: 'same-origin' })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (res.success && res.data && res.data.conflict) {
          openModal(parsed, res.data);
          return;
        }
        window.location.href = parsed.href;
      })
      .catch(function () {
        window.location.href = parsed.href;
      });
  }

  function bindLinks() {
    var selector = 'a[href*="add-to-cart="]';
    document.querySelectorAll(selector).forEach(function (link) {
      if (link.dataset.cartGuardBound) {
        return;
      }
      link.dataset.cartGuardBound = '1';
      link.addEventListener('click', function (e) {
        var parsed = parseAddToCartUrl(link.href);
        if (!parsed) {
          return;
        }
        checkConflict(parsed, e);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', bindLinks);
})();
