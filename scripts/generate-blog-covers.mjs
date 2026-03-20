import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const blogDir = path.join(projectRoot, 'blog');
const outputDir = path.join(projectRoot, 'images', 'blog-covers');

const brandPalette = ['#000000', '#0A0A0A', '#1C1C1C', '#4A5A66', '#8A8A8A', '#CFCFCF', '#E8E8E8'];

function hashString(input) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function escapeXml(input) {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function decodeHtmlEntities(input) {
  return input
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ');
}

function cleanTitle(rawTitle) {
  const decoded = decodeHtmlEntities(rawTitle).replace(/\s+/g, ' ').trim();
  return decoded
    .replace(/\s*[-|]\s*Find Your Ink\s*$/i, '')
    .replace(/\s*--\s*Find Your Ink\s*$/i, '')
    .replace(/\s*-\s*Find Your Ink\s*$/i, '')
    .trim();
}

function wrapTitle(title, maxLineLength = 28, maxLines = 3) {
  const words = title.split(/\s+/).filter(Boolean);
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (candidate.length <= maxLineLength) {
      currentLine = candidate;
      continue;
    }

    if (currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      lines.push(word.slice(0, maxLineLength));
      currentLine = word.slice(maxLineLength);
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  if (lines.length <= maxLines) {
    return lines;
  }

  const clipped = lines.slice(0, maxLines);
  const last = clipped[maxLines - 1];
  clipped[maxLines - 1] = last.length > maxLineLength - 3 ? `${last.slice(0, maxLineLength - 3)}...` : `${last}...`;
  return clipped;
}

function pickColors(seed) {
  const darkA = brandPalette[seed % 3];
  const darkB = brandPalette[(seed + 1) % 3];
  const accentA = brandPalette[3 + (seed % 2)];
  const accentB = brandPalette[5 + (seed % 2)];
  return { darkA, darkB, accentA, accentB };
}

function extractBlogMetadata(fileText, slug) {
  const ogTitle = fileText.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i)?.[1];
  const htmlTitle = fileText.match(/<title>([^<]+)<\/title>/i)?.[1];
  const section = fileText.match(/<meta\s+property=["']article:section["']\s+content=["']([^"']+)["']/i)?.[1];

  const title = cleanTitle(ogTitle || htmlTitle || slug.replace(/-/g, ' '));
  const category = decodeHtmlEntities(section || 'Find Your Ink').trim();
  return { title, category };
}

function buildSvg({ slug, title, category }) {
  const seed = hashString(slug);
  const { darkA, darkB, accentA, accentB } = pickColors(seed);
  const titleLines = wrapTitle(title);
  const startY = 390 - ((titleLines.length - 1) * 64) / 2;

  const titleText = titleLines
    .map((line, index) => {
      const y = startY + index * 64;
      return `<text x="96" y="${y}" class="title">${escapeXml(line)}</text>`;
    })
    .join('\n  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900" role="img" aria-labelledby="cover-title cover-subtitle">
  <title id="cover-title">${escapeXml(title)}</title>
  <desc id="cover-subtitle">${escapeXml(category)} - Find Your Ink by David Adesina</desc>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${darkA}" />
      <stop offset="100%" stop-color="${darkB}" />
    </linearGradient>
    <radialGradient id="glowA" cx="1" cy="0" r="1">
      <stop offset="0%" stop-color="${accentA}" stop-opacity="0.50" />
      <stop offset="100%" stop-color="${accentA}" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="glowB" cx="0.10" cy="0.95" r="1">
      <stop offset="0%" stop-color="${accentB}" stop-opacity="0.30" />
      <stop offset="100%" stop-color="${accentB}" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="line" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${accentA}" stop-opacity="0.70" />
      <stop offset="100%" stop-color="${accentB}" stop-opacity="0.40" />
    </linearGradient>
    <style>
      .category { fill: ${accentB}; font: 600 26px 'Inter', 'Segoe UI', sans-serif; letter-spacing: 0.18em; text-transform: uppercase; }
      .title { fill: #E8E8E8; font: 700 74px 'Playfair Display', 'Georgia', serif; }
      .meta { fill: #CFCFCF; font: 500 24px 'Inter', 'Segoe UI', sans-serif; letter-spacing: 0.08em; text-transform: uppercase; }
      .brand { fill: #8A8A8A; font: 400 22px 'Inter', 'Segoe UI', sans-serif; }
    </style>
  </defs>

  <rect width="1600" height="900" fill="url(#bg)" />
  <ellipse cx="1420" cy="50" rx="620" ry="620" fill="url(#glowA)" />
  <ellipse cx="120" cy="860" rx="740" ry="520" fill="url(#glowB)" />

  <path d="M96 164 H630" stroke="url(#line)" stroke-width="3" stroke-linecap="round" />
  <text x="96" y="136" class="category">${escapeXml(category)}</text>
  ${titleText}
  <text x="96" y="705" class="meta">FIND YOUR INK  |  ESSAYS BY DAVID ADESINA</text>

  <path d="M1310 620 C1260 510 1315 418 1410 410 C1315 356 1298 250 1390 190" stroke="${accentB}" stroke-opacity="0.65" stroke-width="22" fill="none" stroke-linecap="round"/>
  <path d="M1232 655 C1184 603 1204 530 1265 506 C1208 471 1200 420 1245 380" stroke="${accentA}" stroke-opacity="0.65" stroke-width="16" fill="none" stroke-linecap="round"/>
  <circle cx="1248" cy="360" r="8" fill="${accentB}" fill-opacity="0.55" />
  <circle cx="1384" cy="176" r="9" fill="${accentA}" fill-opacity="0.45" />

  <text x="96" y="842" class="brand">David Adesina</text>
</svg>
`;
}

async function run() {
  await fs.mkdir(outputDir, { recursive: true });
  const entries = await fs.readdir(blogDir, { withFileTypes: true });
  const blogFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
    .map((entry) => entry.name)
    .sort();

  const results = [];
  for (const fileName of blogFiles) {
    const slug = fileName.replace(/\.html$/i, '');
    const filePath = path.join(blogDir, fileName);
    const outputPath = path.join(outputDir, `${slug}.svg`);
    const fileText = await fs.readFile(filePath, 'utf8');
    const metadata = extractBlogMetadata(fileText, slug);
    const svg = buildSvg({ slug, ...metadata });
    await fs.writeFile(outputPath, svg, 'utf8');
    results.push({ slug, title: metadata.title });
  }

  console.log(`Generated ${results.length} blog cover images in ${path.relative(projectRoot, outputDir)}`);
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
