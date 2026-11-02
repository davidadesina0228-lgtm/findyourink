/* =====================================================================
   gs.js — GleamShield finishing touches. Never changes any article text.
   ===================================================================== */
(() => {
  'use strict';
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  // Chronicle hero: a blurred wash of the article's own image.
  const hero = document.querySelector('.gs-article-hero');
  const img = document.querySelector('.gs-article-img');
  if (hero && img) hero.style.setProperty('--hero-img', `url("${img.currentSrc || img.getAttribute('src')}")`);

  // Chronicle sidebar: a sticky copy of the table of contents that follows the reader.
  const toc = document.querySelector('.gs-article-content nav.gs-toc');
  const sidebar = document.querySelector('.gs-article-sidebar');
  const content = document.querySelector('.gs-article-content');
  if (toc && sidebar && content) {
    const list = toc.querySelector('ol, ul');
    if (list) {
      const rail = document.createElement('nav');
      rail.className = 'gs-toc-clone';
      rail.setAttribute('aria-label', 'In this Chronicle (follows your place)');
      const head = document.createElement('p');
      head.textContent = 'In this Chronicle';
      const ol = document.createElement('ol');
      [...list.querySelectorAll('a[href^="#"]')].forEach((a) => {
        const li = document.createElement('li');
        const link = document.createElement('a');
        link.href = a.getAttribute('href');
        link.textContent = a.textContent;
        li.append(link);
        ol.append(li);
      });
      rail.append(head, ol);
      sidebar.prepend(rail);
      const links = [...rail.querySelectorAll('a'), ...toc.querySelectorAll('a[href^="#"]')];
      const targets = [...ol.querySelectorAll('a')].map((a) => document.getElementById(decodeURIComponent(a.getAttribute('href').slice(1)))).filter(Boolean);
      let lastP = '';
      let lastId = null;
      const update = () => {
        // Read first, write only what changed.
        const r = content.getBoundingClientRect();
        const line = innerHeight * 0.4;
        let current = -1;
        targets.forEach((t, i) => { if (t.getBoundingClientRect().top < line) current = i; });
        const p = clamp((-r.top + innerHeight * 0.35) / Math.max(r.height, 1), 0, 1).toFixed(3);
        if (p !== lastP) { lastP = p; rail.style.setProperty('--rail-p', p); }
        const id = current >= 0 ? `#${targets[current].id}` : '';
        if (id !== lastId) {
          lastId = id;
          links.forEach((a) => a.classList.toggle('is-current', !!id && decodeURIComponent(a.getAttribute('href')) === id));
        }
      };
      onScrollFrame(update);
    }
  }

  // Reading progress: scaled on the compositor (CSS pins its width), updated once per frame.
  const bar = document.querySelector('.gs-reading-progress');
  if (bar) {
    let last = '';
    onScrollFrame(() => {
      const max = document.documentElement.scrollHeight - innerHeight;
      const p = (max > 0 ? clamp(scrollY / max, 0, 1) : 0).toFixed(4);
      if (p !== last) { last = p; bar.style.transform = `scaleX(${p})`; }
    });
  }

  function onScrollFrame(fn) {
    let ticking = false;
    const run = () => { ticking = false; fn(); };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(run); } }, { passive: true });
    addEventListener('resize', () => { if (!ticking) { ticking = true; requestAnimationFrame(run); } }, { passive: true });
    fn();
  }

  // Chronicles index: count the archive so the number never goes stale.
  const countEl = document.querySelector('[data-count-posts]');
  if (countEl) {
    const n = document.querySelectorAll('#gs-posts .gs-post-card, .gs-featured-post').length;
    if (n) { countEl.textContent = n; countEl.dataset.count = n; }
  }

  // Footer: the studio's name, set in stone.
  const bottom = document.querySelector('.gs-footer__bottom');
  if (bottom && !document.querySelector('.gx-footer-word')) {
    const word = document.createElement('p');
    word.className = 'gx-footer-word';
    word.setAttribute('aria-hidden', 'true');
    word.textContent = 'GleamShield';
    bottom.before(word);
  }

  // Mark the current section in the nav for every page (the base markup only does it on some).
  const here = location.pathname.replace(/\/$/, '/index.html');
  document.querySelectorAll('.gs-nav__links .gs-nav__link').forEach((a) => {
    const href = a.getAttribute('href') || '';
    const section = href.replace('.html', '');
    if (href && here !== '/gleamshield/index.html' && (here === href || here.startsWith(section + '/'))) {
      a.classList.add('active');
      a.setAttribute('aria-current', 'page');
    }
  });
})();
