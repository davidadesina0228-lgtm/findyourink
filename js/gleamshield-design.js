/* GleamShield: shared navigation and progressive scroll choreography. */
(() => {
  'use strict';
  const menu = document.getElementById('gs-mobile-menu');
  const trigger = document.getElementById('gs-hamburger');
  if (!menu || !trigger) return;

  trigger.setAttribute('aria-controls', menu.id);
  const background = [...document.querySelectorAll('main, footer')];
  const previousInert = new Map();
  let wasOpen = false;
  let returnFocus = null;

  const syncMenu = () => {
    const open = menu.classList.contains('open');
    if (open === wasOpen) return;
    wasOpen = open;
    if (open) {
      returnFocus = document.activeElement;
      menu.setAttribute('aria-modal', 'true');
      background.forEach((element) => {
        previousInert.set(element, element.inert);
        element.inert = true;
      });
      menu.querySelector('a[href]')?.focus();
    } else {
      menu.removeAttribute('aria-modal');
      background.forEach((element) => { element.inert = previousInert.get(element) || false; });
      if (returnFocus?.isConnected) returnFocus.focus();
    }
  };
  new MutationObserver(syncMenu).observe(menu, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab' || !menu.classList.contains('open')) return;
    const targets = [trigger, ...menu.querySelectorAll('a[href], button')];
    const first = targets[0];
    const last = targets[targets.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  window.matchMedia('(min-width: 801px)').addEventListener('change', (event) => {
    if (!event.matches || !menu.classList.contains('open')) return;
    // The hamburger becomes hidden on desktop; restore focus to the visible brand.
    returnFocus = document.querySelector('#gs-nav .gs-nav__brand');
    menu.classList.remove('open');
    trigger.classList.remove('open');
    trigger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
})();

(() => {
  'use strict';

  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!('IntersectionObserver' in window) || motionPreference.matches) return;

  const selectors = [
    '.gs-section-header',
    '.gs-section > .gs-container > .gs-label',
    '.gs-section > .gs-container > h2',
    '.gs-feature-grid > div',
    '.gs-grid > article',
    '.gs-grid > a',
    '.gs-grid > .gs-pillar',
    '.gs-grid > .gs-founder',
    '.gs-featured-post',
    '.gs-story-card',
    '.gs-book-card',
    '.gs-chapter-item',
    '.gs-char-detail__sidebar',
    '.gs-timeline__item',
    '.gs-article-figure',
    '.gs-article-content > h2',
    '.gs-article-content > blockquote',
    '.gs-cta-band > .gs-container'
  ].join(', ');

  const items = [...document.querySelectorAll(selectors)];
  const reveal = (element) => {
    element.classList.remove('gs-reveal--pending');
    element.classList.add('gs-reveal--visible');
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) return;
      reveal(target);
      observer.unobserve(target);
    });
  }, { threshold: 0.06, rootMargin: '0px 0px -24px 0px' });

  items.forEach((element) => {
    // Large blocks stay visible so a tall article never waits off-screen.
    if (element.getBoundingClientRect().height > window.innerHeight * 1.5) return;
    element.classList.add('gs-reveal');
    const parent = element.parentElement;
    if (parent && parent.classList.contains('gs-grid')) {
      const position = [...parent.children].indexOf(element) % 4;
      element.style.setProperty('--gs-reveal-delay', `${position * 65}ms`);
    }
    if (element.getBoundingClientRect().top < window.innerHeight - 24) {
      reveal(element);
    } else {
      element.classList.add('gs-reveal--pending');
      observer.observe(element);
    }
  });

  // Keyboard navigation must never land on an invisible interactive element.
  document.addEventListener('focusin', (event) => {
    const pending = event.target.closest('.gs-reveal--pending');
    if (pending) {
      reveal(pending);
      observer.unobserve(pending);
    }
  });

  const hero = document.querySelector('.gs-home .gs-hero');
  let frame = 0;
  const updateHero = () => {
    frame = 0;
    if (!hero || motionPreference.matches) return;
    hero.style.setProperty('--gs-hero-offset', `${Math.min(window.scrollY * 0.08, 42)}px`);
  };
  const onScroll = () => {
    if (!frame) frame = requestAnimationFrame(updateHero);
  };
  if (hero) window.addEventListener('scroll', onScroll, { passive: true });

  motionPreference.addEventListener('change', (event) => {
    if (!event.matches) return;
    observer.disconnect();
    items.forEach(reveal);
    window.removeEventListener('scroll', onScroll);
    if (frame) cancelAnimationFrame(frame);
    if (hero) hero.style.removeProperty('--gs-hero-offset');
  });
})();
