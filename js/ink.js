/* =====================================================================
   ink.js — every essay gets its own ink plate.
   A plate is generated from the essay's slug, so the same essay always
   wears the same art: on the archive card, in related posts, and in
   its own header. Light plates are sumi ink on paper; dark plates are
   light breaking through ink.
   Markup: <div class="card__plate" data-plate [data-slug] [data-cat] [data-variant="dark"] [data-no]></div>
   ===================================================================== */
(() => {
  'use strict';

  const CATS = {
    'faith-doubt': '#b8913f',
    'trauma-healing': '#b4583a',
    'emotional-intelligence': '#4f7a70',
    'cultural-commentary': '#c0812f',
    'spiritual-formation': '#c9a961',
    'identity-in-christ': '#4b5888',
    'generational-patterns': '#7a4560',
    'mind-neuroscience': '#3f6f8f',
  };
  const LABELS = {
    'faith & doubt': 'faith-doubt', 'trauma & healing': 'trauma-healing', 'healing & trauma': 'trauma-healing',
    'emotional intelligence': 'emotional-intelligence', 'cultural commentary': 'cultural-commentary',
    'spiritual formation': 'spiritual-formation', 'identity in christ': 'identity-in-christ',
    'generational patterns': 'generational-patterns', 'mind & neuroscience': 'mind-neuroscience',
  };

  // Small, fast, seeded randomness.
  function hash(str) {
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (let i = 0; i < str.length; i++) {
      const c = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ c, 2654435761);
      h2 = Math.imul(h2 ^ c, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    return h1 >>> 0;
  }
  function rng(seed) {
    let a = seed;
    return () => {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // A closed organic shape through jittered polar points (Catmull-Rom → Bézier).
  function blob(r, cx, cy, radius, points, wobble) {
    const pts = [];
    const turn = r() * Math.PI * 2;
    for (let i = 0; i < points; i++) {
      const a = turn + (i / points) * Math.PI * 2;
      const rad = radius * (1 - wobble / 2 + r() * wobble);
      pts.push([cx + Math.cos(a) * rad * 1.12, cy + Math.sin(a) * rad * 0.92]);
    }
    let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
    for (let i = 0; i < points; i++) {
      const p0 = pts[(i - 1 + points) % points], p1 = pts[i], p2 = pts[(i + 1) % points], p3 = pts[(i + 2) % points];
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += `C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
    }
    return d + 'Z';
  }

  // Every plate is drawn from the same parts. On the page the filtered ink
  // (noise + blur) is rasterised once as two images, so reveals and hovers
  // only move bitmaps on the GPU; the light lines stay live SVG so they can draw.
  let uid = 0;
  function design({ slug, cat, dark, no }) {
    const r = rng(hash(slug || 'find-your-ink'));
    const id = `ip${++uid}`;
    const accent = CATS[cat] || '#c9a961';
    const bg = dark ? '#12100d' : '#ece5d8';
    const ink = dark ? '#f2ebdd' : '#15130f';
    const halo = dark ? '#c9a961' : accent;
    const line = dark ? '#e8cf94' : accent;

    // Composition lives near the centre so any crop (16:9 → 4:5) holds.
    const bx = 175 + r() * 50, by = 150 + r() * 28;
    const br = 58 + r() * 26;
    const hx = bx + (r() > 0.5 ? 1 : -1) * (34 + r() * 30), hy = by - 40 - r() * 30;
    const hr = 30 + r() * 24;
    const ring = r() > 0.55;

    const wash = blob(r, bx + (r() - 0.5) * 30, by + 8, br * 1.75, 9, 0.5);
    const bloom = blob(r, bx, by, br, 12, 0.42);
    const core = blob(r, bx + (r() - 0.5) * 16, by + (r() - 0.5) * 12, br * 0.42, 9, 0.5);

    // Brush stroke sweeping across, plus a fine gold rule.
    const sy = by + br * (0.35 + r() * 0.5);
    const s1 = `M${(-10 + r() * 40).toFixed(1)},${(sy + 30 - r() * 60).toFixed(1)} C${(110 + r() * 40).toFixed(1)},${(sy - 60 + r() * 40).toFixed(1)} ${(250 + r() * 40).toFixed(1)},${(sy + 40 - r() * 30).toFixed(1)} ${(410 - r() * 30).toFixed(1)},${(sy - 30 + r() * 50).toFixed(1)}`;
    const ly = 40 + r() * 40;
    const s2 = `M${(30 + r() * 40).toFixed(1)},${ly.toFixed(1)} Q${(200).toFixed(1)},${(ly + (r() - 0.5) * 40).toFixed(1)} ${(370 - r() * 40).toFixed(1)},${(ly + (r() - 0.5) * 20).toFixed(1)}`;
    const s3 = ring
      ? `M${(hx + hr + 10).toFixed(1)},${hy.toFixed(1)} A${(hr + 10).toFixed(1)},${(hr + 10).toFixed(1)} 0 1 1 ${(hx + hr + 9.9).toFixed(1)},${(hy - 1).toFixed(1)}`
      : `M${(bx - br * 1.4).toFixed(1)},${(by + br * 1.15).toFixed(1)} q${(br * 0.9).toFixed(1)},${(-14 - r() * 10).toFixed(1)} ${(br * 2.6).toFixed(1)},${(4 - r() * 8).toFixed(1)}`;

    let dots = '';
    const nd = 8 + Math.floor(r() * 10);
    for (let i = 0; i < nd; i++) {
      const a = r() * Math.PI * 2;
      const dist = br * (1.05 + r() * 0.9);
      const rr = 0.8 + Math.pow(r(), 2.4) * 4.4;
      dots += `<circle cx="${(bx + Math.cos(a) * dist * 1.1).toFixed(1)}" cy="${(by + Math.sin(a) * dist * 0.85).toFixed(1)}" r="${rr.toFixed(1)}"/>`;
    }

    const label = no ? `<text x="18" y="284" font-family="Playfair Display, Georgia, serif" font-style="italic" font-size="13" fill="${dark ? '#c9a961' : '#15130f'}" fill-opacity="${dark ? 0.85 : 0.55}">Nº ${no}</text>` : '';

    // Keep the order of random draws identical to the original single-SVG plate.
    const seed = Math.floor(r() * 999);
    const disp = (10 + r() * 10).toFixed(0);
    const sw = (2.2 + r() * 3).toFixed(1);
    return {
      bg,
      origin: [(bx / 400) * 100, (by / 300) * 100],
      back: `<defs><filter id="${id}b" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="9"/></filter><radialGradient id="${id}g" cx="0.4" cy="0.35" r="0.75"><stop offset="0" stop-color="${halo}" stop-opacity="1"/><stop offset="1" stop-color="${halo}" stop-opacity="${dark ? 0.55 : 0.78}"/></radialGradient></defs>`
        + `<path d="${wash}" fill="${dark ? '#c9a961' : '#15130f'}" fill-opacity="${dark ? 0.09 : 0.08}" filter="url(#${id}b)"/>`
        + `<circle cx="${hx.toFixed(1)}" cy="${hy.toFixed(1)}" r="${hr.toFixed(1)}" fill="url(#${id}g)"/>`,
      front: `<defs><filter id="${id}e" x="-25%" y="-25%" width="150%" height="150%"><feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="3" seed="${seed}"/><feDisplacementMap in="SourceGraphic" scale="${disp}" xChannelSelector="R" yChannelSelector="G"/></filter></defs>`
        + `<g filter="url(#${id}e)"><path d="${bloom}" fill="${ink}" fill-opacity="${dark ? 0.9 : 0.93}"/><path d="${core}" fill="${dark ? '#fff8e6' : '#000'}" fill-opacity="${dark ? 0.5 : 0.35}"/></g>`,
      lines: `<path class="p-stroke" d="${s1}" pathLength="1" fill="none" stroke="${ink}" stroke-width="${sw}" stroke-linecap="round" stroke-opacity="${dark ? 0.75 : 0.85}"/>`
        + `<path class="p-stroke" d="${s2}" pathLength="1" fill="none" stroke="${line}" stroke-width="1" stroke-linecap="round" stroke-opacity=".9"/>`
        + `<path class="p-stroke" d="${s3}" pathLength="1" fill="none" stroke="${line}" stroke-width="1.1" stroke-linecap="round" stroke-opacity=".85"/>`
        + `<g class="p-dots" fill="${ink}" fill-opacity="${dark ? 0.7 : 0.85}">${dots}</g>${label}`,
    };
  }

  const SVG_OPEN = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300" preserveAspectRatio="xMidYMid slice"';
  const asImage = (body, cls) => `<img class="${cls}" alt="" decoding="async" draggable="false" src="data:image/svg+xml;charset=utf-8,${encodeURIComponent(`${SVG_OPEN}>${body}</svg>`)}">`;

  // One self-contained SVG (used for share images and anywhere a single file is handier).
  function plateSVG(opts) {
    const d = design(opts);
    return `${SVG_OPEN} aria-hidden="true" focusable="false">${opts.bare ? '' : `<rect width="400" height="300" fill="${d.bg}"/>`}${d.back}${d.front}${d.lines}</svg>`;
  }

  // The live, layered plate used on pages.
  function plateLayers(el, opts) {
    const d = design(opts);
    if (!opts.bare) el.style.backgroundColor = d.bg;
    el.style.setProperty('--ox', `${d.origin[0].toFixed(1)}%`);
    el.style.setProperty('--oy', `${d.origin[1].toFixed(1)}%`);
    el.innerHTML = asImage(d.back, 'plate__back') + asImage(d.front, 'plate__front')
      + `${SVG_OPEN} class="plate__lines" aria-hidden="true" focusable="false">${d.lines}</svg>`;
  }

  function resolve(el) {
    const card = el.closest('.card, .da-card, [data-category]');
    let slug = el.dataset.slug;
    if (!slug && card) {
      const a = card.querySelector('.card__title a[href], a[href$=".html"]');
      const m = a && a.getAttribute('href').match(/([^/?#]+)\.html/);
      if (m) slug = m[1];
    }
    if (!slug) {
      const m = location.pathname.match(/([^/]+)\.html$/);
      slug = m ? m[1] : 'find-your-ink';
    }
    let cat = el.dataset.cat || (card && card.dataset.category);
    if (!cat && card) {
      const label = (card.querySelector('.card__category')?.textContent || '').split('·')[0].trim().toLowerCase();
      cat = LABELS[label];
    }
    return { slug, cat, dark: el.dataset.variant === 'dark', no: el.dataset.no, bare: el.hasAttribute('data-bare') };
  }

  const plates = [...document.querySelectorAll('[data-plate]')];
  plates.forEach((el) => {
    el.classList.add('plate', 'is-drawn');
    if (el.dataset.variant === 'dark') el.classList.add('plate-dark');
    const opts = resolve(el);
    // Archive cards use the plate baked by scripts/make-images.mjs: a plain image the browser
    // decodes off the main thread. If an essay hasn't been baked yet, draw it live instead.
    if (el.classList.contains('card__plate') && !opts.dark && !opts.bare && opts.slug) {
      el.classList.add('plate--baked');
      el.style.backgroundColor = '#ece5d8';
      const img = new Image();
      img.className = 'plate__img';
      img.alt = '';
      img.decoding = 'async';
      img.loading = 'lazy';
      img.draggable = false;
      img.onerror = () => { el.classList.remove('plate--baked'); plateLayers(el, opts); };
      img.src = `/images/plates/${opts.slug}.jpg`;
      el.replaceChildren(img);
      return;
    }
    plateLayers(el, opts);
  });

  window.InkPlate = { svg: plateSVG };

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) {
    plates.forEach((el) => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) return;
      target.classList.add('is-in');
      io.unobserve(target);
    });
  }, { threshold: 0.18 });
  plates.forEach((el) => io.observe(el));
})();
