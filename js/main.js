/* ================================================================
   FIND YOUR INK — Main JavaScript
   davidadesina.com
   ================================================================ */

(function () {
  'use strict';

  /* ================================================================
     NAVIGATION — Transparent → Scrolled state
     ================================================================ */
  const nav = document.querySelector('.nav');

  function handleNavScroll() {
    if (!nav) return;
    if (window.scrollY > 60) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }
  }

  if (nav) {
    window.addEventListener('scroll', handleNavScroll, { passive: true });
    handleNavScroll(); // run once on load
  }

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

  function openMenu() {
    if (!mobileMenu || !menuToggle) return;
    mobileMenu.classList.add('open');
    menuToggle.classList.add('active');
    menuToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    if (!mobileMenu || !menuToggle) return;
    mobileMenu.classList.remove('open');
    menuToggle.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', function () {
      const isOpen = mobileMenu.classList.contains('open');
      if (isOpen) closeMenu();
      else openMenu();
    });
  }

  // Close on mobile link click
  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  /* ================================================================
     READING PROGRESS BAR (blog posts only)
     ================================================================ */
  const progressBar = document.querySelector('.reading-progress');
  const articleBody = document.querySelector('.article-wrapper');

  function updateReadingProgress() {
    if (!progressBar || !articleBody) return;
    const articleTop = articleBody.offsetTop;
    const articleHeight = articleBody.offsetHeight;
    const scrolled = window.scrollY - articleTop;
    const windowHeight = window.innerHeight;
    const readable = articleHeight - windowHeight;
    const progress = Math.min(Math.max((scrolled / readable) * 100, 0), 100);
    progressBar.style.width = progress + '%';
  }

  if (progressBar) {
    window.addEventListener('scroll', updateReadingProgress, { passive: true });
  }

  /* ================================================================
     SMOOTH SCROLL — anchor links
     ================================================================ */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const offset = nav ? nav.offsetHeight + 20 : 80;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
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
  if ('IntersectionObserver' in window) {
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
    copyBtn.addEventListener('click', function () {
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => {
          const orig = copyBtn.textContent;
          copyBtn.textContent = 'Copied!';
          setTimeout(() => {
            copyBtn.textContent = orig;
          }, 2000);
        })
        .catch(() => {
          // Fallback
          const input = document.createElement('input');
          input.value = window.location.href;
          document.body.appendChild(input);
          input.select();
          document.execCommand('copy');
          document.body.removeChild(input);
          copyBtn.textContent = 'Copied!';
          setTimeout(() => {
            copyBtn.textContent = 'Copy link';
          }, 2000);
        });
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
        image.remove();
      };

      placeholder.replaceWith(image);
    });
  }

  hydrateBlogCardCovers();

  /* ================================================================
     BLOG CATEGORY FILTER
     ================================================================ */
  const filterPills = document.querySelectorAll('.blog-filters .category-pill');
  const blogCards = document.querySelectorAll('.card[data-category]');

  filterPills.forEach(pill => {
    pill.addEventListener('click', function () {
      const category = this.getAttribute('data-category');

      // Update active pill
      filterPills.forEach(p => p.classList.remove('active'));
      this.classList.add('active');

      // Filter cards
      blogCards.forEach(card => {
        if (category === 'all' || card.getAttribute('data-category') === category) {
          card.style.display = '';
          card.style.opacity = '1';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

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
    const consent = localStorage.getItem(COOKIE_KEY);

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
        localStorage.setItem(COOKIE_KEY, 'accepted');
        banner.classList.remove('visible');
        loadAnalytics();
        loadAdSense();
      });
    }

    if (declineBtn) {
      declineBtn.addEventListener('click', function () {
        localStorage.setItem(COOKIE_KEY, 'declined');
        banner.classList.remove('visible');
      });
    }
  }

  initCookieBanner();

})();
