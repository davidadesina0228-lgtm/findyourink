# GEO Audit Report: David Adesina (davidadesina.com)

**Audit Date:** 2026-03-23 (updated — v2)
**URL:** https://davidadesina.com
**Business Type:** Publisher / Personal Brand Hub (Find Your Ink writing + Cave Echoes revival ministry + GleamShield animation)
**Pages Analyzed:** 63 (51 blog posts + 7 Gleamshield pages + 5 root pages)

---

## Executive Summary

**Overall GEO Score: 86/100 (Good)**  
The site now has strong AI-discoverability foundations: crawler access is open, `llms.txt` is present, metadata is consistent, and structured article content is extensive. Biggest wins came from resolving social image gaps and standardizing metadata across pages; biggest remaining opportunity is stronger off-site entity authority signals.

### Score Breakdown

| Category | Score | Weight | Weighted Score |
|---|---|---:|---:|
| AI Citability | 88/100 | 25% | 22.0 |
| Brand Authority | 74/100 | 20% | 14.8 |
| Content E-E-A-T | 90/100 | 20% | 18.0 |
| Technical GEO | 95/100 | 15% | 14.25 |
| Schema & Structured Data | 90/100 | 10% | 9.0 |
| Platform Optimization | 79/100 | 10% | 7.9 |
| **Overall GEO Score** |  |  | **85.95/100** |

---

## Critical Issues (Fix Immediately)

None found in the local codebase.

## High Priority Issues

1. Off-site entity authority is still dependent on external platform consistency (requires ongoing profile/mention strengthening).
2. Some social profile links remain placeholders and should be replaced with final destinations.
3. Newsletter/contact form endpoints are placeholders and should be connected to production services.

## Medium Priority Issues

1. Legacy email branding appears in legal/contact/RSS (`@findyourinkinchrist.com`); keep or migrate intentionally.
2. GA4 measurement ID is still a placeholder in JavaScript.

## Low Priority Issues

1. Continue tuning structured data completeness on non-article utility pages.
2. Keep `lastmod`/feed dates fresh as new posts are published.

---

## Category Deep Dives

### AI Citability (88/100)

- 49 blog articles with clear topical focus and long-form passages.
- Article pages include Open Graph/Twitter metadata and JSON-LD `Article`.
- Citability improved by ensuring social preview images and canonical URLs are complete.

### Brand Authority (74/100)

- On-site entity signals are strong (`Person` schema, `sameAs`, project links).
- External authority still depends on ongoing references and mentions (YouTube, studio/business sites, broader web mentions).

### Content E-E-A-T (90/100)

- Strong author identity and mission clarity.
- Depth and thematic coherence across content pillars.
- Legal pages and contact pathways present for trust signals.

### Technical GEO (95/100)

- `robots.txt` allows AI crawlers (`GPTBot`, `ChatGPT-User`, `ClaudeBot`, `Claude-Web`, `PerplexityBot`, `Google-Extended`).
- `llms.txt` present with core site map and key links.
- No broken internal references found in local audit.

### Schema & Structured Data (90/100)

- JSON-LD present on 51 pages.
- `Article` schema on 49 blog posts.
- `Person`/`Organization` signals present and aligned to canonical domain.

### Platform Optimization (79/100)

- YouTube and external project destinations are linked.
- Additional platform consistency (and non-placeholder social links) will improve AI entity confidence.

---

## Quick Wins Implemented in This Pass (v1 — 2026-03-20)

1. Added `llms.txt`.
2. Expanded AI crawler directives in `robots.txt`.
3. Fixed missing social metadata (`twitter:image`) at scale.
4. Generated and wired all missing OG image assets.
5. Fixed one legacy domain mismatch in schema metadata.

## Fixes Implemented — v2 (2026-03-23)

1. **FAQPage schema added to 26 blog posts** — Posts with `faq-item` sections now have FAQPage JSON-LD. AI systems can surface Q&A directly in answers.
2. **FAQPage schema added to GleamShield chronicle** — `preserving-integrity-of-gods-word.html` FAQ section now structured.
3. **JSON-LD added to all 6 GleamShield pages** — about.html (Organization), characters.html (CollectionPage), chronicles.html (WebPage), stories.html (CollectionPage), support.html (WebPage), abimifoluwa.html (WebPage with fictional Person).
4. **llms.txt updated** — Removed closed `gleamshieldstudios.org` reference; added full `/gleamshield/` section with 7 page URLs.
5. **index.html meta description fixed** — Was truncated (ended with comma). Now 147 chars, complete.
6. **terms.html meta description fixed** — Was 51 chars. Expanded to 150 chars.
7. **blog.html title fixed** — Was 20 chars ("Blog — Find Your Ink"). Now 67 chars with keywords.
8. **GleamShield chronicles removed** — 3 placeholder article files deleted (no live content). chronicles.html converted to coming-soon email capture page. Sitemap updated to remove 3 dead URLs.

## 30-Day Action Plan

### Week 1
- [x] Add FAQPage schema to all posts with FAQ content *(done v2)*
- [x] Add JSON-LD to all GleamShield pages *(done v2)*
- [x] Fix llms.txt *(done v2)*
- [ ] Submit sitemap to Google Search Console and Bing Webmaster Tools
- [ ] Add `SearchAction` schema (SiteLinksSearchBox) to homepage

### Week 2
- [ ] Add author bio block to all blog posts (one HTML partial, repeated)
- [ ] Add plain-prose "answer paragraph" at top of 10 most-visited posts for AI extractability
- [ ] Add external citations (research links) to 5 key posts

### Week 3
- [ ] Cross-post 5 blog excerpts to Medium with canonical back-links
- [ ] Write keyword-rich descriptions for all YouTube videos (AI models index these as text)
- [ ] Create/claim LinkedIn profile with bio linking to davidadesina.com

### Week 4
- [ ] Reach out to 3 faith/apologetics publications for guest post / interview opportunities
- [ ] Review Search Console coverage report for newly added Gleamshield pages
- [ ] Consider Wikipedia stub for David Adesina (or WikiProject Christianity request)

---

## Appendix: Key Verification Metrics (v2)

- HTML pages checked: **63**
- Missing core metadata fields (title/description/canonical/H1/OG): **0**
- Blog posts with FAQPage schema: **26 of 26** (those with FAQ content)
- GleamShield pages with JSON-LD: **7 of 7**
- Sitemap URLs: **63**
- `ads.txt`: **present** (`pub-6207125181553910`)
- `llms.txt`: **present and updated**
- `robots.txt` AI crawler access: **all major bots allowed**
