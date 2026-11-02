#!/usr/bin/env node
// Static checks for this dependency-free site. Run: node scripts/check-site.mjs
// Add --compare to distinguish existing HEAD issues from newly introduced ones.
// Add --json for the complete machine-readable report.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = new Set(process.argv.slice(2));
const ignored = new Set(['.git', '.claude', '.agents', '.codex', '.preview', 'node_modules']);
const normalize = value => value.split(path.sep).join('/');

function walk(directory, prefix = '') {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    if (ignored.has(entry.name)) return [];
    const name = prefix + entry.name;
    return entry.isDirectory() ? walk(path.join(directory, entry.name), `${name}/`) : [name];
  });
}

const currentFiles = new Set(walk(root));
const currentRead = file => fs.readFileSync(path.join(root, file), 'utf8');
const decode = value => value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const attr = (tag, name) => {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'i'));
  return match ? decode(match[1] ?? match[2]) : null;
};

function inspect(files, read) {
  const issues = [];
  const documents = new Map();
  const add = (file, kind, detail, severity = 'error') => issues.push({ file, kind, detail, severity });
  const htmlFiles = [...files].filter(file => file.endsWith('.html'));

  for (const file of htmlFiles) {
    const raw = read(file);
    const source = raw.replace(/<!--[\s\S]*?-->/g, '');
    const markup = source.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, match => match.slice(0, match.indexOf('>') + 1));
    const ids = new Set();
    for (const match of markup.matchAll(/<[^>]+\bid\s*=\s*(?:"([^"]*)"|'([^']*)')[^>]*>/gi)) {
      const id = match[1] ?? match[2];
      if (ids.has(id)) add(file, 'duplicate-id', id);
      ids.add(id);
    }
    documents.set(file, { source, markup, ids });
    const headings = [...markup.matchAll(/<h([1-6])\b[^>]*>/gi)].map(match => Number(match[1]));
    const h1Count = headings.filter(level => level === 1).length;
    // Redirect-only documents intentionally have no page heading.
    const redirect = /http-equiv\s*=\s*["']refresh["']/i.test(markup);
    if (!redirect && h1Count !== 1) add(file, 'heading-count', `Expected one h1; found ${h1Count}`);
    let previous = 0;
    for (const level of headings) {
      if (previous && level > previous + 1) add(file, 'heading-order', `h${previous} to h${level}`, 'warning');
      previous = level;
    }

    for (const match of source.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
      const type = attr(match[1], 'type');
      if (!match[2].trim()) continue;
      try {
        if (type === 'application/ld+json') JSON.parse(match[2]);
        else if (!type || /javascript/.test(type)) new vm.Script(match[2], { filename: file });
      } catch (error) {
        add(file, type === 'application/ld+json' ? 'invalid-jsonld' : 'inline-javascript', error.message);
      }
    }
  }

  for (const [file, document] of documents) {
    for (const match of document.markup.matchAll(/<(a|link|img|script|source|iframe|video)\b[^>]*>/gi)) {
      const tag = match[0];
      const kind = match[1].toLowerCase();
      const reference = attr(tag, ['a', 'link'].includes(kind) ? 'href' : 'src');
      if (kind === 'img' && attr(tag, 'alt') === null) add(file, 'missing-alt', reference || '(image without src)');
      if (reference === null || !reference || reference === '#') continue;
      if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(reference)) continue;
      // Served by the hosting platform rather than this repository.
      if (reference.startsWith('/_vercel/')) continue;
      let resolved;
      try { resolved = new URL(reference, `https://local.test/${file}`); }
      catch { add(file, 'invalid-reference', reference); continue; }
      let target;
      try { target = decodeURIComponent(resolved.pathname).slice(1); }
      catch { add(file, 'invalid-reference', reference); continue; }
      if (!target || target.endsWith('/')) target += 'index.html';
      else if (!files.has(target) && files.has(`${target}/index.html`)) target += '/index.html';
      if (!files.has(target)) {
        add(file, kind === 'a' ? 'broken-link' : 'missing-asset', reference);
        continue;
      }
      if (kind === 'a' && resolved.hash && documents.has(target)) {
        let fragment;
        try { fragment = decodeURIComponent(resolved.hash.slice(1)); } catch { fragment = ''; }
        if (fragment && !documents.get(target).ids.has(fragment)) add(file, 'missing-anchor', reference);
      }
    }
  }
  return { pages: htmlFiles.length, issues };
}

const result = inspect(currentFiles, currentRead);
const scripts = [...currentFiles].filter(file => file.endsWith('.js'));
for (const file of scripts) {
  try { new vm.Script(currentRead(file), { filename: file }); }
  catch (error) { result.issues.push({ file, kind: 'javascript-syntax', detail: error.message, severity: 'error' }); }
}
result.scripts = scripts.length;

const comparing = args.has('--compare') || args.has('--baseline-stdin');
if (comparing) {
  let baselineInput;
  let baselineFiles;
  if (args.has('--baseline-stdin')) {
    // Optional sandbox-friendly input: { "relative/path": "HTML source or null" }.
    baselineInput = JSON.parse(fs.readFileSync(0, 'utf8').replace(/^\uFEFF/, ''));
    baselineFiles = new Set(Object.keys(baselineInput));
  } else {
    const tree = spawnSync('git', ['ls-tree', '-r', '--name-only', 'HEAD'], { cwd: root, encoding: 'utf8', windowsHide: true });
    if (tree.error) throw new Error(`Git subprocess unavailable (${tree.error.code}). Supply a HEAD file map through --baseline-stdin instead.`);
    if (tree.status !== 0) throw new Error(`Could not read baseline: ${tree.stderr}`);
    baselineFiles = new Set(tree.stdout.trim().split(/\r?\n/).map(normalize));
  }
  const cache = new Map();
  const baselineRead = file => {
    if (baselineInput) return baselineInput[file];
    if (!cache.has(file)) {
      const output = spawnSync('git', ['show', `HEAD:${file}`], { cwd: root, encoding: 'utf8', maxBuffer: 4 * 1024 * 1024, windowsHide: true });
      if (output.status !== 0) throw new Error(output.stderr);
      cache.set(file, output.stdout);
    }
    return cache.get(file);
  };
  const baseline = inspect(baselineFiles, baselineRead);
  const key = issue => `${issue.file}|${issue.kind}|${issue.detail}`;
  const existing = new Set(baseline.issues.map(key));
  result.issues = result.issues.map(issue => ({ ...issue, existing: existing.has(key(issue)) }));
  result.baselineIssues = baseline.issues.length;
}

const errors = result.issues.filter(issue => issue.severity === 'error');
const newErrors = errors.filter(issue => !issue.existing);
if (args.has('--json')) console.log(JSON.stringify(result, null, 2));
else {
  console.log(`Checked ${result.pages} HTML pages and ${result.scripts} JavaScript files.`);
  console.log(`${errors.length} errors; ${result.issues.length - errors.length} heading warnings.`);
  if (comparing) console.log(`${newErrors.length} new errors; ${errors.length - newErrors.length} existing errors from HEAD.`);
  const listed = comparing ? result.issues.filter(issue => !issue.existing) : result.issues;
  for (const issue of listed.slice(0, 50)) console.log(`${issue.severity.toUpperCase()} ${issue.file}: ${issue.kind} — ${issue.detail}`);
  if (listed.length > 50) console.log(`… ${listed.length - 50} more. Use --json for the complete report.`);
}
process.exitCode = newErrors.length ? 1 : 0;
