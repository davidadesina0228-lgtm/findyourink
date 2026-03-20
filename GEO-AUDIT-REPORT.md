# GEO Audit Report: David Adesina (davidadesina.com)

**Audit Date:** 2026-03-20  
**URL:** https://davidadesina.com  
**Business Type:** Publisher / Personal Brand Hub  
**Pages Analyzed:** 57 (local HTML audit)

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

## Quick Wins Implemented in This Pass

1. Added `llms.txt`.
2. Expanded AI crawler directives in `robots.txt`.
3. Fixed missing social metadata (`twitter:image`) at scale.
4. Generated and wired all missing OG image assets.
5. Fixed one legacy domain mismatch in schema metadata.

## 30-Day Action Plan

### Week 1
- [ ] Replace placeholder social URLs with final profile links.
- [ ] Connect production newsletter and contact form endpoints.

### Week 2
- [ ] Add GA4 real measurement ID and validate analytics.
- [ ] Ensure all outbound profile links are bi-directionally consistent with brand naming.

### Week 3
- [ ] Publish additional topical cluster posts and cross-link them internally.
- [ ] Add FAQ blocks (with matching schema) to top-performing pillar pages.

### Week 4
- [ ] Review Search Console coverage + AI citation mentions and iterate on underperforming pages.
- [ ] Refresh feed/sitemap dates and republish priority pages.

---

## Appendix: Key Local Verification Metrics

- HTML pages checked: **57**
- Missing core metadata fields (title/description/canonical/H1/OG/Twitter): **0**
- Missing referenced assets: **0**
- Broken internal refs: **0**
- Sitemap URLs validated: **50 / 50**
- `ads.txt`: **present**
- `llms.txt`: **present**
