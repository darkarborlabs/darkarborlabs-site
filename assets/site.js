/* Dark Arbor Labs: Products menu, catalog grid and store buttons.
   Everything is driven by /assets/products.json, so adding a product is one JSON entry
   plus a page under /products/<slug>/. Pages stay readable without JS: the nav's
   "Products" item is a normal link to /products/. */
(function () {
  'use strict';

  document.documentElement.classList.add('js');

  var PLATFORMS = {
    ios:     'iPhone & iPad',
    mac:     'Mac',
    watch:   'Apple Watch',
    android: 'Android',
    wear:    'Wear OS',
    web:     'Web'
  };

  // Official badge artwork must come from Apple / Google (see README in assets/badges).
  var BADGES = {
    ios:     { src: '/assets/badges/app-store.svg',  alt: 'Download on the App Store' },
    android: { src: '/assets/badges/google-play.png', alt: 'Get it on Google Play' }
  };

  var STATUS_LABEL = { 'coming-soon': 'Coming soon' };

  function h(tag, attrs, children) {
    var el = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'text') el.textContent = attrs[k];
      else if (attrs[k] !== null && attrs[k] !== undefined) el.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) el.appendChild(c); });
    return el;
  }

  function platformsOf(p) { return Object.keys(p.stores || {}); }
  function platformLabel(key) { return PLATFORMS[key] || key; }

  var productsPromise = fetch('/assets/products.json')
    .then(function (r) { return r.json(); })
    .then(function (d) { return d.products || []; })
    .catch(function () { return []; });

  function statusTag(p) {
    var label = STATUS_LABEL[p.status];
    return label ? h('span', { 'class': 'tag soon', text: label }) : null;
  }

  /* ── Nav: Products menu ── */
  function buildMenu(products) {
    var li = document.querySelector('.nav-products');
    if (!li || !products.length) return;

    var caret = h('button', {
      'class': 'nav-caret', type: 'button', 'aria-expanded': 'false',
      'aria-controls': 'products-menu', 'aria-label': 'Products menu'
    });
    caret.innerHTML = '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M1.5 3.5 5 7l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    var panel = h('div', { 'class': 'products-menu', id: 'products-menu', role: 'group', 'aria-label': 'Products' });

    // With a bigger catalog, group by category so the menu stays scannable.
    var categories = [];
    products.forEach(function (p) { if (categories.indexOf(p.category) === -1) categories.push(p.category); });
    var grouped = products.length > 5 && categories.length > 1;

    if (grouped) {
      categories.forEach(function (cat) {
        panel.appendChild(h('div', { 'class': 'menu-group-label', text: cat }));
        products.filter(function (p) { return p.category === cat; }).forEach(function (p) {
          panel.appendChild(menuItem(p));
        });
      });
    } else {
      products.forEach(function (p) { panel.appendChild(menuItem(p)); });
    }

    panel.appendChild(h('a', { 'class': 'menu-all', href: '/products/' }, [
      h('span', { text: 'All products' }), h('span', { 'aria-hidden': 'true', text: '→' })
    ]));

    li.appendChild(caret);
    li.appendChild(panel);
    wireMenu(li, caret);
  }

  function menuItem(p) {
    var name = h('span', { 'class': 'menu-item-name' }, [h('span', { text: p.name }), statusTag(p)]);
    var a = h('a', { 'class': 'menu-item', href: p.url }, [
      h('img', { src: p.icon, alt: '', width: '40', height: '40', loading: 'lazy' }),
      h('span', { 'class': 'menu-item-text' }, [name, h('span', { 'class': 'menu-item-desc', text: p.tagline })])
    ]);
    if (location.pathname.indexOf(p.url) === 0) a.setAttribute('aria-current', 'page');
    return a;
  }

  function wireMenu(li, caret) {
    var closeTimer;
    var canHover = window.matchMedia('(hover: hover) and (pointer: fine)');

    function set(open) {
      clearTimeout(closeTimer);
      if (!open) hoverOpened = false;
      li.classList.toggle('open', open);
      caret.setAttribute('aria-expanded', String(open));
    }

    // Hover opens the menu on desktop; a click that lands right after that hover should
    // keep it open (pin it) rather than toggling it shut.
    var hoverOpened = false;

    caret.addEventListener('click', function () {
      if (hoverOpened) { hoverOpened = false; return; }
      set(!li.classList.contains('open'));
    });

    li.addEventListener('mouseenter', function () {
      if (canHover.matches) { hoverOpened = !li.classList.contains('open'); set(true); }
    });
    li.addEventListener('mouseleave', function () {
      if (canHover.matches) closeTimer = setTimeout(function () { set(false); }, 150);
    });

    li.addEventListener('focusout', function (e) {
      if (!li.contains(e.relatedTarget)) set(false);
    });

    document.addEventListener('click', function (e) { if (!li.contains(e.target)) set(false); });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && li.classList.contains('open')) {
        set(false);
        caret.focus();
      }
    });
  }

  /* ── Store buttons ── */
  function storeButtons(product) {
    var wrap = h('div', { 'class': 'stores' });
    platformsOf(product).forEach(function (key) {
      var store = product.stores[key];
      var badge = BADGES[key];
      if (store.url && badge) {
        wrap.appendChild(h('a', { 'class': 'store-badge', href: store.url, rel: 'noopener' }, [
          h('img', { src: badge.src, alt: badge.alt, height: '48' })
        ]));
      } else if (store.url) {
        wrap.appendChild(h('a', { 'class': 'store-link', href: store.url, rel: 'noopener', text: platformLabel(key) }));
      } else {
        wrap.appendChild(h('span', { 'class': 'store-soon', text: platformLabel(key) + ' · coming soon' }));
      }
    });
    return wrap;
  }

  function buildStores(products) {
    document.querySelectorAll('[data-stores]').forEach(function (slot) {
      var p = products.filter(function (x) { return x.slug === slot.getAttribute('data-stores'); })[0];
      if (p) slot.replaceChildren(storeButtons(p));
    });
  }

  /* ── Catalog grid (/products/) ── */
  function buildCatalog(products) {
    var grid = document.getElementById('product-grid');
    if (!grid) return;
    var filters = document.getElementById('product-filters');

    function render(platform) {
      grid.replaceChildren.apply(grid, products
        .filter(function (p) { return !platform || platformsOf(p).indexOf(platform) !== -1; })
        .map(function (p) {
          return h('a', { 'class': 'product-card', href: p.url }, [
            h('img', { 'class': 'product-card-icon', src: p.icon, alt: '', width: '72', height: '72' }),
            h('div', { 'class': 'product-card-body' }, [
              h('div', { 'class': 'product-card-head' }, [h('h3', { text: p.name }), statusTag(p)]),
              h('p', { 'class': 'product-card-tagline', text: p.tagline }),
              h('p', { 'class': 'product-card-summary', text: p.summary }),
              h('div', { 'class': 'product-card-platforms' }, platformsOf(p).map(function (k) {
                return h('span', { 'class': 'tag', text: platformLabel(k) });
              }))
            ])
          ]);
        }));
    }

    render(null);

    // A platform filter only earns its space once there is something to filter.
    var platforms = [];
    products.forEach(function (p) {
      platformsOf(p).forEach(function (k) { if (platforms.indexOf(k) === -1) platforms.push(k); });
    });
    if (filters && products.length >= 4 && platforms.length > 1) {
      var buttons = [null].concat(platforms).map(function (k) {
        var b = h('button', { type: 'button', 'class': 'filter-chip', 'aria-pressed': String(k === null), text: k ? platformLabel(k) : 'All' });
        b.addEventListener('click', function () {
          buttons.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
          render(k);
        });
        return b;
      });
      filters.replaceChildren.apply(filters, buttons);
      filters.hidden = false;
    }
  }

  productsPromise.then(function (products) {
    buildMenu(products);
    buildStores(products);
    buildCatalog(products);
  });
}());
