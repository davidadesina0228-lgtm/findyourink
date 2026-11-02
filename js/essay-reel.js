/* Arrow controls complement the native swipe reel. Desktop keeps its scroll choreography. */
(() => {
  'use strict';
  const reel = document.querySelector('.h-reel');
  if (!reel) return;
  const viewport = reel.querySelector('.h-reel__viewport');
  const track = reel.querySelector('.h-reel__track');
  const items = Array.from(track.children);
  const prev = reel.querySelector('[data-reel-prev]');
  const next = reel.querySelector('[data-reel-next]');
  const position = reel.querySelector('.h-reel__position');
  let targets = [];
  let frame = 0;

  function measure() {
    const left = viewport.getBoundingClientRect().left;
    const inset = parseFloat(getComputedStyle(track).paddingLeft) || 0;
    const max = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    targets = items.map(item => Math.max(0, Math.min(max,
      item.getBoundingClientRect().left - left + viewport.scrollLeft - inset)));
    reel.classList.toggle('reel-ready', max > 1);
    update();
  }

  function update() {
    frame = 0;
    const x = viewport.scrollLeft;
    const max = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    const atEnd = x >= max - 2;
    let current = 0;
    targets.forEach((target, index) => { if (target <= x + 2) current = index; });
    position.textContent = `${String(current + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;
    prev.setAttribute('aria-disabled', String(x <= 2));
    next.setAttribute('aria-disabled', String(atEnd));
  }

  function browse(direction) {
    const button = direction > 0 ? next : prev;
    if (button.getAttribute('aria-disabled') === 'true') return;
    // Re-measure after a viewport or motion-mode change before choosing the next print.
    measure();
    const x = viewport.scrollLeft;
    const target = direction > 0
      ? targets.find(value => value > x + 2)
      : [...targets].reverse().find(value => value < x - 2);
    if (target === undefined) return;
    const paused = document.documentElement.classList.contains('motion-paused');
    viewport.scrollTo({left: target, behavior: paused ? 'instant' : 'smooth'});
  }

  prev.addEventListener('click', () => browse(-1));
  next.addEventListener('click', () => browse(1));
  viewport.addEventListener('scroll', () => {
    if (!frame) frame = requestAnimationFrame(update);
  }, {passive: true});
  window.addEventListener('resize', measure, {passive: true});
  document.addEventListener('site:motion-change', () => requestAnimationFrame(measure));
  measure();
})();
