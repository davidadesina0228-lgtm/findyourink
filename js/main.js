/* ================================================================
   FIND YOUR INK — Main JavaScript
   davidadesina.com
   ================================================================ */

(function () {
  'use strict';

  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ================================================================
     NAVIGATION — Transparent → Scrolled state
     ================================================================ */
  const nav = document.querySelector('.nav');
  let navScrolled = null;

  function handleNavScroll() {
    if (!nav) return;
    const scrolled = window.scrollY > 60;
    if (scrolled === navScrolled) return; // only touch the DOM when the state flips
    navScrolled = scrolled;
    nav.classList.toggle('nav--scrolled', scrolled);
  }

  // One handler per frame for everything that follows the scroll.
  let scrollFrame = 0;
  function onScrollFrame() {
    scrollFrame = 0;
    handleNavScroll();
    updateReadingProgress();
  }
  window.addEventListener('scroll', () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(onScrollFrame);
  }, { passive: true });
  handleNavScroll(); // run once on load

  /* ================================================================
     ACTIVE NAV LINK — highlight current page
     ================================================================ */
  const navLinks = document.querySelectorAll('.nav__link');
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || href === './' + currentPath) {
      link.classList.add('active');
    }
    // Handle root/index
    if ((currentPath === '' || currentPath === 'index.html') && (href === 'index.html' || href === './')) {
      link.classList.add('active');
    }
  });

  /* ================================================================
     MOBILE MENU TOGGLE
     ================================================================ */
  const menuToggle = document.querySelector('.nav__toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-menu__link');
  let menuOverflow = '';

  if (mobileMenu) {
    mobileMenu.inert = true;
    mobileMenu.setAttribute('aria-hidden', 'true');
  }

  function openMenu() {
    if (!mobileMenu || !menuToggle) return;
    mobileMenu.classList.add('open');
    mobileMenu.inert = false;
    mobileMenu.setAttribute('aria-hidden', 'false');
    menuToggle.classList.add('active');
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', 'Close menu');
    menuOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    mobileLinks[0]?.focus();
  }

  function closeMenu(restoreFocus = true) {
    if (!mobileMenu || !menuToggle || !mobileMenu.classList.contains('open')) return;
    mobileMenu.classList.remove('open');
    if (restoreFocus) menuToggle.focus();
    mobileMenu.inert = true;
    mobileMenu.setAttribute('aria-hidden', 'true');
    menuToggle.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open menu');
    document.body.style.overflow = menuOverflow;
  }

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', function () {
      const isOpen = mobileMenu.classList.contains('open');
      if (isOpen) closeMenu();
      else openMenu();
    });
  }

  // Close on mobile link click
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => closeMenu(false));
  });

  // Keep keyboard focus within the open menu, including its close button.
  document.addEventListener('keydown', function (e) {
    if (!mobileMenu?.classList.contains('open')) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      closeMenu();
    }
    if (e.key === 'Tab') {
      const controls = [menuToggle, ...mobileMenu.querySelectorAll('a[href], button:not([disabled])')];
      const index = controls.indexOf(document.activeElement);
      const next = e.shiftKey ? index - 1 : index + 1;
      e.preventDefault();
      controls[(next + controls.length) % controls.length].focus();
    }
  });

  window.addEventListener('resize', () => {
    if (mobileMenu?.classList.contains('open') && getComputedStyle(menuToggle).display === 'none') {
      const focusWasInMenu = mobileMenu.contains(document.activeElement);
      closeMenu(false);
      if (focusWasInMenu) nav?.querySelector('a[href]')?.focus();
    }
  });

  /* ================================================================
     READING PROGRESS BAR (blog posts only)
     ================================================================ */
  const progressBar = document.querySelector('.reading-progress');
  const articleBody = document.querySelector('.article-wrapper');
  let lastProgress = -1;
  let lastProgressLabel = '';

  function updateReadingProgress() {
    if (!progressBar || !articleBody) return;
    const rect = articleBody.getBoundingClientRect();
    const readable = rect.height - window.innerHeight;
    const progress = readable > 0
      ? Math.min(Math.max((-rect.top / readable) * 100, 0), 100)
      : (rect.top <= 0 ? 100 : 0);
    const rounded = Math.round(progress * 10) / 10;
    if (rounded !== lastProgress) {
      lastProgress = rounded;
      progressBar.style.transform = `scaleX(${(rounded / 100).toFixed(4)})`; // scale, not width: no layout
    }
    const label = String(Math.round(progress));
    if (label !== lastProgressLabel) {
      lastProgressLabel = label;
      progressBar.setAttribute('aria-valuenow', label);
    }
  }

  if (progressBar) {
    window.addEventListener('resize', updateReadingProgress);
    window.addEventListener('load', updateReadingProgress);
    updateReadingProgress();
  }

  /* ================================================================
     SMOOTH SCROLL — anchor links
     ================================================================ */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      let target;
      try { target = document.getElementById(decodeURIComponent(targetId.slice(1))); }
      catch { return; }
      if (target) {
        e.preventDefault();
        const offset = nav ? nav.offsetHeight + 20 : 80;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: targetPosition, behavior: motionPreference.matches ? 'instant' : 'smooth' });
        if (!target.hasAttribute('tabindex')) {
          target.setAttribute('tabindex', '-1');
          target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
        }
        target.focus({ preventScroll: true });
        history.pushState(null, '', targetId);
      }
    });
  });

  /* ================================================================
     LAZY LOADING IMAGES
     ================================================================ */
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              img.classList.add('loaded');
            }
            imageObserver.unobserve(img);
          }
        });
      },
      { rootMargin: '50px 0px' }
    );

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  } else {
    // Fallback for older browsers
    document.querySelectorAll('img[data-src]').forEach(img => {
      img.src = img.dataset.src;
    });
  }

  /* ================================================================
     FADE-IN ON SCROLL — elements with .js-fade class
     ================================================================ */
  if ('IntersectionObserver' in window && !motionPreference.matches) {
    const fadeObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            fadeObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.js-fade').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      fadeObserver.observe(el);
    });

    motionPreference.addEventListener('change', event => {
      if (!event.matches) return;
      fadeObserver.disconnect();
      document.querySelectorAll('.js-fade').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
        el.style.transition = 'none';
      });
    });
  }

  /* ================================================================
     NEWSLETTER FORM — client-side handling
     Replace the action URL with your email service endpoint
     Supports: ConvertKit, Mailerlite, Beehiiv, Substack API
     ================================================================ */
  const NEWSLETTER_COMING_SOON = false;
  const newsletterForms = document.querySelectorAll('.newsletter__form');

  function activateNewsletterComingSoonMode() {
    if (!NEWSLETTER_COMING_SOON) return;

    newsletterForms.forEach(form => {
      const emailInput = form.querySelector('.newsletter__input');
      const submitBtn = form.querySelector('button[type="submit"]');

      if (emailInput) {
        emailInput.value = '';
        emailInput.placeholder = 'Newsletter coming soon';
        emailInput.disabled = true;
        emailInput.setAttribute('aria-disabled', 'true');
      }

      if (submitBtn) {
        submitBtn.textContent = 'Coming Soon';
        submitBtn.disabled = true;
        submitBtn.setAttribute('aria-disabled', 'true');
      }

      showFormMessage(form, 'Newsletter is coming soon. Check back soon.', 'success', true);
    });

    // Update CTA links that point to newsletter sections.
    const newsletterLinks = document.querySelectorAll('a[href*="#newsletter"]');
    newsletterLinks.forEach(link => {
      link.textContent = 'Newsletter Coming Soon';
      link.setAttribute('aria-disabled', 'true');
      link.setAttribute('title', 'Newsletter coming soon');
      link.addEventListener('click', function (e) {
        e.preventDefault();
      });
    });
  }

  activateNewsletterComingSoonMode();

  newsletterForms.forEach(form => {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      if (NEWSLETTER_COMING_SOON) {
        showFormMessage(form, 'Newsletter is coming soon. Check back soon.', 'success', true);
        return;
      }

      const emailInput = form.querySelector('.newsletter__input');
      const submitBtn = form.querySelector('button[type="submit"]');
      const email = emailInput ? emailInput.value.trim() : '';

      if (!email || !isValidEmail(email)) {
        showFormMessage(form, 'Please enter a valid email address.', 'error');
        return;
      }

      const originalBtnText = submitBtn ? submitBtn.textContent : 'Subscribe';
      if (submitBtn) {
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
      }

      try {
        // Replace with your actual newsletter service endpoint
        // ConvertKit: https://app.convertkit.com/forms/YOUR_FORM_ID/subscriptions
        // Mailerlite: Use their API
        // For now, simulating success (replace with real endpoint)
        const serviceUrl = form.getAttribute('data-action') || '#';

        if (serviceUrl === '#') {
          // Development mode — show success without actual request
          await delay(800);
          showFormMessage(
            form,
            'You\'re in. Watch for words that cost something.',
            'success'
          );
          emailInput.value = '';
        } else {
          const response = await fetch(serviceUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ email }),
          });

          if (response.ok) {
            showFormMessage(
              form,
              'You\'re in. Watch for words that cost something.',
              'success'
            );
            emailInput.value = '';
          } else {
            throw new Error('Subscription failed');
          }
        }
      } catch (err) {
        showFormMessage(form, 'Something went wrong. Try again.', 'error');
      } finally {
        if (submitBtn) {
          submitBtn.textContent = originalBtnText;
          submitBtn.disabled = false;
        }
      }
    });
  });

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function showFormMessage(form, message, type, persistent = false) {
    let msg = form.querySelector('.form-message');
    if (!msg) {
      msg = document.createElement('p');
      msg.className = 'form-message';
      msg.style.cssText =
        'margin-top: 0.75rem; font-size: 0.875rem; font-weight: 500; letter-spacing: 0.03em;';
      form.appendChild(msg);
    }
    msg.textContent = message;
    msg.style.color = type === 'success' ? '#C9A961' : '#e05555';
    msg.dataset.persistent = persistent ? 'true' : 'false';
    if (persistent) return;
    // Auto-clear after 6 seconds
    setTimeout(() => {
      msg.textContent = '';
    }, 6000);
  }

  /* ================================================================
     CONTACT FORM — handle submission
     ================================================================ */
  const contactForm = document.querySelector('.contact-form form');

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      // Replace with your form backend (Formspree, Netlify Forms, etc.)
      // For now, show a confirmation
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        const orig = submitBtn.textContent;
        submitBtn.textContent = 'Message sent.';
        submitBtn.disabled = true;
        setTimeout(() => {
          submitBtn.textContent = orig;
          submitBtn.disabled = false;
          contactForm.reset();
        }, 4000);
      }
    });
  }

  /* ================================================================
     SHARE — copy link button
     ================================================================ */
  const copyBtn = document.querySelector('.share__btn--copy');

  if (copyBtn) {
    copyBtn.setAttribute('aria-live', 'polite');
    copyBtn.addEventListener('click', async function () {
      const originalLabel = copyBtn.textContent;
      try {
        if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(window.location.href);
        copyBtn.textContent = 'Copied!';
      } catch {
        const input = document.createElement('textarea');
        input.value = window.location.href;
        input.setAttribute('aria-label', 'Article link');
        input.style.cssText = 'position:fixed;left:-9999px;top:0;';
        document.body.appendChild(input);
        input.select();
        let copied = false;
        try { copied = document.execCommand('copy'); } catch { /* Show a truthful fallback. */ }
        input.remove();
        copyBtn.focus();
        copyBtn.textContent = copied ? 'Copied!' : 'Copy the address from your browser';
      }
      setTimeout(() => { copyBtn.textContent = originalLabel; }, 2500);
    });
  }

  /* ================================================================
     BLOG CARD COVERS - replace placeholder blocks with generated art
     ================================================================ */
  function getBlogCoverBasePath() {
    return window.location.pathname.includes('/blog/')
      ? '../images/blog-covers/'
      : 'images/blog-covers/';
  }

  function getSlugFromLink(href) {
    if (!href) return null;
    const cleanHref = href.split('?')[0].split('#')[0];
    const match = cleanHref.match(/(?:^|\/)([^\/?#]+)\.html$/i);
    return match ? match[1] : null;
  }

  function hydrateBlogCardCovers() {
    const placeholders = document.querySelectorAll('.card__image-placeholder');
    if (!placeholders.length) return;

    const basePath = getBlogCoverBasePath();
    placeholders.forEach(placeholder => {
      const card = placeholder.closest('.card');
      if (!card) return;

      const link =
        card.querySelector('.card__title a[href]') ||
        card.querySelector('.card__link[href]');

      if (!link) return;
      const slug = getSlugFromLink(link.getAttribute('href'));
      if (!slug) return;

      const image = document.createElement('img');
      image.src = `${basePath}${slug}.svg`;
      image.alt = (link.textContent || 'Blog cover image').replace(/\s+/g, ' ').trim();
      image.loading = 'lazy';
      image.decoding = 'async';

      image.onerror = function () {
        // Preserve the existing placeholder if a cover file is missing.
        image.replaceWith(placeholder);
      };

      placeholder.replaceWith(image);
    });
  }

  hydrateBlogCardCovers();

  /* ================================================================
     BLOG SEARCH AND CATEGORY FILTERS
     ================================================================ */
  const filterPills = Array.from(document.querySelectorAll('.blog-filters .category-pill'));
  const blogCards = Array.from(document.querySelectorAll('.card[data-category]'));
  const searchInput = document.getElementById('blog-search-input');

  if (searchInput && blogCards.length) {
    const clearButton = document.getElementById('blog-search-clear');
    const count = document.getElementById('blog-search-count');
    const emptyState = document.getElementById('blog-empty-state');
    const resetButton = document.getElementById('blog-reset-filters');
    const featureSection = document.querySelector('.journal-feature');
    const validCategories = new Set(filterPills.map(pill => pill.dataset.category));
    const searchableCards = blogCards.map(card => ({
      card,
      category: card.dataset.category,
      text: ['.card__title', '.card__excerpt', '.card__category']
        .map(selector => card.querySelector(selector)?.textContent || '')
        .join(' ').replace(/\s+/g, ' ').toLocaleLowerCase(),
    }));
    let category = 'all';

    function readFiltersFromUrl() {
      const parameters = new URLSearchParams(window.location.search);
      const requestedCategory = parameters.get('category');
      category = validCategories.has(requestedCategory) ? requestedCategory : 'all';
      searchInput.value = parameters.get('q') || '';
    }

    function filterPosts(updateUrl = true) {
      const query = searchInput.value.trim().toLocaleLowerCase();
      let visible = 0;

      searchableCards.forEach(item => {
        const matches = (category === 'all' || item.category === category) &&
          (!query || item.text.includes(query));
        item.card.hidden = !matches;
        // Existing card display rules can override the browser's hidden style.
        item.card.style.display = matches ? '' : 'none';
        if (matches) visible++;
      });

      if (featureSection) {
        const featuredCard = featureSection.querySelector('.card[data-category]');
        featureSection.hidden = Boolean(featuredCard?.hidden);
        featureSection.style.display = featureSection.hidden ? 'none' : '';
      }

      filterPills.forEach(pill => {
        const active = pill.dataset.category === category;
        pill.classList.toggle('active', active);
        pill.setAttribute('aria-pressed', String(active));
      });
      if (clearButton) clearButton.hidden = !query;
      if (emptyState) emptyState.hidden = visible !== 0;
      if (count) {
        count.hidden = false;
        count.textContent = visible === 0
          ? 'No essays found. Try another search or topic.'
          : `${visible} ${visible === 1 ? 'essay' : 'essays'}${query || category !== 'all' ? ` of ${blogCards.length}` : ''}`;
      }

      if (updateUrl) {
        const url = new URL(window.location.href);
        if (category === 'all') url.searchParams.delete('category');
        else url.searchParams.set('category', category);
        if (query) url.searchParams.set('q', searchInput.value.trim());
        else url.searchParams.delete('q');
        history.replaceState(null, '', url);
      }
    }

    filterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        category = pill.dataset.category;
        filterPosts();
      });
    });
    searchInput.addEventListener('input', () => filterPosts());
    clearButton?.addEventListener('click', () => {
      searchInput.value = '';
      filterPosts();
      searchInput.focus();
    });
    resetButton?.addEventListener('click', () => {
      category = 'all';
      searchInput.value = '';
      filterPosts();
      searchInput.focus();
    });
    window.addEventListener('popstate', () => {
      readFiltersFromUrl();
      filterPosts(false);
    });
    readFiltersFromUrl();
    filterPosts(false);
  }

  /* ================================================================
     HERO SCROLL INDICATOR — hide on scroll
     ================================================================ */
  const scrollIndicator = document.querySelector('.hero__scroll');

  if (scrollIndicator) {
    window.addEventListener(
      'scroll',
      function () {
        scrollIndicator.style.opacity = window.scrollY > 100 ? '0' : '';
      },
      { passive: true }
    );
  }

  /* ================================================================
     COOKIE CONSENT BANNER
     Loads GA4 + AdSense only after user accepts
     ================================================================ */
  const COOKIE_KEY = 'fyi_cookie_consent';

  function saveConsent(value) {
    try { localStorage.setItem(COOKIE_KEY, value); } catch { /* Storage can be unavailable in private browsing. */ }
  }

  function loadAnalytics() {
    // Google Analytics 4
    // Replace GA_MEASUREMENT_ID with your actual Measurement ID from analytics.google.com
    const GA_ID = 'GA_MEASUREMENT_ID'; // e.g. 'G-XXXXXXXXXX'
    if (GA_ID === 'GA_MEASUREMENT_ID') return; // Placeholder — skip until real ID added

    const gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(gaScript);

    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_ID, { anonymize_ip: true });
  }

  function loadAdSense() {
    // Google AdSense
    // Replace ca-pub-XXXXXXXXXXXXXXXX with your Publisher ID from adsense.google.com
    const ADSENSE_ID = 'ca-pub-6207125181553910';

    const adScript = document.createElement('script');
    adScript.async = true;
    adScript.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + ADSENSE_ID;
    adScript.crossOrigin = 'anonymous';
    document.head.appendChild(adScript);
  }

  function initCookieBanner() {
    let consent = null;
    try { consent = localStorage.getItem(COOKIE_KEY); } catch { /* Keep consent controls available. */ }

    if (consent === 'accepted') {
      loadAnalytics();
      loadAdSense();
      return;
    }

    if (consent === 'declined') return;

    // Show banner after short delay
    const banner = document.querySelector('.cookie-banner');
    if (!banner) return;

    setTimeout(() => banner.classList.add('visible'), 1200);

    const acceptBtn = banner.querySelector('.cookie-banner__accept');
    const declineBtn = banner.querySelector('.cookie-banner__decline');

    if (acceptBtn) {
      acceptBtn.addEventListener('click', function () {
        saveConsent('accepted');
        banner.classList.remove('visible');
        loadAnalytics();
        loadAdSense();
      });
    }

    if (declineBtn) {
      declineBtn.addEventListener('click', function () {
        saveConsent('declined');
        banner.classList.remove('visible');
      });
    }
  }

  initCookieBanner();

  // Popup markup follows this script on legacy pages. Enhance focus only;
  // the existing popup still owns its display, timing, and dismissal preference.
  function enhanceNewsletterPopup() {
    document.querySelectorAll('iframe.beehiiv-embed, #dal-popup-iframe').forEach(frame => {
      if (!frame.title) frame.title = 'Subscribe to The David Adesina Letter';
    });
    const popup = document.getElementById('dal-popup-overlay');
    if (!popup) return;
    const closeButton = document.getElementById('dal-popup-close');
    let wasOpen = false;
    let previousFocus = null;

    function syncPopup() {
      const isOpen = getComputedStyle(popup).display !== 'none';
      if (isOpen === wasOpen) return;
      wasOpen = isOpen;
      if (isOpen) {
        previousFocus = document.activeElement;
        closeMenu(false);
        document.body.style.overflow = 'hidden';
        closeButton?.focus();
      } else if (previousFocus?.isConnected) {
        previousFocus.focus({ preventScroll: true });
      }
    }

    new MutationObserver(syncPopup).observe(popup, { attributes: true, attributeFilter: ['style', 'class'] });
    document.addEventListener('focusin', event => {
      if (wasOpen && !popup.contains(event.target)) closeButton?.focus();
    });
    popup.addEventListener('keydown', event => {
      if (event.key === 'Tab' && event.shiftKey && document.activeElement === closeButton) {
        const frame = popup.querySelector('iframe');
        if (frame) { event.preventDefault(); frame.focus(); }
      }
    });
    syncPopup();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhanceNewsletterPopup, { once: true });
  } else {
    enhanceNewsletterPopup();
  }

})();
