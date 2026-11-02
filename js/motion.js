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
  const pauseKey = 'da_motion_paused';
  let userPaused = false;
  try { userPaused = localStorage.getItem(pauseKey) === 'true'; } catch { /* Motion controls still work without storage. */ }
  const isMotionPaused = () => userPaused || reduce.matches;
  const motionListeners = [];
  root.classList.toggle('motion-paused', isMotionPaused());

  const atmosphereHost = document.querySelector('[data-atmosphere]');
  let motionControl = null;
  if (atmosphereHost) {
    motionControl = document.createElement('button');
    motionControl.type = 'button';
    motionControl.className = 'motion-control';
    atmosphereHost.append(motionControl);
  }

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
    let lastP = '', lastLabel = '', lastCurrent = -2;
    const update = () => {
      ticking = false;
      // Read everything first…
      const rect = body.getBoundingClientRect();
      const line = innerHeight * 0.4;
      let current = 0;
      heads.forEach((h, i) => { if (h.getBoundingClientRect().top < line) current = i; });
      // …then write only what changed.
      const p = clamp((-rect.top + innerHeight * 0.35) / Math.max(rect.height, 1), 0, 1);
      const pText = p.toFixed(3);
      if (pText !== lastP) { lastP = pText; rail.style.setProperty('--rail-p', pText); }
      const left = Math.ceil((words * (1 - p)) / 230);
      const label = p > 0.02 ? (left > 0 ? `${left} min left` : 'Finished') : `${Math.max(1, Math.round(words / 230))} min read`;
      if (label !== lastLabel) { lastLabel = label; timeLabel.textContent = label; }
      const cur = p > 0 ? current : -1;
      if (cur !== lastCurrent) { lastCurrent = cur; links.forEach((a, i) => a.classList.toggle('is-current', i === cur)); }
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  /* ---------- Reveal observer ---------- */
  const revealTargets = () => $$('[data-reveal], [data-lines], [data-split], [data-observe]').filter((el) => !el.classList.contains('is-in'));
  const showAll = () => revealTargets().forEach((el) => el.classList.add('is-in'));

  if (isMotionPaused() || !('IntersectionObserver' in window)) {
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
  }

  /* ---------- Scroll-lit words ---------- */
  const scrubs = $$('[data-scrub]').map((el) => {
    const words = splitWords(el, 'sw');
    words.forEach((w) => { if (w.closest('em')) w.classList.add('gold'); });
    return { el, words, lit: 0, r: null };
  });
  if (isMotionPaused()) scrubs.forEach((s) => s.words.forEach((w) => w.classList.add('on')));

  /* ---------- Scroll-linked effects ----------
     Smoothness rules: every frame reads all positions first and writes after,
     writes happen only when a value changes, and only transform/opacity/colour
     are touched. Where the browser supports scroll-driven animations (html.sda)
     parallax and the stacked panels run in CSS on the compositor instead. */
  const scrollDriven = !!(window.CSS && CSS.supports('animation-timeline: view()') && CSS.supports('timeline-scope: --a'));
  if (scrollDriven && !isMotionPaused()) root.classList.add('sda');

  const header = document.querySelector('[data-autohide]');
  const toggles = $$('.nav__toggle, .gs-nav__hamburger');
  const menuOpen = () => toggles.some((t) => t.classList.contains('active') || t.classList.contains('open'));
  let lastY = scrollY;
  let navH = header ? header.offsetHeight : 0;
  let navHidden = false;
  // A class, not a CSS variable: a variable on <html> would restyle every element on the
  // page each time the header moves; a class only touches rules that name it (.journal-bar).
  const syncNavOffset = () => { root.classList.toggle('da-nav-hidden', navHidden); };
  header?.addEventListener('focusin', () => {
    navHidden = false;
    header.classList.remove('is-hidden');
    syncNavOffset();
  });

  const parallax = $$('[data-parallax]').map((el) => {
    const speed = parseFloat(el.dataset.parallax) || 0.15;
    el.style.setProperty('--px', speed);
    // Measure the host, not the moving element, so the effect never chases its own offset.
    return { el, speed, host: el.parentElement || el, last: null, r: null };
  });
  const desktopStack = window.matchMedia('(min-width: 960px)');
  const stacks = $$('[data-stack]').map((el) => $$(':scope > [data-stack-item]', el).map((item) => ({
    item, inner: item.querySelector('.front__inner'), shade: item.querySelector('.front__shade'), last: -1, nt: null,
  })));
  const resetStacks = () => stacks.forEach((items) => items.forEach((s) => {
    if (s.last === -1) return;
    s.last = -1;
    if (s.inner) s.inner.style.transform = '';
    if (s.shade) s.shade.style.opacity = '';
  }));
  desktopStack.addEventListener('change', resetStacks);
  const marquees = $$('.da-marquee__track, .gs-marquee__track');
  let marqueeAnims = null;
  let marqueeRate = 1;
  let velocity = 0;
  let frame = 0;

  function onFrame() {
    frame = 0;
    const y = scrollY;
    const dy = y - lastY;
    lastY = y;
    velocity = velocity * 0.82 + Math.abs(dy) * 0.18;
    const vh = innerHeight;
    const live = !isMotionPaused();
    const jsParallax = live && !scrollDriven;
    const jsStack = live && !scrollDriven && desktopStack.matches;

    // 1 — Read.
    if (jsParallax) parallax.forEach((p) => { p.r = p.host.getBoundingClientRect(); });
    if (jsStack) stacks.forEach((items) => items.forEach((s, i) => { s.nt = items[i + 1] ? items[i + 1].item.getBoundingClientRect().top : null; }));
    if (live) scrubs.forEach((s) => { s.r = s.el.getBoundingClientRect(); });

    // 2 — Write.
    if (header && !menuOpen()) {
      let hidden = navHidden;
      if (header.contains(document.activeElement)) hidden = false;
      else if (dy > 4 && y > Math.max(navH * 4, 360)) hidden = true;
      else if (dy < -4 || y < navH * 2) hidden = false;
      if (hidden !== navHidden) {
        navHidden = hidden;
        header.classList.toggle('is-hidden', hidden);
        syncNavOffset();
      }
    }

    if (jsParallax) parallax.forEach((p) => {
      const r = p.r;
      if (r.bottom < -200 || r.top > vh + 200) return;
      const off = Math.round((r.top + r.height / 2 - vh / 2) * -p.speed * 2) / 2;
      if (off !== p.last) { p.last = off; p.el.style.translate = `0 ${off}px`; }
    });

    if (jsStack) stacks.forEach((items) => items.forEach((s) => {
      const p = s.nt === null ? 0 : Math.round(clamp(1 - s.nt / vh, 0, 1) * 400) / 400;
      if (p === s.last) return;
      s.last = p;
      if (s.inner) s.inner.style.transform = p ? `scale(${(1 - p * 0.05).toFixed(4)})` : '';
      if (s.shade) s.shade.style.opacity = p ? (p * 0.62).toFixed(3) : '';
    }));

    if (live) scrubs.forEach((s) => {
      const r = s.r;
      if (r.bottom < 0 || r.top > vh) return;
      const p = clamp((vh * 0.82 - r.top) / (r.height + vh * 0.32), 0, 1);
      const lit = Math.min(s.words.length, Math.round(p * s.words.length * 1.04));
      if (lit === s.lit) return;
      // Touch only the words whose state flips.
      for (let i = Math.min(lit, s.lit); i < Math.max(lit, s.lit); i++) s.words[i].classList.toggle('on', i < lit);
      s.lit = lit;
    });

    if (live && marquees.length) {
      // Speed up with the scroll, in coarse steps so the compositor isn't re-synced every frame.
      const rate = Math.round((1 + Math.min(velocity / 14, 4)) * 4) / 4;
      if (rate !== marqueeRate) {
        if (!marqueeAnims) marqueeAnims = marquees.map((t) => (t.getAnimations ? t.getAnimations()[0] : null)).filter(Boolean);
        marqueeRate = rate;
        marqueeAnims.forEach((a) => { if (a.updatePlaybackRate) a.updatePlaybackRate(rate); else a.playbackRate = rate; });
      }
    }

    if (velocity > 0.2 && live) request();
  }
  function request() { if (!frame) frame = requestAnimationFrame(onFrame); }
  addEventListener('scroll', request, { passive: true });
  addEventListener('resize', () => { navH = header ? header.offsetHeight : 0; syncNavOffset(); request(); }, { passive: true });
  request();

  /* ---------- Endless loops sleep while off-screen ---------- */
  if ('IntersectionObserver' in window) {
    const sleepers = $$('.gilded, .gx-shine, .da-dot, .hx__portrait, .hx__scroll, .ink-hero__seal, .ink-hero__drop, .gx-hero__rays, .gx-hero__foot, .gx-slate, .gx-status, .gx-book__cover, .da-marquee, .gs-marquee');
    const so = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => target.classList.toggle('is-asleep', !isIntersecting));
    }, { rootMargin: '120px 0px' });
    sleepers.forEach((el) => so.observe(el));
  }

  /* ---------- Blog hero: drop the noise filter once the ink has settled ---------- */
  const settle = document.querySelector('.ink-word__text');
  if (settle) setTimeout(() => settle.classList.add('is-settled'), isMotionPaused() ? 0 : 3300);

  /* ---------- Magnetic buttons & tilt cards (fine pointers only) ---------- */
  if (finePointer.matches) {
    // Depth: layers inside [data-depth-host] drift with the pointer, each by its own amount.
    $$('[data-depth-host]').forEach((host) => {
      const layers = $$('[data-depth]', host).map((el) => ({ el, d: parseFloat(el.dataset.depth) || 10 }));
      let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
      const step = () => {
        raf = 0;
        if (isMotionPaused()) return;
        x += (tx - x) * 0.07; y += (ty - y) * 0.07;
        layers.forEach((l) => { l.el.style.translate = `${(x * l.d).toFixed(2)}px ${(y * l.d).toFixed(2)}px`; });
        raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.002 ? requestAnimationFrame(step) : 0;
      };
      host.addEventListener('pointermove', (e) => {
        if (isMotionPaused()) return;
        const r = host.getBoundingClientRect();
        tx = (e.clientX - r.left) / r.width - 0.5;
        ty = (e.clientY - r.top) / r.height - 0.5;
        if (!raf) raf = requestAnimationFrame(step);
      }, { passive: true });
      host.addEventListener('pointerleave', () => { tx = 0; ty = 0; if (!raf && !isMotionPaused()) raf = requestAnimationFrame(step); });
      motionListeners.push((paused) => {
        if (!paused) return;
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        tx = ty = x = y = 0;
        layers.forEach((layer) => { layer.el.style.translate = ''; });
      });
    });
    $$('[data-magnetic]').forEach((el) => {
      const strength = parseFloat(el.dataset.magnetic) || 0.28;
      el.addEventListener('pointermove', (e) => {
        if (isMotionPaused()) return;
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * strength;
        const y = (e.clientY - r.top - r.height / 2) * strength;
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
      motionListeners.push((paused) => { if (paused) el.style.transform = ''; });
    });
    $$('[data-tilt]').forEach((el) => {
      const max = parseFloat(el.dataset.tilt) || 8;
      el.addEventListener('pointermove', (e) => {
        if (isMotionPaused()) return;
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty('--rx', `${(-py * max).toFixed(2)}deg`);
        el.style.setProperty('--ry', `${(px * max).toFixed(2)}deg`);
        el.style.setProperty('--mx', `${((px + 0.5) * 100).toFixed(1)}%`);
        el.style.setProperty('--my', `${((py + 0.5) * 100).toFixed(1)}%`);
      });
      el.addEventListener('pointerleave', () => { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
      motionListeners.push((paused) => {
        if (paused) ['--rx', '--ry', '--mx', '--my'].forEach((property) => el.style.removeProperty(property));
      });
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
        if (isMotionPaused()) { target.textContent = end; return; }
        const t0 = performance.now();
        const step = (t) => {
          if (isMotionPaused()) { target.textContent = end; return; }
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
    let elapsed = 0, lastTick = 0, timer = 0;
    const pad = (n) => String(n).padStart(2, '0');
    const tick = () => {
      timer = 0;
      if (!el.isConnected || isMotionPaused() || document.hidden) { lastTick = 0; return; }
      // Off-screen or in a background tab: check back later instead of re-laying out text 24×/s.
      if (el.closest('.is-asleep')) { lastTick = 0; timer = setTimeout(tick, 500); return; }
      const now = performance.now();
      if (lastTick) elapsed += (now - lastTick) / 1000;
      lastTick = now;
      const t = elapsed;
      const f = Math.floor((t % 1) * 24);
      el.textContent = `00:${pad(Math.floor(t / 60) % 60)}:${pad(Math.floor(t) % 60)}:${pad(f)}`;
      timer = setTimeout(tick, 1000 / 24);
    };
    const sync = (paused) => {
      if (timer) clearTimeout(timer);
      timer = 0;
      lastTick = 0;
      if (!paused && !document.hidden) tick();
    };
    motionListeners.push(sync);
    document.addEventListener('visibilitychange', () => sync(isMotionPaused()));
  });

  function syncMotion() {
    const paused = isMotionPaused();
    root.classList.toggle('motion-paused', paused);
    root.classList.toggle('sda', scrollDriven && !paused);
    if (motionControl) {
      motionControl.textContent = reduce.matches ? 'Reduced motion' : paused ? 'Resume motion' : 'Pause motion';
      motionControl.setAttribute('aria-pressed', String(paused));
      motionControl.disabled = reduce.matches;
      if (reduce.matches) {
        motionControl.setAttribute('aria-label', 'Reduced motion is enabled in your device settings');
        motionControl.title = 'Your device is set to reduce motion.';
      } else {
        motionControl.removeAttribute('aria-label');
        motionControl.removeAttribute('title');
      }
    }
    if (paused) {
      showAll();
      resetStacks();
      parallax.forEach((item) => { item.last = null; item.el.style.translate = ''; });
      scrubs.forEach((item) => {
        item.words.forEach((word) => word.classList.add('on'));
        item.lit = item.words.length;
      });
      settle?.classList.add('is-settled');
      velocity = 0;
    }
    motionListeners.forEach((listener) => listener(paused));
    lastY = scrollY;
    request();
    document.dispatchEvent(new CustomEvent('site:motion-change', { detail: { paused } }));
  }
  motionControl?.addEventListener('click', () => {
    if (reduce.matches) return;
    userPaused = !userPaused;
    try { localStorage.setItem(pauseKey, String(userPaused)); } catch { /* Preference remains active for this page. */ }
    syncMotion();
  });
  reduce.addEventListener('change', syncMotion);
  window.addEventListener('storage', (event) => {
    if (event.key !== pauseKey) return;
    userPaused = event.newValue === 'true';
    syncMotion();
  });
  syncMotion();

  const year = document.getElementById('year');
  if (year && !year.textContent) year.textContent = new Date().getFullYear();
})();
