/* GleamShield: "New" posts. A post counts as new for 60 days after its data-date.
   Nothing here needs editing when a post ages out: the dates do the work.
   Source of truth: the cards in /gleamshield/chronicles.html (each has data-date="YYYY-MM-DD"). */
(() => {
  'use strict';
  const NEW_DAYS = 60;
  const HOME_COUNT = 3;
  const DAY = 86400000;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Reads one chronicle card (from this page or a fetched copy) into plain data.
  const readCard = (card, index) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(card.dataset.date || '');
    const link = card.querySelector('a[href]');
    if (!m || !link) return null;
    const date = new Date(+m[1], +m[2] - 1, +m[3]);
    const read = (sel) => (card.querySelector(sel)?.textContent || '').trim();
    const img = card.querySelector('img');
    const meta = read('.gs-post-card__meta');
    return {
      node: card,
      index,
      date,
      age: Math.floor((today - date) / DAY),
      href: link.getAttribute('href'),
      cat: read('.gs-post-card__cat'),
      title: read('.gs-post-card__title'),
      excerpt: read('.gs-post-card__excerpt'),
      time: (/(\d+\s*min read)/.exec(meta) || [''])[0],
      imgSrc: img ? img.getAttribute('src') : '',
      imgAlt: img ? img.getAttribute('alt') || '' : '',
    };
  };

  // Newest first. Posts sharing a date: the one added later to the page counts as newer.
  const newestFirst = (a, b) => b.date - a.date || b.index - a.index;

  const collect = (root) =>
    [...root.querySelectorAll('#gs-posts .gs-post-card[data-date]')]
      .map(readCard)
      .filter(Boolean)
      .filter((p) => p.age >= 0)            // ignore posts dated in the future
      .sort(newestFirst);

  const isNew = (p) => p.age <= NEW_DAYS;

  const makeBadge = () => {
    const b = document.createElement('span');
    b.className = 'gs-new-badge';
    b.textContent = 'New';
    return b;
  };

  // ---------- Chronicles page: "New" section + badges ----------
  const section = document.getElementById('gs-new');
  const newGrid = document.getElementById('gs-new-grid');
  if (section && newGrid) {
    const posts = collect(document);
    const fresh = posts.filter(isNew);

    posts.forEach((p) => {
      if (isNew(p)) p.node.querySelector('.gs-post-card__cat')?.append(makeBadge());
    });

    fresh.forEach((p) => {
      const clone = p.node.cloneNode(true);
      clone.removeAttribute('data-cat');   // keep the category filter from touching these copies
      // The original may already carry a pending scroll-reveal state; copies must start visible.
      clone.classList.remove('gs-reveal--pending');
      clone.style.removeProperty('--gs-reveal-delay');
      clone.querySelectorAll('img').forEach((i) => i.setAttribute('loading', 'lazy'));
      newGrid.append(clone);
    });

    const filters = document.querySelectorAll('.gs-filter-btn');
    const sync = (cat) => { section.hidden = fresh.length === 0 || cat !== 'all'; };
    sync('all');
    filters.forEach((btn) => btn.addEventListener('click', () => sync(btn.dataset.cat)));
  }

  // ---------- GleamShield homepage: "Latest Insights" ----------
  const homeGrid = document.getElementById('gs-latest-grid');
  if (homeGrid) {
    fetch('/gleamshield/chronicles.html', { credentials: 'same-origin' })
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error(String(r.status)))))
      .then((html) => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const latest = collect(doc).slice(0, HOME_COUNT);
        if (!latest.length) return;                 // keep the built-in cards
        const frag = document.createDocumentFragment();
        latest.forEach((p) => frag.append(homeCard(p)));
        homeGrid.replaceChildren(frag);
      })
      .catch(() => { /* leave the built-in cards in place */ });
  }

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  }

  function homeCard(p) {
    const a = el('a');
    a.href = p.href.startsWith('/') ? p.href : '/gleamshield/chronicles.html';
    a.style.cssText = 'display:block;text-decoration:none;';
    const article = el('article', 'gs-card');

    const wrap = el('div', 'gs-card__img-wrap');
    if (p.imgSrc.startsWith('/')) {
      const img = el('img', 'gs-card__img');
      img.src = p.imgSrc; img.alt = p.imgAlt; img.loading = 'lazy';
      wrap.append(img);
    }

    const body = el('div', 'gs-card__body');
    const meta = el('div', 'gs-card__meta');
    const badge = el('span', 'gs-badge', p.cat);
    if (isNew(p)) badge.append(makeBadge());
    meta.append(badge, el('span', 'gs-card__time', p.time));
    body.append(
      meta,
      el('h3', 'gs-card__title', p.title),
      el('p', 'gs-card__excerpt', p.excerpt),
      Object.assign(el('span', 'gs-btn gs-btn--ghost', 'Read →'), { style: 'font-size:0.75rem;' })
    );
    article.append(wrap, body);
    a.append(article);
    return a;
  }
})();
