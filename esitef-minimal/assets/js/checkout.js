/**
 * ESITEF Polar checkout interactions.
 */
(function () {
  'use strict';

  var cfg = window.esitefCheckout || {};
  var lastSelectedGroup = null;
  var lastGroupsFingerprint = '';
  var tabsEnhanced = false;
  var isEnhancingTabs = false;
  var stickyPayBound = false;
  var paypalHideTimer = null;
  var paypalObserver = null;

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

  function debouncedHidePayPalChrome() {
    if (paypalHideTimer) {
      clearTimeout(paypalHideTimer);
    }
    paypalHideTimer = setTimeout(hidePayPalChrome, 150);
  }

  function getPaymentItems() {
    var paymentList = $('#payment .payment_methods');
    if (!paymentList) {
      return [];
    }
    return $all('li.wc_payment_method', paymentList);
  }

  function collectGroupsPresent(items) {
    var groupsPresent = {};
    items.forEach(function (li) {
      var input = $('input[name="payment_method"]', li);
      if (!input) {
        return;
      }
      groupsPresent[gatewayGroup(input.value)] = true;
    });
    return groupsPresent;
  }

  function groupsFingerprint(groupsPresent) {
    return Object.keys(groupsPresent).sort().join(',');
  }

  function getCheckedGroup(items) {
    var checked = $('input[name="payment_method"]:checked');
    if (checked) {
      return gatewayGroup(checked.value);
    }
    for (var i = 0; i < items.length; i++) {
      var input = $('input[name="payment_method"]', items[i]);
      if (input) {
        return gatewayGroup(input.value);
      }
    }
    return null;
  }

  function applyGroupSelection(group, items, options) {
    options = options || {};
    var fireChange = options.fireChange !== false;
    var changed = false;

    $all('.checkout-method-tab').forEach(function (t) {
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
        changed = true;
        if (fireChange) {
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    });

    lastSelectedGroup = group;
    setMethodClass(group);
    debouncedHidePayPalChrome();
    return changed;
  }

  function syncTabsAfterUpdate() {
    if (!tabsEnhanced) {
      rebuildTabs(true);
      return;
    }

    var items = getPaymentItems();
    if (!items.length) {
      return;
    }

    var fingerprint = groupsFingerprint(collectGroupsPresent(items));
    if (fingerprint !== lastGroupsFingerprint) {
      rebuildTabs(true);
      return;
    }

    var group = lastSelectedGroup || getCheckedGroup(items);
    if (group) {
      applyGroupSelection(group, items, { fireChange: false });
    }
    debouncedHidePayPalChrome();
  }

  function rebuildTabs(force) {
    if (!cfg.isCheckout || isEnhancingTabs) {
      return;
    }

    var tabsHost = $('.checkout-method-tabs');
    var items = getPaymentItems();
    if (!tabsHost || !items.length) {
      return;
    }

    var groupsPresent = collectGroupsPresent(items);
    var fingerprint = groupsFingerprint(groupsPresent);

    if (!force && tabsEnhanced && fingerprint === lastGroupsFingerprint) {
      syncTabsAfterUpdate();
      return;
    }

    isEnhancingTabs = true;
    lastGroupsFingerprint = fingerprint;

    tabsHost.innerHTML = '';
    tabsHost.classList.remove('is-enhanced');

    var tabOrder = cfg.useMercadoPago
      ? ['mercadopago', 'card', 'paypal']
      : ['card', 'paypal', 'mercadopago'];

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

    if (!tabsHost.children.length) {
      var fallback = document.createElement('button');
      fallback.type = 'button';
      fallback.className = 'polar-tab checkout-method-tab';
      fallback.setAttribute('data-gateway-group', 'card');
      fallback.innerHTML = '<span class="polar-tab__icon">💳</span> ' + (labels.card || 'Tarjeta');
      tabsHost.appendChild(fallback);
    }

    if (!tabsHost.children.length) {
      isEnhancingTabs = false;
      return;
    }

    tabsHost.classList.add('is-enhanced');
    tabsEnhanced = true;

    var form = $('.polar-checkout');
    if (form) {
      form.classList.add('tabs-ready');
    }

    var initialGroup = lastSelectedGroup && groupsPresent[lastSelectedGroup]
      ? lastSelectedGroup
      : (tabOrder.find(function (g) { return groupsPresent[g]; }) || 'card');

    $all('.checkout-method-tab', tabsHost).forEach(function (tab) {
      tab.addEventListener('click', function (e) {
        e.preventDefault();
        var group = tab.getAttribute('data-gateway-group');
        if (!group || group === lastSelectedGroup) {
          return;
        }
        applyGroupSelection(group, getPaymentItems(), { fireChange: true });
      });
    });

    var isInitial = lastSelectedGroup === null;
    applyGroupSelection(initialGroup, items, { fireChange: !isInitial && initialGroup !== getCheckedGroup(items) });
    isEnhancingTabs = false;
  }

  function initStickyPay() {
    if (!cfg.isCheckout || stickyPayBound) {
      return;
    }
    var stickyBtn = $('.checkout-summary-bar__submit');
    var placeOrder = $('#place_order');
    if (!stickyBtn || !placeOrder) {
      return;
    }
    stickyPayBound = true;
    stickyBtn.disabled = false;
    stickyBtn.addEventListener('click', function (e) {
      e.preventDefault();
      placeOrder.click();
    });
  }

  function initCouponToggle() {
    var btn = $('#polarCouponToggle');
    var wrap = $('#polarCouponWrap');
    if (!btn || !wrap || btn.dataset.bound) {
      return;
    }
    btn.dataset.bound = '1';
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
    if (!cfg.isCheckout || !window.jQuery || document.body.dataset.checkoutLoadingBound) {
      return;
    }
    document.body.dataset.checkoutLoadingBound = '1';
    jQuery(document.body).on('checkout_place_order', function () {
      var btn = $('#place_order');
      if (btn) {
        btn.setAttribute('aria-busy', 'true');
        btn.classList.add('is-loading');
      }
    });
  }

  function initPolarErrorBanner() {
    var banner = $('#polarErrorBanner');
    var notices = $('.woocommerce-NoticeGroup-checkout');
    if (!banner || !notices) {
      return;
    }
    var errors = $all('.woocommerce-error li', notices);
    if (errors.length) {
      banner.textContent = errors.map(function (el) { return el.textContent.trim(); }).join(' ');
      banner.classList.add('is-visible');
      notices.style.display = 'none';
    }
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

  function initPayPalObserver() {
    if (cfg.localCodOnly) {
      return;
    }
    var payment = $('#payment');
    if (!payment || paypalObserver) {
      return;
    }
    paypalObserver = new MutationObserver(function () {
      debouncedHidePayPalChrome();
    });
    paypalObserver.observe(payment, { childList: true, subtree: true });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initPlanSelector();
    reorderBillingFields();
    rebuildTabs(true);
    initStickyPay();
    initCouponToggle();
    initCheckoutLoading();
    initPolarErrorBanner();
    hidePayPalChrome();
    initPayPalObserver();

    if (window.jQuery && cfg.isCheckout) {
      jQuery(document.body).on('updated_checkout', function () {
        syncTabsAfterUpdate();
        reorderBillingFields();
        initPolarErrorBanner();
      });
    }
  });
})();
