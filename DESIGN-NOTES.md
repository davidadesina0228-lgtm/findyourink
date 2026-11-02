# Design notes — "Ink & Gold" / "Zenithia" (November 2026)

Static site, no build step, no new dependencies. Preview from this folder:
`python -m http.server 4173 --bind 127.0.0.1` → http://127.0.0.1:4173/

## Two visual systems

**David Adesina + Find Your Ink** (`css/style.css` base → `css/da.css` on top; homepage adds `css/da-home.css`)
- Brand restored: ink black, warm gold `#C9A961`, cream paper. Playfair Display + Inter.
- On paper backgrounds, small gold text uses `--gold-lo` (`#7A5C22`) for contrast; bright gold is for dark sections.
- `da.css` redefines the legacy `--color-*` tokens, so old inline styles in pages pick up the brand automatically.

**GleamShield** (`css/gleamshield.css` base → `css/gs-luxe.css` on top)
- Dusk, gold and ember from the Zenithia skyline, with Abimifoluwa's teal as the cool accent.
- Cinzel for title cards, Cormorant Garamond for voice, Sora for body.

## Scripts
- `js/main.js` (unchanged role): menu, search and filters, cookies, reading progress.
- `js/motion.js`: everything driven by data attributes (`data-reveal`, `data-lines`, `data-split`, `data-scrub`, `data-parallax`, `data-magnetic`, `data-tilt`, `data-stack`, `data-count`, `data-timecode`, `data-autohide`). It also adds the essay chapter rail and "Share this line" on blockquotes.
- `js/ink.js`: generative **ink plates**. Each essay's art is seeded from its slug and tinted by category, so the same essay looks the same everywhere. Use `<span class="card__plate" data-plate></span>` inside a card; it reads the slug and category from the card. Options: `data-slug`, `data-cat`, `data-no`, `data-variant="dark"`, `data-bare`.
- `js/atmosphere.js`: live backgrounds, set with `data-atmosphere="gold|ink|embers|zenith"` plus a `<canvas class="atmo-canvas">`. Scenes pause off-screen and in hidden tabs.
- `js/gs.js`: GleamShield extras (blurred Chronicle hero, sticky table of contents, footer wordmark, live Chronicle count). It never edits article text.

All motion respects `prefers-reduced-motion`. Cross-page fades use the View Transitions API where supported.

## Adding a new essay
Copy any `blog/*.html` file. The header, menu and footer markup is shared. The hero plate is
`<span class="da-plate" data-plate data-variant="dark" data-slug="SLUG" data-cat="CATEGORY" data-no="N">`.
`N` is the next plate number in date order (the newest essay currently holds Nº 50). In `blog.html`, give the new card
`<span class="card__plate" data-plate data-no="N" aria-hidden="true"></span>` in place of an image.

## Checks
`node scripts/check-site.mjs --compare` reports 0 errors and 0 heading warnings. Pages were checked at 320, 768, 1024 and 1440px: no horizontal overflow, broken images or script errors. Reduced motion shows all content immediately.

## Superseded files (no longer referenced; safe to delete)
`css/editorial.css`, `css/home.css`, `css/home-cinema.css`, `css/journal-cinema.css`, `js/cinematic-motion.js`, `js/home-cinema.js`, `images/gleamshield/gs-zenithia-cinematic-v2.png` (now `images/cinema/zenithia.webp`).
