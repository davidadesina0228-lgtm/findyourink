// Bakes the site's generated images with a headless browser:
//   images/plates/<slug>.jpg  — each essay's ink plate for archive cards (decoded off the main thread,
//                               so scrolling the journal never re-renders SVG filters)
//   images/share/<name>.jpg   — 1200×630 link-preview cards (WhatsApp, X, LinkedIn, iMessage…)
// and points each page's og:image / twitter:image / JSON-LD image at its share card.
//
// Run after adding or retitling an essay:   node scripts/make-images.mjs
// Options: --only=<slug>   just one essay      --no-meta   don't touch the HTML
// Needs playwright-core + a Chromium. Override paths with PLAYWRIGHT_CORE / CHROMIUM if they differ.
import http from 'node:http';
import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://davidadesina.com';
const args = process.argv.slice(2);
const only = (args.find((a) => a.startsWith('--only=')) || '').slice(7);
const touchMeta = !args.includes('--no-meta');

const PW = process.env.PLAYWRIGHT_CORE || 'C:/Users/David/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const CHROME = process.env.CHROMIUM || 'C:/Users/David/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe';
const { chromium } = await import(PW.includes('://') ? PW : pathToFileURL(PW).href);

/* ---------- tiny static server so the page can load ink.js, fonts and photos ---------- */
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml' };
const server = http.createServer(async (req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (pathname === '/__blank') { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); res.end('<!doctype html><meta charset="utf-8"><title>x</title>'); return; }
  const file = path.join(ROOT, pathname);
  if (!file.startsWith(ROOT) || !existsSync(file) || !path.extname(file)) { res.writeHead(404); res.end(); return; }
  const type = TYPES[path.extname(file)] || 'application/octet-stream';
  res.writeHead(200, { 'content-type': type.startsWith('text/') ? `${type}; charset=utf-8` : type });
  res.end(await readFile(file));
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const BASE = `http://127.0.0.1:${server.address().port}`;

/* ---------- read every essay ---------- */
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#39;|&apos;|&#8217;/g, '’').replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ').replace(/&mdash;/g, '—').replace(/&ndash;/g, '–');
const essays = [];
for (const name of (await readdir(path.join(ROOT, 'blog'))).filter((f) => f.endsWith('.html'))) {
  const html = await readFile(path.join(ROOT, 'blog', name), 'utf8');
  const plate = html.match(/<span class="da-plate"[^>]*data-slug="([^"]+)"[^>]*data-cat="([^"]*)"[^>]*data-no="(\d+)"/);
  const h1 = html.match(/<h1 class="article-hero__title"[^>]*>([\s\S]*?)<\/h1>/);
  if (!plate || !h1) { console.warn(`skip ${name}: no plate or title`); continue; }
  const title = h1[1].replace(/<br\s*\/?>/g, ' ').replace(/<(?!\/?em\b)[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  essays.push({
    file: `blog/${name}`, slug: plate[1], cat: plate[2], no: plate[3], title,
    category: decode((html.match(/class="article-hero__category">([^<]+)</) || [])[1] || ''),
    read: (html.match(/article-hero__read-time">([^<]+)</) || [])[1] || '',
  });
}
const todo = only ? essays.filter((e) => e.slug === only) : essays;

/* ---------- templates ---------- */
const FONTS = '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&display=block" rel="stylesheet">';
const BASE_CSS = `*{box-sizing:border-box;margin:0}html,body{background:transparent}body{font-family:Inter,sans-serif;-webkit-font-smoothing:antialiased}
#card{position:relative;width:1200px;height:630px;overflow:hidden}
#plate svg{position:absolute;inset:0;width:100%;height:100%;display:block}#plate{position:relative;overflow:hidden}
.label{display:flex;align-items:center;gap:16px;font:600 15px/1 Inter;letter-spacing:.26em;text-transform:uppercase}
.label i{width:44px;height:1px;background:currentColor;opacity:.7}
.mark{height:44px;width:auto}
.title{font-family:'Playfair Display',Georgia,serif;font-weight:400;letter-spacing:-.03em;line-height:1.04;text-wrap:balance}
.title .nw{white-space:nowrap}
.title em{font-style:italic}
.foot{position:absolute;left:72px;bottom:56px;display:flex;align-items:center;gap:14px;font:600 14px/1 Inter;letter-spacing:.2em;text-transform:uppercase}
.foot b{width:5px;height:5px;border-radius:50%;background:currentColor;opacity:.6}
.grain{position:absolute;inset:0;pointer-events:none;opacity:.35;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .1 0 0 0 0 .09 0 0 0 0 .07 0 0 0 .09 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}`;

const page = (body, css = '') => `<!doctype html><html><head><meta charset="utf-8">${FONTS}<style>${BASE_CSS}${css}</style><script src="/js/ink.js"></script></head><body>${body}</body></html>`;

// Essay card: paper, title left, the essay's own plate right.
const essayCard = (e) => page(`<div id="card" style="background:#f4efe6;color:#15130f">
  <div id="plate" style="position:absolute;top:0;right:0;bottom:0;width:500px;background:#ece5d8"></div>
  <div style="position:absolute;top:0;right:500px;bottom:0;width:1px;background:rgba(21,19,15,.14)"></div>
  <div style="position:absolute;left:72px;top:60px;right:572px;display:flex;align-items:center;justify-content:space-between">
    <div class="label" style="color:#7a5c22"><i></i>Find Your Ink</div><img class="mark" src="/images/brand/da-mark-ink.png" alt="">
  </div>
  <div id="fit" style="position:absolute;left:72px;right:572px;top:150px;bottom:130px;display:flex;align-items:center">
    <h1 class="title" id="t">${e.title.replace(/<em>/g, '<em style="color:#7a5c22">')}</h1>
  </div>
  <div class="foot" style="color:#5e584e">${e.category ? `<span style="color:#7a5c22">${e.category}</span><b></b>` : ''}${e.read ? `<span>${e.read}</span><b></b>` : ''}<span>davidadesina.com</span></div>
  <div class="grain"></div>
</div>`, '');

// Section pages: same family, with a headline and an optional photo or plate.
const pageCard = ({ dark, label, title, sub, photo, plate, photoPos = '50% 20%' }) => page(`<div id="card" style="background:${dark ? '#0b0a08' : '#f4efe6'};color:${dark ? '#f2ebdd' : '#15130f'}">
  ${photo ? `<img src="${photo}" alt="" style="position:absolute;top:0;right:0;width:620px;height:630px;object-fit:cover;object-position:${photoPos};${dark ? '-webkit-mask-image:linear-gradient(90deg,transparent,#000 38%);mask-image:linear-gradient(90deg,transparent,#000 38%)' : ''}">` : ''}
  ${plate ? '<div id="plate" style="position:absolute;top:0;right:0;bottom:0;width:500px;background:#ece5d8"></div><div style="position:absolute;top:0;right:500px;bottom:0;width:1px;background:rgba(21,19,15,.14)"></div>' : ''}
  ${dark ? '<div style="position:absolute;inset:0;background:radial-gradient(60% 80% at 75% 40%,rgba(201,169,97,.18),transparent 70%)"></div>' : ''}
  <div style="position:absolute;left:72px;top:60px;display:flex;align-items:center;gap:22px">
    <img class="mark" src="/images/brand/${dark ? 'da-mark-gold' : 'da-mark-ink'}.png" alt=""><div class="label" style="color:${dark ? '#c9a961' : '#7a5c22'}"><i></i>${label}</div>
  </div>
  <div id="fit" style="position:absolute;left:72px;right:${plate || photo ? 572 : 72}px;top:150px;bottom:150px;display:flex;flex-direction:column;justify-content:center;gap:26px">
    <h1 class="title" id="t">${title}</h1>
    ${sub ? `<p style="font:italic 400 30px/1.3 'Playfair Display',Georgia,serif;color:${dark ? 'rgba(242,235,221,.72)' : '#4a453c'}">${sub}</p>` : ''}
  </div>
  <div class="foot" style="color:${dark ? 'rgba(242,235,221,.6)' : '#5e584e'}"><span>David Adesina</span><b></b><span>davidadesina.com</span></div>
  <div class="grain" style="${dark ? 'opacity:.18;mix-blend-mode:screen' : ''}"></div>
</div>`);

const PAGES = [
  { name: 'home', file: 'index.html', dark: true, label: 'Revivalist · Writer · Apologist', title: 'Revival first.<br><em style="color:#c9a961">Minds renewed.</em>', photo: '/images/cinema/david-gold.webp', photoPos: '50% 14%' },
  { name: 'journal', file: 'blog.html', label: 'Find Your Ink', title: 'Find your <em style="color:#7a5c22">Ink.</em>', sub: 'Some broke and bled. I broke and wrote.<br>Now Christ holds the pen.', plate: { slug: 'find-your-ink-the-journal', cat: 'spiritual-formation' } },
  { name: 'about', file: 'about.html', dark: true, label: 'About David Adesina', title: '<span class="nw">Some broke and bled.</span><br><em class="nw" style="color:#c9a961">I broke and wrote.</em>', photo: '/images/cinema/david-mono.webp', photoPos: '50% 14%' },
  { name: 'contact', file: 'contact.html', label: 'Contact', title: 'Let’s <em style="color:#7a5c22">Talk</em>', plate: { slug: 'contact', cat: 'faith-doubt' } },
  { name: 'resources', file: 'resources.html', label: 'Resources', title: 'What I’m Reading, Recommending &amp; <em style="color:#7a5c22">Thinking With</em>', plate: { slug: 'resources', cat: 'identity-in-christ' } },
];

/* ---------- render ---------- */
const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const ctx = await browser.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
const tab = await ctx.newPage();
await mkdir(path.join(ROOT, 'images/plates'), { recursive: true });
await mkdir(path.join(ROOT, 'images/share'), { recursive: true });

async function render(html, plate) {
  await tab.goto(`${BASE}/__blank`); // same-origin base for site assets
  await tab.setContent(html, { waitUntil: 'networkidle' });
  await tab.evaluate(async (p) => {
    await document.fonts.ready;
    if (p) document.getElementById('plate').innerHTML = window.InkPlate.svg(p);
    // Shrink the headline until it fits its box.
    const box = document.getElementById('fit'), t = document.getElementById('t');
    if (box && t) {
      let size = 78;
      t.style.fontSize = `${size}px`;
      while (size > 34 && (t.scrollHeight > box.clientHeight || t.scrollWidth > box.clientWidth)) { size -= 2; t.style.fontSize = `${size}px`; }
    }
    await Promise.all([...document.images].map((i) => (i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; }))));
  }, plate || null);
  await tab.waitForTimeout(60);
}

for (const e of todo) {
  // Card plate (light, numbered), 800×600.
  await tab.setViewportSize({ width: 800, height: 600 });
  await tab.goto(`${BASE}/__blank`);
  await tab.setContent(page('<div id="plate" style="width:800px;height:600px"></div>'), { waitUntil: 'networkidle' });
  await tab.evaluate(async (o) => { await document.fonts.ready; document.getElementById('plate').innerHTML = window.InkPlate.svg(o); }, { slug: e.slug, cat: e.cat, no: e.no });
  await tab.locator('#plate').screenshot({ path: path.join(ROOT, `images/plates/${e.slug}.jpg`), type: 'jpeg', quality: 82 });

  // Share card, 1200×630.
  await tab.setViewportSize({ width: 1200, height: 630 });
  await render(essayCard(e), { slug: e.slug, cat: e.cat, no: e.no });
  await tab.locator('#card').screenshot({ path: path.join(ROOT, `images/share/${e.slug}.jpg`), type: 'jpeg', quality: 86 });
  console.log(`✓ ${e.slug}`);
}
if (!only) {
  for (const p of PAGES) {
    await render(pageCard(p), p.plate || null);
    await tab.locator('#card').screenshot({ path: path.join(ROOT, `images/share/${p.name}.jpg`), type: 'jpeg', quality: 86 });
    console.log(`✓ page ${p.name}`);
  }
}
await browser.close();
server.close();

/* ---------- point the pages at their share cards ---------- */
if (touchMeta) {
  const IMG = /(<meta (?:property="og:image"|name="twitter:image") content=")[^"]*(")|("image":\s*\{\s*"@type":\s*"ImageObject",\s*"url":\s*")[^"]*(")/g;
  const swap = async (file, name) => {
    const full = path.join(ROOT, file);
    const html = await readFile(full, 'utf8');
    const url = `${SITE}/images/share/${name}.jpg`;
    const next = html.replace(IMG, (m, a, b, c, d) => (a ? `${a}${url}${b}` : `${c}${url}${d}`));
    if (next !== html) { await writeFile(full, next); console.log(`meta → ${file}`); }
  };
  for (const e of todo) await swap(e.file, e.slug);
  if (!only) for (const p of PAGES) await swap(p.file, p.name);
}
