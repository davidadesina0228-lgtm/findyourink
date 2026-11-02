# Website redesign

The redesign is implemented in the existing static website. No framework, build step, or new production dependency is required.

## Preview

From this directory, run `python -m http.server 4173 --bind 127.0.0.1` and visit:

- Homepage: http://127.0.0.1:4173/
- Find Your Ink: http://127.0.0.1:4173/blog.html
- Essay example: http://127.0.0.1:4173/blog/healing-is-not-linear.html
- GleamShield: http://127.0.0.1:4173/gleamshield/
- Chronicles: http://127.0.0.1:4173/gleamshield/chronicles.html

## Visual system

- **David Adesina:** black, silver, and slate; a portrait-led opening; large Manrope typography with Playfair Display italic; thin rules and numbered sections.
- **Find Your Ink:** a literary journal masthead, featured essay, searchable archive, and a restrained reading layout shared by all 50 existing articles.
- **GleamShield:** charcoal and copper, large Cormorant Garamond type, cinematic imagery, and shared styling for Chronicles, stories, characters, and supporting pages.
- **Motion:** homepage entrances and section reveals; GleamShield staggered scroll reveals, image transitions, and gentle hero parallax. Reduced-motion preferences disable movement while keeping content visible. Keyboard focus reveals content when necessary.

## Implementation

- `css/home.css` controls the homepage.
- `css/editorial.css` follows the original stylesheet on all main-site pages.
- `css/gleamshield.css` supplies the shared GleamShield presentation.
- `js/gleamshield-design.js` adds scroll motion and mobile navigation accessibility to every GleamShield page.
- `js/main.js` combines blog search and categories, restores filters from URL parameters, improves menu focus handling, and updates accessible reading progress.

Article prose, canonical URLs, structured data, existing newsletter integration, and purchase destinations remain in place. Main-site navigation now includes a direct GleamShield link.

## Verification

- 11 representative pages checked at 320, 768, 1024, and 1440 pixels: no horizontal overflow or broken images.
- Browser checks passed for combined filters, URL restoration, empty states, mobile menus, reading progress, GleamShield category filtering, scroll reveals, parallax, and reduced motion.
- Final interaction checks reported no uncaught page JavaScript errors. External analytics, advertising, and newsletter requests were blocked during automated checks; live subscription and payment submissions were not tested.
- `node scripts/check-site.mjs --compare` compares static links, assets, IDs, headings, structured data, and JavaScript syntax against Git HEAD.

Pre-existing content issue: 23 links point to the absent `blog/decolonizing-your-faith.html` article. The redesign preserves these editorial links; the original article needs to be restored or its links deliberately redirected. Seven pre-existing heading-order warnings are also reported.

The changes are local and have not been published to the live domain.
