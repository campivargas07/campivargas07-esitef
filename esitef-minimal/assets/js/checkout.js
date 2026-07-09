/**
 * ESITEF Polar checkout interactions.
 */
(function () {
  'use strict';

  var cfg = window.esitefCheckout || {};

  function $(sel, ctx) {
    return (ctx || document).querySelector(sel);
  }

  function $all(sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  }

  function postPlanSwitch(instance, plan) {
    if (!cfg.ajaxUrl || !cfg.nonce) {
      return Promise.reject();
    }
    var body = new FormData();
    body.append('action', 'esitef_presencial_switch_plan');
    body.append('nonce', cfg.nonce);
    body.append('instance', instance);
    body.append('plan', plan);
    return fetch(cfg.ajaxUrl, { method: 'POST', body: body, credentials: 'same-origin' })
      .then(function (r) { return r.json(); });
  }

  function initPlanSelector() {
    var block = $('.checkout-plan-block[data-presencial-instance]');
    if (!block) {
      return;
    }
    var instance = block.getAttribute('data-presencial-instance');
    $all('.checkout-plan', block).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var plan = btn.getAttribute('data-plan');
        if (!plan || btn.classList.contains('checkout-plan--selected')) {
          return;
        }
        block.classList.add('is-loading');
        postPlanSwitch(instance, plan)
          .then(function (res) {
            if (res.success && res.data && res.data.redirect) {
              window.location.href = res.data.redirect;
              return;
            }
            window.location.reload();
          })
          .catch(function () {
            block.classList.remove('is-loading');
          });
      });
    });
  }

  function gatewayGroup(gatewayId) {
    var id = String(gatewayId || '');
    // PayPal card fields = Tarjeta tab, not PayPal redirect
    if (id.indexOf('credit-card') !== -1 || id.indexOf('card-button') !== -1) {
      return 'card';
    }
    if (id.indexOf('mercado') !== -1) {
      return 'mercadopago';
    }
    if (id === 'ppcp-gateway' || id === 'paypal' || id === 'ppec_paypal' || (id.indexOf('paypal') !== -1 && id.indexOf('card') === -1)) {
      return 'paypal';
    }
    if (id.indexOf('stripe') !== -1 || id === 'cod' || id === 'cheque' || id === 'bacs' || id.indexOf('woocommerce_payments') !== -1) {
      return 'card';
    }
    return 'card';
  }

  function setMethodClass(group) {
    var form = $('.polar-checkout');
    if (!form) {
      return;
    }
    form.classList.remove('method-card', 'method-paypal', 'method-mercadopago');
    form.classList.add('method-' + group);
  }

  function hidePayPalChrome() {
    $all('.ppc-button-wrapper, [id^="ppc-button-"], .ppcp-messages').forEach(function (el) {
      el.style.display = 'none';
    });
    var place = $('#place_order');
    if (place) {
      place.style.display = 'flex';
      place.style.visibility = 'visible';
      place.textContent = 'Pagar ahora';
      place.value = 'Pagar ahora';
    }
  }

  function rebuildTabs() {
    if (!cfg.isCheckout) {
      return;
    }

    var tabsHost = $('.checkout-method-tabs');
    var paymentList = $('#payment .payment_methods');
    if (!tabsHost || !paymentList) {
      return;
    }

    tabsHost.innerHTML = '';
    tabsHost.classList.remove('is-enhanced');

    var items = $all('li.wc_payment_method', paymentList);
    if (!items.length) {
      return;
    }

    var groupsPresent = {};
    items.forEach(function (li) {
      var input = $('input[name="payment_method"]', li);
      if (!input) {
        return;
      }
      groupsPresent[gatewayGroup(input.value)] = true;
    });

    var tabOrder = cfg.useMercadoPago
      ? ['mercadopago', 'card']
      : ['card', 'paypal'];

    var labels = cfg.labels || {
      card: 'Tarjeta',
      paypal: 'PayPal',
      mercadopago: 'Mercado Pago'
    };

    var icons = {
      card: '💳',
      paypal: 'P',
      mercadopago: 'MP'
    };

    tabOrder.forEach(function (group) {
      if (!groupsPresent[group]) {
        return;
      }
      var tab = document.createElement('button');
      tab.type = 'button';
      tab.className = 'polar-tab checkout-method-tab';
      tab.setAttribute('data-gateway-group', group);
      tab.setAttribute('role', 'radio');
      tab.setAttribute('aria-checked', 'false');
      tab.innerHTML = '<span class="polar-tab__icon">' + (icons[group] || '') + '</span> ' + (labels[group] || group);
      tabsHost.appendChild(tab);
    });

    if (!tabsHost.children.length && items.length) {
      var fallback = document.createElement('button');
      fallback.type = 'button';
      fallback.className = 'polar-tab checkout-method-tab';
      fallback.setAttribute('data-gateway-group', 'card');
      fallback.innerHTML = '<span class="polar-tab__icon">💳</span> ' + (labels.card || 'Tarjeta');
      tabsHost.appendChild(fallback);
    }

    if (!tabsHost.children.length) {
      return;
    }

    tabsHost.classList.add('is-enhanced');
    var form = $('.polar-checkout');
    if (form) {
      form.classList.add('tabs-ready');
    }

    function selectGroup(group) {
      $all('.checkout-method-tab', tabsHost).forEach(function (t) {
        var active = t.getAttribute('data-gateway-group') === group;
        t.classList.toggle('is-active', active);
        t.classList.toggle('polar-tab--active', active);
        t.setAttribute('aria-checked', active ? 'true' : 'false');
      });
      items.forEach(function (li) {
        var input = $('input[name="payment_method"]', li);
        if (!input) {
          return;
        }
        var match = gatewayGroup(input.value) === group;
        li.style.display = match ? '' : 'none';
        if (match && !input.checked) {
          input.checked = true;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
      setMethodClass(group);
      hidePayPalChrome();
    }

    $all('.checkout-method-tab', tabsHost).forEach(function (tab, idx) {
      tab.addEventListener('click', function (e) {
        e.preventDefault();
        selectGroup(tab.getAttribute('data-gateway-group'));
      });
      if (idx === 0) {
        selectGroup(tab.getAttribute('data-gateway-group'));
      }
    });

    hidePayPalChrome();
  }

  function initStickyPay() {
    if (!cfg.isCheckout) {
      return;
    }
    var stickyBtn = $('.checkout-summary-bar__submit');
    var placeOrder = $('#place_order');
    if (!stickyBtn || !placeOrder) {
      return;
    }
    stickyBtn.disabled = false;
    stickyBtn.addEventListener('click', function (e) {
      e.preventDefault();
      placeOrder.click();
    });
  }

  function initCouponToggle() {
    var btn = $('#polarCouponToggle');
    var wrap = $('#polarCouponWrap');
    if (!btn || !wrap) {
      return;
    }
    btn.addEventListener('click', function () {
      var open = wrap.hasAttribute('hidden');
      if (open) {
        wrap.removeAttribute('hidden');
        btn.setAttribute('aria-expanded', 'true');
        var input = $('#coupon_code', wrap);
        if (input) {
          input.focus();
        }
      } else {
        wrap.setAttribute('hidden', '');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  function initCheckoutLoading() {
    if (!cfg.isCheckout || !window.jQuery) {
      return;
    }
    jQuery(document.body).on('checkout_place_order', function () {
      var btn = $('#place_order');
      if (btn) {
        btn.setAttribute('aria-busy', 'true');
        btn.classList.add('is-loading');
      }
    });
  }

  function reorderBillingFields() {
    var billing = $('.woocommerce-billing-fields__field-wrapper');
    if (!billing) {
      return;
    }
    var email = $('#billing_email_field');
    if (email && email.parentNode === billing) {
      billing.insertBefore(email, billing.firstChild);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    initPlanSelector();
    reorderBillingFields();
    rebuildTabs();
    initStickyPay();
    initCouponToggle();
    initCheckoutLoading();
    hidePayPalChrome();

    if (window.jQuery && cfg.isCheckout) {
      jQuery(document.body).on('updated_checkout', function () {
        rebuildTabs();
        initStickyPay();
        reorderBillingFields();
        hidePayPalChrome();
      });
    }

    // PayPal injects buttons async — keep killing them
    var observer = new MutationObserver(function () {
      hidePayPalChrome();
    });
    var payment = $('#payment');
    if (payment) {
      observer.observe(payment, { childList: true, subtree: true });
    }
  });
})();
