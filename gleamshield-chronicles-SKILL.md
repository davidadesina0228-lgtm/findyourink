# GleamShield Chronicles — Build Skill

## When to load this skill
Load this skill whenever Angel Kanu pastes raw blog text and asks for it to be added to the GleamShield Chronicles section of the site.

---

## The Golden Rule

**Do not change Angel's words.** Her text is the authoritative source. Your job is to:
1. Structure it into the correct HTML template
2. Add section headings (h2/h3) that break her content into logical sections
3. Link all scripture references to biblegateway.com (NKJV by default)
4. Add a Key Takeaways box, Table of Contents, and FAQ derived from her content
5. Output a complete `.html` file ready to commit

Never paraphrase, rewrite, or "improve" her sentences. Never add invented scenes or first-person claims she did not write.

---

## File Locations

| Asset | Path |
|---|---|
| Chronicle HTML files | `d:/FYI/gleamshield/chronicles/[slug].html` |
| Cover images | `d:/FYI/images/gleamshield/gs-chron-[slug].jpg` |
| Chronicles listing page | `d:/FYI/gleamshield/chronicles.html` |
| Sitemap | `d:/FYI/sitemap.xml` |

---

## Categories & Filter Tags

| Category label | `data-cat` value | Use for |
|---|---|---|
| Understanding God | `god` | God's nature, Scripture, theology |
| Defending the Faith | `defend` | Apologetics, evidence, comparative worldviews |
| Answering Islam | `islam` | Direct engagement with Islamic claims |

---

## Slug & Filename Convention

Derive the slug from the title, lowercase, hyphens only:
- "Can Every Religion Bring Us to the Same God?" → `can-every-religion-lead-to-god`
- "Historical Evidence for the Death and Resurrection of Jesus" → `historical-evidence-death-resurrection-jesus`

Image filename: `gs-chron-[slug].jpg`
HTML filename: `[slug].html`

---

## Full HTML Page Template

Replace all `{{placeholders}}` with real values.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-M5E5ZSB38X"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-M5E5ZSB38X');</script>
  <meta charset="UTF-8" />
  <meta name="google-site-verification" content="q4WLY516JCjVJiltjmmFL3KnG31K6yo4xnxm3GVDMcA" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{{TITLE}} | GleamShield Chronicles</title>
  <meta name="description" content="{{META_DESCRIPTION_150_CHARS}}" />
  <meta name="author" content="Angel Kanu" />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="https://davidadesina.com/gleamshield/chronicles/{{SLUG}}.html" />
  <meta property="og:title" content="{{TITLE}}" />
  <meta property="og:description" content="{{META_DESCRIPTION_150_CHARS}}" />
  <meta property="og:image" content="https://davidadesina.com/images/gleamshield/gs-chron-{{SLUG}}.jpg" />
  <meta property="og:site_name" content="GleamShield Production" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="{{TITLE}}" />
  <meta name="twitter:description" content="{{META_DESCRIPTION_150_CHARS}}" />
  <meta name="twitter:image" content="https://davidadesina.com/images/gleamshield/gs-chron-{{SLUG}}.jpg" />
  <link rel="canonical" href="https://davidadesina.com/gleamshield/chronicles/{{SLUG}}.html" />
  <link rel="icon" href="/favicon.ico" />
  <script type="application/ld+json">
  {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "{{TITLE}}",
  "description": "{{META_DESCRIPTION_150_CHARS}}",
  "image": "https://davidadesina.com/images/gleamshield/gs-chron-{{SLUG}}.jpg",
  "datePublished": "{{YYYY-MM-DD}}",
  "dateModified": "{{YYYY-MM-DD}}",
  "author": {
    "@type": "Person",
    "name": "Angel Kanu",
    "url": "https://davidadesina.com/gleamshield/about.html"
  },
  "publisher": {
    "@type": "Organization",
    "name": "GleamShield Production",
    "url": "https://davidadesina.com/gleamshield/"
  },
  "url": "https://davidadesina.com/gleamshield/chronicles/{{SLUG}}.html",
  "mainEntityOfPage": "https://davidadesina.com/gleamshield/chronicles/{{SLUG}}.html",
  "keywords": [{{KEYWORDS_ARRAY}}],
  "inLanguage": "en"
  }
  </script>
  <script type="application/ld+json">
  {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {"@type":"ListItem","position":1,"name":"Home","item":"https://davidadesina.com/"},
    {"@type":"ListItem","position":2,"name":"GleamShield","item":"https://davidadesina.com/gleamshield/"},
    {"@type":"ListItem","position":3,"name":"Chronicles","item":"https://davidadesina.com/gleamshield/chronicles.html"},
    {"@type":"ListItem","position":4,"name":"{{TITLE}}","item":"https://davidadesina.com/gleamshield/chronicles/{{SLUG}}.html"}
  ]
  }
  </script>
  <script type="application/ld+json">
  {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "{{FAQ_Q1}}",
      "acceptedAnswer": {"@type":"Answer","text":"{{FAQ_A1}}"}
    },
    {
      "@type": "Question",
      "name": "{{FAQ_Q2}}",
      "acceptedAnswer": {"@type":"Answer","text":"{{FAQ_A2}}"}
    }
  ]
  }
  </script>
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6207125181553910" crossorigin="anonymous"></script>
  <link rel="stylesheet" href="/css/gleamshield.css" />
  <script defer src="/_vercel/insights/script.js"></script>
</head>
<body class="gs-page">

<div class="gs-reading-progress" id="gs-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100"></div>

<nav class="gs-nav" id="gs-nav" aria-label="GleamShield navigation">
  <div class="gs-nav__inner">
    <a href="/gleamshield/" class="gs-nav__brand" aria-label="GleamShield home">
      <img src="/images/gleamshield/gs-logo.png" alt="GleamShield logo" class="gs-nav__logo" />
      <span class="gs-nav__name">GLEAMSHIELD</span>
    </a>
    <div class="gs-nav__links" role="list">
      <a href="/gleamshield/characters.html" class="gs-nav__link" role="listitem">Characters</a>
      <a href="/gleamshield/stories.html" class="gs-nav__link" role="listitem">Stories</a>
      <a href="/gleamshield/chronicles.html" class="gs-nav__link active" role="listitem">Chronicles</a>
      <a href="/gleamshield/about.html" class="gs-nav__link" role="listitem">Manifesto</a>
      <a href="/gleamshield/support.html" class="gs-nav__link" role="listitem">Support</a>
    </div>
    <a href="/" class="gs-nav__back">
      <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 2L4 6l4 4"/></svg>
      davidadesina.com
    </a>
    <button class="gs-nav__hamburger" id="gs-hamburger" aria-label="Toggle menu" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
  </div>
</nav>
<div class="gs-nav__mobile" id="gs-mobile-menu" role="dialog" aria-label="Mobile navigation">
  <a href="/gleamshield/characters.html" class="gs-nav__link">Characters</a>
  <a href="/gleamshield/stories.html" class="gs-nav__link">Stories</a>
  <a href="/gleamshield/chronicles.html" class="gs-nav__link">Chronicles</a>
  <a href="/gleamshield/about.html" class="gs-nav__link">Manifesto</a>
  <a href="/gleamshield/support.html" class="gs-nav__link">Support</a>
  <a href="/" class="gs-nav__back">
    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 2L4 6l4 4"/></svg>
    davidadesina.com
  </a>
</div>

<main>
  <header class="gs-article-hero gs-pt-nav">
    <div class="gs-container gs-container--narrow">
      <div class="gs-article-hero__meta">
        <span class="gs-badge">{{CATEGORY_LABEL}}</span>
        <span class="gs-article-hero__time">{{READ_TIME}} min read</span>
      </div>
      <h1 class="gs-article-hero__title">{{TITLE}}</h1>
      <p class="gs-article-hero__author">By <strong>Angel Kanu</strong> &mdash; {{MONTH DAY, YEAR}}</p>
    </div>
  </header>

  <div class="gs-article-layout gs-container">
    <article class="gs-article-content">
      <figure class="gs-article-figure">
        <img src="/images/gleamshield/gs-chron-{{SLUG}}.jpg" alt="{{IMAGE_ALT}}" class="gs-article-img" loading="eager" width="1200" height="630" />
      </figure>

      <!-- KEY TAKEAWAYS BOX -->
      <div class="gs-blockquote" style="background:rgba(212,165,116,0.08);border-left:3px solid var(--gs-accent);padding:1.25rem 1.5rem;margin:0 0 2rem;border-radius:0 4px 4px 0;">
        <p style="font-family:var(--gs-font-display);font-size:1.05rem;color:var(--gs-text);margin:0 0 0.5rem;font-weight:600;">Key Takeaways</p>
        <ul style="margin:0;padding-left:1.25rem;color:var(--gs-text-dim);line-height:1.8;">
          <li>{{TAKEAWAY_1}}</li>
          <li>{{TAKEAWAY_2}}</li>
          <li>{{TAKEAWAY_3}}</li>
        </ul>
      </div>

      <!-- TABLE OF CONTENTS -->
      <nav class="gs-toc" aria-label="Table of contents" style="background:rgba(255,255,255,0.03);border:1px solid var(--gs-border);border-radius:4px;padding:1.25rem 1.5rem;margin:0 0 2rem;">
        <p style="font-family:var(--gs-font-display);font-size:0.75rem;letter-spacing:0.15em;text-transform:uppercase;color:var(--gs-accent);margin:0 0 0.75rem;font-weight:600;">In This Article</p>
        <ol style="margin:0;padding-left:1.25rem;color:var(--gs-text-dim);line-height:2;font-size:0.9rem;">
          <li><a href="#{{SECTION_ID_1}}" style="color:var(--gs-text-dim);text-decoration:none;">{{SECTION_TITLE_1}}</a></li>
          <li><a href="#{{SECTION_ID_2}}" style="color:var(--gs-text-dim);text-decoration:none;">{{SECTION_TITLE_2}}</a></li>
        </ol>
      </nav>

      <!-- ARTICLE BODY -->
      <!-- Use Angel's exact words. Wrap paragraphs in <p>. -->
      <!-- Add <h2 id="section-id">Section Heading</h2> to break the content into sections. -->
      <!-- Wrap scripture references: <a href="https://www.biblegateway.com/passage/?search=BOOK+CH%3AV&version=NKJV" target="_blank" rel="noopener noreferrer">REFERENCE (NKJV)</a> -->
      <!-- Wrap key quotes in: <blockquote class="gs-blockquote">...</blockquote> -->

      <!-- FAQ SECTION -->
      <div class="gs-faq" aria-labelledby="gs-faq-title">
        <h2 class="gs-faq__title" id="gs-faq-title">Frequently Asked Questions</h2>
        <div class="gs-faq__item">
          <p class="gs-faq__q">{{FAQ_Q1}}</p>
          <p class="gs-faq__a">{{FAQ_A1}}</p>
        </div>
        <div class="gs-faq__item">
          <p class="gs-faq__q">{{FAQ_Q2}}</p>
          <p class="gs-faq__a">{{FAQ_A2}}</p>
        </div>
      </div>

    </article>

    <aside class="gs-article-sidebar">
      <div class="gs-related">
        <h3 style="font-family:var(--gs-font-display);font-size:1.2rem;color:var(--gs-text);margin-bottom:1rem;">More from the Chronicle</h3>
        <ul class="gs-related__list" style="list-style:none;padding:0;margin:0 0 2rem;">
          <li><a href="/gleamshield/chronicles/{{RELATED_SLUG_1}}.html">{{RELATED_TITLE_1}}</a></li>
          <li><a href="/gleamshield/chronicles/{{RELATED_SLUG_2}}.html">{{RELATED_TITLE_2}}</a></li>
          <li><a href="/gleamshield/chronicles/{{RELATED_SLUG_3}}.html">{{RELATED_TITLE_3}}</a></li>
        </ul>
      </div>
      <div class="gs-newsletter">
        <h3 class="gs-newsletter__title">The GleamShield Chronicle</h3>
        <p class="gs-newsletter__desc">New articles on faith, reason, and the architecture of truth.</p>
        <script async src="https://subscribe-forms.beehiiv.com/embed.js"></script><iframe src="https://subscribe-forms.beehiiv.com/2466ce69-133c-465f-877b-2a2442caa5b2" class="beehiiv-embed" data-test-id="beehiiv-embed" frameborder="0" scrolling="no" style="width:100%; max-width:560px; height:291px; margin:0; border-radius:0; background-color:transparent; box-shadow:none;"></iframe>
      </div>
    </aside>
  </div>
</main>

<footer class="gs-footer" role="contentinfo">
  <div class="gs-container">
    <div class="gs-footer__grid">
      <div>
        <div class="gs-footer__brand">
          <img src="/images/gleamshield/gs-logo.png" alt="GleamShield logo" class="gs-footer__logo" />
          <span class="gs-footer__name">GLEAMSHIELD</span>
        </div>
        <p class="gs-footer__tagline">Building worlds where stories meet truth, and imagination serves faith.</p>
        <nav class="gs-footer__socials" aria-label="Social links">
          <a href="https://youtube.com/@davidadesina0" class="gs-footer__social" target="_blank" rel="noopener">YouTube</a>
          <a href="https://www.instagram.com/davidsina0" class="gs-footer__social" target="_blank" rel="noopener">Instagram</a>
        </nav>
      </div>
      <div class="gs-footer__col"><h4>Explore</h4><ul>
        <li><a href="/gleamshield/characters.html">Characters</a></li>
        <li><a href="/gleamshield/stories.html">Stories</a></li>
        <li><a href="/gleamshield/chronicles.html">Chronicles</a></li>
        <li><a href="/gleamshield/about.html">Manifesto</a></li>
      </ul></div>
      <div class="gs-footer__col"><h4>David Adesina</h4><ul>
        <li><a href="/">Hub</a></li>
        <li><a href="/about.html">About David</a></li>
        <li><a href="/blog.html">Find Your Ink</a></li>
        <li><a href="/gleamshield/support.html">Support Us</a></li>
      </ul></div>
      <div class="gs-footer__col"><h4>Legal</h4><ul>
        <li><a href="/privacy.html">Privacy Policy</a></li>
        <li><a href="/terms.html">Terms of Use</a></li>
      </ul></div>
    </div>
    <div class="gs-footer__bottom">
      <span class="gs-footer__copy">&copy; 2026 GleamShield Production. All rights reserved.</span>
      <span class="gs-footer__tagline-bottom">Stories. Characters. Truth Explored.</span>
    </div>
  </div>
</footer>

<script>
  const nav=document.getElementById('gs-nav');
  window.addEventListener('scroll',()=>{nav.classList.toggle('scrolled',window.scrollY>60);});
  const hb=document.getElementById('gs-hamburger'),mm=document.getElementById('gs-mobile-menu');
  hb.addEventListener('click',()=>{const o=mm.classList.toggle('open');hb.classList.toggle('open',o);hb.setAttribute('aria-expanded',o);document.body.style.overflow=o?'hidden':'';});
  mm.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{mm.classList.remove('open');hb.classList.remove('open');hb.setAttribute('aria-expanded',false);document.body.style.overflow='';}));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&mm.classList.contains('open')){mm.classList.remove('open');hb.classList.remove('open');hb.setAttribute('aria-expanded',false);document.body.style.overflow='';}});
</script>
<script>
  const pb=document.getElementById('gs-progress');
  if(pb){window.addEventListener('scroll',()=>{const s=window.scrollY,d=document.documentElement.scrollHeight-window.innerHeight;pb.style.width=(d>0?(s/d)*100:0)+'%';});}
</script>
<!-- Newsletter Popup -->
<style>
#dal-popup-overlay{display:none;position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.78);align-items:center;justify-content:center;padding:1rem;box-sizing:border-box;}
#dal-popup-card{background:#16161a;border:1px solid rgba(201,169,97,0.25);border-radius:6px;padding:1.25rem;max-width:500px;width:100%;position:relative;max-height:88vh;overflow-y:auto;box-sizing:border-box;}
#dal-popup-close{position:absolute;top:0.25rem;right:0.25rem;background:none;border:none;color:#94949c;cursor:pointer;font-size:1rem;min-width:44px;min-height:44px;display:flex;align-items:center;justify-content:center;border-radius:4px;touch-action:manipulation;}
#dal-popup-close:hover,#dal-popup-close:focus{color:#e8e8ea;outline:2px solid rgba(201,169,97,0.4);}
#dal-popup-eyebrow{font-family:Georgia,serif;font-size:0.68rem;letter-spacing:0.2em;text-transform:uppercase;color:#C9A961;margin:0 0 0.5rem;display:block;}
#dal-popup-heading{font-family:Georgia,serif;font-size:1.15rem;font-weight:600;color:#e8e8ea;margin:0 0 0.4rem;line-height:1.3;padding-right:2.5rem;}
#dal-popup-desc{font-size:0.85rem;color:#94949c;margin:0 0 0.75rem;line-height:1.55;}
#dal-popup-footer{font-size:0.72rem;color:#5a5a62;margin:0.5rem 0 0;text-align:center;}
#dal-popup-iframe{width:100%;height:180px;background:transparent;border:none;display:block;}
@media(min-width:420px){#dal-popup-iframe{height:220px;}#dal-popup-heading{font-size:1.3rem;}#dal-popup-card{padding:1.75rem 1.5rem 1.25rem;}}
@media(min-width:600px){#dal-popup-iframe{height:260px;}#dal-popup-heading{font-size:1.4rem;}}
</style>
<div id="dal-popup-overlay" role="dialog" aria-modal="true" aria-label="Subscribe to The David Adesina Letter">
  <div id="dal-popup-card">
    <button id="dal-popup-close" aria-label="Close newsletter popup">&#x2715;</button>
    <span id="dal-popup-eyebrow">The David Adesina Letter</span>
    <h3 id="dal-popup-heading">You didn&rsquo;t stumble here by accident.</h3>
    <p id="dal-popup-desc">Revival. Healing. Apologetics. One letter, every week.</p>
    <script async src="https://subscribe-forms.beehiiv.com/embed.js"></script>
    <iframe id="dal-popup-iframe" src="https://subscribe-forms.beehiiv.com/2466ce69-133c-465f-877b-2a2442caa5b2" frameborder="0" scrolling="no"></iframe>
    <p id="dal-popup-footer">No spam. One email per week. Unsubscribe anytime.</p>
  </div>
</div>
<script>
(function(){
  const POPUP_KEY='dal_popup_seen_v1';
  if(sessionStorage.getItem(POPUP_KEY))return;
  const overlay=document.getElementById('dal-popup-overlay');
  const closeBtn=document.getElementById('dal-popup-close');
  if(!overlay||!closeBtn)return;
  function openPopup(){overlay.style.display='flex';document.body.style.overflow='hidden';}
  function closePopup(){overlay.style.display='none';document.body.style.overflow='';sessionStorage.setItem(POPUP_KEY,'1');}
  closeBtn.addEventListener('click',closePopup);
  overlay.addEventListener('click',e=>{if(e.target===overlay)closePopup();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&overlay.style.display==='flex')closePopup();});
  let fired=false;
  function onScroll(){
    if(fired)return;
    const pct=(window.scrollY/(document.documentElement.scrollHeight-window.innerHeight))*100;
    if(pct>=40){fired=true;window.removeEventListener('scroll',onScroll);setTimeout(openPopup,600);}
  }
  window.addEventListener('scroll',onScroll,{passive:true});
})();
</script>
</body>
</html>
```

---

## Scripture Linking Format

Always link scripture to biblegateway.com using NKJV by default:

```html
<a href="https://www.biblegateway.com/passage/?search=John+14%3A6&version=NKJV" target="_blank" rel="noopener noreferrer">John 14:6 (NKJV)</a>
```

URL encoding: `:` → `%3A`, space → `+`, `–` (range) → `-`

Examples:
- John 14:6 → `?search=John+14%3A6`
- Romans 4:25 → `?search=Romans+4%3A25`
- 1 Corinthians 15:7 → `?search=1+Corinthians+15%3A7`
- Matthew 26:31–32 → `?search=Matthew+26%3A31-32`

For Quran references, link to: `https://quran.com/SURAH/VERSE`

---

## Blockquote Format

Use for direct scripture quotes, key statements, or memorable lines from Angel:

```html
<blockquote class="gs-blockquote">&ldquo;Quote text here.&rdquo; &mdash; Reference</blockquote>
```

---

## chronicles.html Card to Add

After building the article file, add a card to `d:/FYI/gleamshield/chronicles.html` inside `<div class="gs-grid gs-grid--2" id="gs-posts">`:

```html
<article class="gs-post-card" data-cat="{{DATA_CAT}}">
  <a href="/gleamshield/chronicles/{{SLUG}}.html" class="gs-post-card__link">
    <div class="gs-post-card__img-wrap">
      <img src="/images/gleamshield/gs-chron-{{SLUG}}.jpg" alt="{{TITLE}}" class="gs-post-card__img" loading="lazy" width="600" height="340" />
    </div>
    <div class="gs-post-card__body">
      <span class="gs-post-card__cat">{{CATEGORY_LABEL}}</span>
      <h2 class="gs-post-card__title">{{TITLE}}</h2>
      <p class="gs-post-card__excerpt">{{ONE_SENTENCE_EXCERPT}}</p>
      <p class="gs-post-card__meta">Angel Kanu &middot; {{DATE}} &middot; {{READ_TIME}} min read</p>
    </div>
  </a>
</article>
```

---

## sitemap.xml Entry to Add

Add inside `</urlset>` at the end of `d:/FYI/sitemap.xml`:

```xml
<url><loc>https://davidadesina.com/gleamshield/chronicles/{{SLUG}}.html</loc><lastmod>{{YYYY-MM-DD}}</lastmod><priority>0.8</priority><changefreq>monthly</changefreq></url>
```

---

## Image Prompt for Nanobanana

When a new blog has no image yet, give the user this prompt format and the exact filename to save to:

> Cinematic dark scene. [DESCRIBE WHAT THE BLOG IS ABOUT VISUALLY]. Deep shadows, warm gold accent light. Dark background (#0a0a0b). Moody, contemplative, theological. No text. Widescreen 1200×630.

Save as: `d:\FYI\images\gleamshield\gs-chron-{{SLUG}}.jpg`

**Always visually verify the image matches the blog before assigning the filename.** The user may paste images in a different order from the prompts.

---

## Read Time Estimate

~200 words per minute. Count Angel's words and divide by 200, round up.

---

## Checklist Before Committing

- [ ] Angel's words are unchanged
- [ ] All scripture references linked to biblegateway.com
- [ ] Key Takeaways box populated (3–5 bullets)
- [ ] Table of Contents matches actual h2 section ids
- [ ] FAQ schema in `<head>` matches FAQ section in body
- [ ] Category (`data-cat`) is correct
- [ ] Card added to `chronicles.html`
- [ ] URL added to `sitemap.xml`
- [ ] Image filename matches slug
- [ ] `git add`, `git commit`, `git push` done
