/* =====================================================================
   motion.js — shared choreography for davidadesina.com and GleamShield.
   Everything is opt-in through data attributes, works without it,
   and stands still when the reader prefers reduced motion.
   ===================================================================== */
(() => {
  'use strict';

  const root = document.documentElement;
  root.classList.add('js');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ---------- Word splitting (keeps <em>, <br>, links intact) ---------- */
  function splitWords(el, wrapClass) {
    if (el.dataset.splitDone) return [];
    el.dataset.splitDone = '1';
    const out = [];
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === 3) {
          const parts = child.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          parts.forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.append(document.createTextNode(part)); return; }
            if (wrapClass === 'w') {
              const outer = document.createElement('span');
              outer.className = 'w';
              const inner = document.createElement('span');
              inner.textContent = part;
              outer.append(inner);
              frag.append(outer);
              out.push(inner);
            } else {
              const span = document.createElement('span');
              span.className = wrapClass;
              span.textContent = part;
              frag.append(span);
              out.push(span);
            }
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1 && child.tagName !== 'BR' && child.tagName !== 'SVG') {
          walk(child);
        }
      });
    };
    walk(el);
    return out;
  }

  $$('[data-split]').forEach((el) => {
    splitWords(el, 'w').forEach((span, i) => span.style.setProperty('--i', i));
  });
  $$('[data-lines]').forEach((el) => {
    $$('.line > span', el).forEach((span, i) => span.style.setProperty('--i', i));
  });
  $$('[data-stagger]').forEach((group) => {
    const step = parseFloat(group.dataset.stagger) || 0.08;
    $$(':scope > [data-reveal]', group).forEach((el, i) => el.style.setProperty('--d', `${(i * step).toFixed(2)}s`));
  });

  /* ---------- Essay enhancements ---------- */
  const article = document.querySelector('.article-body');
  if (article) enhanceEssay(article);

  function slugify(text) {
    return text.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
  }

  function enhanceEssay(body) {
    // Final words, axioms and section heads join the reveal system.
    $$('.final-words, blockquote', body).forEach((el) => el.setAttribute('data-observe', ''));
    $$('h2, .divider, hr.article-divider', body).forEach((el) => el.setAttribute('data-reveal', ''));

    // "Share this line" on every axiom.
    $$('blockquote', body).forEach((quote) => {
      const text = quote.textContent.replace(/\s+/g, ' ').trim();
      if (!text || quote.querySelector('.da-share-line')) return;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'da-share-line';
      btn.innerHTML = '<span aria-hidden="true">✦</span> Share this line';
      btn.addEventListener('click', async () => {
        const url = location.href.split('#')[0];
        if (navigator.share) {
          try { await navigator.share({ text: `${text}\n— David Adesina`, url }); return; } catch { return; }
        }
        const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${text} — David Adesina`)}&url=${encodeURIComponent(url)}`;
        window.open(intent, '_blank', 'noopener,width=600,height=520');
      });
      quote.append(btn);
    });

    // Chapter rail: sticky contents + progress + minutes left.
    const container = body.parentElement;
    const heads = $$(':scope > h2, :scope > section > h2', body);
    if (!container || heads.length < 2) return;
    container.classList.add('da-reading');
    heads.forEach((h) => { if (!h.id) h.id = slugify(h.textContent); });
    // Trust the essay's own stated reading time; fall back to a word count.
    const stated = (document.querySelector('.article-hero__meta')?.textContent.match(/(\d+)\s*min read/) || [])[1];
    const words = stated ? +stated * 230 : body.textContent.trim().split(/\s+/).length;
    const rail = document.createElement('aside');
    rail.className = 'da-rail';
    rail.setAttribute('aria-label', 'In this essay');
    rail.innerHTML = `<div class="da-rail__inner"><p class="da-rail__label">In this essay</p><ol class="da-rail__list">${heads.map((h) => `<li><a href="#${h.id}">${h.textContent.replace(/\s+/g, ' ').trim()}</a></li>`).join('')}</ol><p class="da-rail__time"><svg viewBox="0 0 36 36" aria-hidden="true"><circle class="bg" cx="18" cy="18" r="15.9" pathLength="100"/><circle class="fg" cx="18" cy="18" r="15.9" pathLength="100"/></svg><span data-rail-time>${Math.max(1, Math.round(words / 230))} min read</span></p></div>`;
    container.prepend(rail);
    const links = $$('a', rail);
    const timeLabel = rail.querySelector('[data-rail-time]');
    let ticking = false;
    const update = () => {
      ticking = false;
      const rect = body.getBoundingClientRect();
      const p = clamp((-rect.top + innerHeight * 0.35) / Math.max(rect.height, 1), 0, 1);
      rail.style.setProperty('--rail-p', p.toFixed(3));
      const left = Math.ceil((words * (1 - p)) / 230);
      timeLabel.textContent = p > 0.02 ? (left > 0 ? `${left} min left` : 'Finished') : `${Math.max(1, Math.round(words / 230))} min read`;
      let current = 0;
      heads.forEach((h, i) => { if (h.getBoundingClientRect().top < innerHeight * 0.4) current = i; });
      links.forEach((a, i) => a.classList.toggle('is-current', i === current && p > 0));
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  /* ---------- Reveal observer ---------- */
  const revealTargets = () => $$('[data-reveal], [data-lines], [data-split], [data-observe]').filter((el) => !el.classList.contains('is-in'));
  const showAll = () => revealTargets().forEach((el) => el.classList.add('is-in'));

  if (reduce.matches || !('IntersectionObserver' in window)) {
    showAll();
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealTargets().forEach((el) => {
      // Anything already on screen at load plays immediately (hero choreography).
      io.observe(el);
    });
    // Keyboard users never land on something invisible.
    document.addEventListener('focusin', (e) => {
      const hidden = e.target.closest('[data-reveal]:not(.is-in), [data-lines]:not(.is-in), [data-split]:not(.is-in)');
      if (hidden) hidden.classList.add('is-in');
    });
    reduce.addEventListener('change', (e) => { if (e.matches) showAll(); });
  }

  /* ---------- Scroll-lit words ---------- */
  const scrubs = $$('[data-scrub]').map((el) => {
    const words = splitWords(el, 'sw');
    words.forEach((w) => { if (w.closest('em')) w.classList.add('gold'); });
    return { el, words };
  });
  if (reduce.matches) scrubs.forEach((s) => s.words.forEach((w) => w.classList.add('on')));

  /* ---------- Header: hide on the way down, return on the way up ---------- */
  const header = document.querySelector('[data-autohide]');
  let lastY = scrollY;
  let navH = header ? header.offsetHeight : 0;

  /* ---------- Parallax, stacks, marquees ---------- */
  const parallax = $$('[data-parallax]').map((el) => ({ el, speed: parseFloat(el.dataset.parallax) || 0.15 }));
  const stacks = $$('[data-stack]').map((el) => $$(':scope > [data-stack-item]', el));
  const marquees = $$('.da-marquee__track, .gs-marquee__track');
  const progressEls = $$('[data-progress]');
  let velocity = 0;
  let frame = 0;

  function onFrame() {
    frame = 0;
    const y = scrollY;
    const dy = y - lastY;
    velocity = velocity * 0.82 + Math.abs(dy) * 0.18;

    if (header && !document.querySelector('.nav__toggle.active, .gs-nav__hamburger.open')) {
      const hide = dy > 4 && y > Math.max(navH * 4, 360);
      const show = dy < -4 || y < navH * 2;
      if (hide) header.classList.add('is-hidden');
      else if (show) header.classList.remove('is-hidden');
      root.style.setProperty('--nav-offset', header.classList.contains('is-hidden') ? '0px' : `${navH}px`);
    }
    lastY = y;

    if (!reduce.matches) {
      const vh = innerHeight;
      parallax.forEach(({ el, speed }) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        const offset = (r.top + r.height / 2 - vh / 2) * speed * -1;
        el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
      });

      scrubs.forEach(({ el, words }) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const p = clamp((vh * 0.82 - r.top) / (r.height + vh * 0.32), 0, 1);
        const lit = Math.round(p * words.length * 1.04);
        words.forEach((w, i) => w.classList.toggle('on', i < lit));
      });

      stacks.forEach((items) => {
        items.forEach((item, i) => {
          const next = items[i + 1];
          if (!next) { item.style.setProperty('--p', '0'); return; }
          const nt = next.getBoundingClientRect().top;
          item.style.setProperty('--p', clamp(1 - nt / vh, 0, 1).toFixed(3));
        });
      });

      const rate = 1 + Math.min(velocity / 14, 4);
      marquees.forEach((track) => {
        const anim = track.getAnimations ? track.getAnimations()[0] : null;
        if (anim) anim.playbackRate = rate;
      });
    }

    progressEls.forEach((el) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--sp', clamp(-r.top / Math.max(r.height - innerHeight, 1), 0, 1).toFixed(3));
    });

    if (velocity > 0.2 && !reduce.matches) request();
  }
  function request() { if (!frame) frame = requestAnimationFrame(onFrame); }
  addEventListener('scroll', request, { passive: true });
  addEventListener('resize', () => { navH = header ? header.offsetHeight : 0; request(); }, { passive: true });
  request();

  /* ---------- Magnetic buttons & tilt cards (fine pointers only) ---------- */
  if (finePointer.matches && !reduce.matches) {
    $$('[data-magnetic]').forEach((el) => {
      const strength = parseFloat(el.dataset.magnetic) || 0.28;
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * strength;
        const y = (e.clientY - r.top - r.height / 2) * strength;
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
    $$('[data-tilt]').forEach((el) => {
      const max = parseFloat(el.dataset.tilt) || 8;
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty('--rx', `${(-py * max).toFixed(2)}deg`);
        el.style.setProperty('--ry', `${(px * max).toFixed(2)}deg`);
        el.style.setProperty('--mx', `${((px + 0.5) * 100).toFixed(1)}%`);
        el.style.setProperty('--my', `${((py + 0.5) * 100).toFixed(1)}%`);
      });
      el.addEventListener('pointerleave', () => { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
    });
  }

  /* ---------- Count-up numbers ---------- */
  const counters = $$('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    const co = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) return;
        co.unobserve(target);
        const end = parseFloat(target.dataset.count);
        if (reduce.matches) { target.textContent = end; return; }
        const t0 = performance.now();
        const step = (t) => {
          const k = clamp((t - t0) / 1600, 0, 1);
          target.textContent = Math.round(end * (1 - Math.pow(1 - k, 4)));
          if (k < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    counters.forEach((c) => co.observe(c));
  }

  /* ---------- Film timecode (GleamShield viewfinder) ---------- */
  $$('[data-timecode]').forEach((el) => {
    if (reduce.matches) return;
    const start = performance.now();
    const pad = (n) => String(n).padStart(2, '0');
    const tick = () => {
      const t = (performance.now() - start) / 1000;
      const f = Math.floor((t % 1) * 24);
      el.textContent = `00:${pad(Math.floor(t / 60) % 60)}:${pad(Math.floor(t) % 60)}:${pad(f)}`;
      if (el.isConnected) setTimeout(tick, 1000 / 24);
    };
    tick();
  });

  const year = document.getElementById('year');
  if (year && !year.textContent) year.textContent = new Date().getFullYear();
})();
