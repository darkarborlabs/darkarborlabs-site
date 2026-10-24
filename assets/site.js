/* Dark Arbor Labs: Products menu, catalog grid and store buttons.
   Everything is driven by assets/products.js, so adding a product is one entry there
   plus a page under /products/<slug>/. Pages stay readable without JS: the nav's
   "Products" item is a normal link to /products/. */
(function () {
  'use strict';

  document.documentElement.classList.add('js');

  // Paths in products.json are relative to the site root, which is wherever this script's
  // parent folder lives. That keeps the site working from any host, subfolder or file://.
  var ROOT = new URL('../', document.currentScript.src);
  function url(path) { return new URL(path, ROOT).href; }

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
    ios:     { src: 'assets/badges/app-store.svg',  alt: 'Download on the App Store' },
    android: { src: 'assets/badges/google-play.png', alt: 'Get it on Google Play' }
  };

  var STATUS_LABEL = { 'coming-soon': 'Coming soon', 'in-development': 'In development' };

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
  // A store entry may carry its own label, e.g. { "label": "iPhone" } for an iPhone-only app.
  function platformLabel(key, product) {
    var store = product && product.stores && product.stores[key];
    return (store && store.label) || PLATFORMS[key] || key;
  }

  var products = window.DAL_PRODUCTS || [];

  function statusTag(p) {
    var label = STATUS_LABEL[p.status];
    return label ? h('span', { 'class': 'tag soon', text: label }) : null;
  }

  /* ── Nav: Products menu ── */
  function buildMenu(products) {
    var li = document.querySelector('.nav-products');
    // Products without a page of their own yet stay on the catalog only.
    products = products.filter(function (p) { return p.url; });
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

    panel.appendChild(h('a', { 'class': 'menu-all', href: url('products/') }, [
      h('span', { text: 'All products' }), h('span', { 'aria-hidden': 'true', text: '→' })
    ]));

    li.appendChild(caret);
    li.appendChild(panel);
    wireMenu(li, caret);
  }

  function menuItem(p) {
    var name = h('span', { 'class': 'menu-item-name' }, [h('span', { text: p.name }), statusTag(p)]);
    var a = h('a', { 'class': 'menu-item', href: url(p.url) }, [
      h('img', { src: url(p.icon), alt: '', width: '40', height: '40', loading: 'lazy' }),
      h('span', { 'class': 'menu-item-text' }, [name, h('span', { 'class': 'menu-item-desc', text: p.tagline })])
    ]);
    if (location.pathname.indexOf(new URL(p.url, ROOT).pathname) === 0) a.setAttribute('aria-current', 'page');
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
          h('img', { src: url(badge.src), alt: badge.alt, height: '48' })
        ]));
      } else if (store.url) {
        wrap.appendChild(h('a', { 'class': 'store-link', href: store.url, rel: 'noopener', text: platformLabel(key, product) }));
      }
      // No store link yet: show nothing until the app is live.
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
    function render() {
      grid.replaceChildren.apply(grid, products
        .map(function (p) {
          var summary = p.summary + (p.eta ? ' Expected ' + p.eta + '.' : '');
          return h(p.url ? 'a' : 'div', { 'class': 'product-card' + (p.url ? '' : ' static'), href: p.url ? url(p.url) : null }, [
            h('img', { 'class': 'product-card-icon', src: url(p.icon), alt: '', width: '72', height: '72' }),
            h('div', { 'class': 'product-card-body' }, [
              h('div', { 'class': 'product-card-head' }, [h('h3', { text: p.name }), statusTag(p)]),
              h('p', { 'class': 'product-card-tagline', text: p.tagline }),
              h('p', { 'class': 'product-card-summary', text: summary })
            ])
          ]);
        }));
    }

    render();
  }

  buildMenu(products);
  buildStores(products);
  buildCatalog(products);

  /* ── Screenshot viewer: click a screenshot to see it larger ── */
  (function () {
    var imgs = Array.prototype.slice.call(document.querySelectorAll('.shots img'));
    if (!imgs.length || typeof HTMLDialogElement === 'undefined') return;

    var dialog = h('dialog', { 'class': 'lightbox', 'aria-label': 'Screenshot viewer' });
    var big = h('img', { alt: '' });
    var close = h('button', { type: 'button', 'class': 'lightbox-btn lightbox-close', 'aria-label': 'Close', text: '\u00d7' });
    var prev = h('button', { type: 'button', 'class': 'lightbox-btn lightbox-prev', 'aria-label': 'Previous screenshot', text: '\u2039' });
    var next = h('button', { type: 'button', 'class': 'lightbox-btn lightbox-next', 'aria-label': 'Next screenshot', text: '\u203a' });
    [big, close, prev, next].forEach(function (el) { dialog.appendChild(el); });
    document.body.appendChild(dialog);

    var index = 0;
    function show(i) {
      index = (i + imgs.length) % imgs.length;
      big.src = imgs[index].currentSrc || imgs[index].src;
      big.alt = imgs[index].alt;
    }

    imgs.forEach(function (img, i) {
      var b = h('button', { type: 'button', 'class': 'shot-btn', 'aria-label': 'View larger: ' + img.alt });
      img.parentNode.insertBefore(b, img);
      b.appendChild(img);
      b.addEventListener('click', function () { show(i); dialog.showModal(); });
    });

    close.addEventListener('click', function () { dialog.close(); });
    prev.addEventListener('click', function () { show(index - 1); });
    next.addEventListener('click', function () { show(index + 1); });
    // A click on the dark backdrop (the dialog itself) closes it.
    dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });
    dialog.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') show(index - 1);
      if (e.key === 'ArrowRight') show(index + 1);
    });
  }());

  // Opened straight from disk (file://), a link to a folder opens Finder instead of the
  // page. Point folder links at their index.html there; on a web server nothing changes.
  if (location.protocol === 'file:') {
    document.querySelectorAll('a[href]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (/\/(#.*)?$/.test(href)) a.setAttribute('href', href.replace(/\/(#.*)?$/, '/index.html$1'));
    });
  }
}());
