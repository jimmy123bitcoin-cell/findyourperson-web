// Builds the audience landing pages from _landing/config.mjs + template.html.
// Usage (repo root):  node _landing/build.mjs
//
// Shared pieces are COPIED from index.html at build time — the homepage itself
// is only read, never written:
//   - <nav>…</nav> and <footer>…</footer> (homepage section links are pointed
//     back at index.html#…; "#get-the-app" stays local, since each landing page
//     has its own store buttons under that id)
//   - the two hero store badges (hrefs swapped for campaign links)
//   - the How It Works illustrations named in config `visual`
// Also writes sitemap.xml (SITE.sitemapPages + every landing page).
// No dependencies beyond Node itself.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE, PAGES } from './config.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const read = (f) => readFileSync(join(root, f), 'utf8').replace(/\r\n/g, '\n');

const PLAY_BASE = 'https://play.google.com/store/apps/details?id=com.myperson';
const APP_STORE_BASE = 'https://apps.apple.com/app/find-your-person/id6770636823';

function fail(msg) { console.error(`build failed: ${msg}`); process.exit(1); }
function one(re, src, what) {
  const m = src.match(re);
  if (!m) fail(`could not find ${what} in index.html`);
  return m;
}
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ---- pieces from the homepage ------------------------------------------------
const home = read('index.html');

const HOME_SECTIONS = ['how-it-works', 'who-its-for', 'faq'];
let nav = one(/<nav>[\s\S]*?<\/nav>/, home, '<nav>')[0];
for (const id of HOME_SECTIONS) {
  if (!nav.includes(`href="#${id}"`)) fail(`nav link #${id} missing`);
  nav = nav.replace(`href="#${id}"`, `href="index.html#${id}"`);
}
const footer = one(/<footer>[\s\S]*?<\/footer>/, home, '<footer>')[0];

const heroBadgeRow = one(/<div class="badge-row" id="get-the-app">([\s\S]*?)\n\s*<\/div>/, home, 'hero badge row')[1];
const badgeAnchors = heroBadgeRow.match(/<a class="store-badge"[\s\S]*?<\/a>/g) || [];
const appleBadge = badgeAnchors.find((a) => a.includes(`href="${APP_STORE_BASE}"`));
const playBadge = badgeAnchors.find((a) => a.includes(`href="${PLAY_BASE}"`));
if (!appleBadge || !playBadge) fail('hero store badges (or their expected hrefs) not found');

// How It Works rows → visuals by homepage step number.
const rows = home.split(/<div class="step-row[^"]*">/).slice(1);
function visualOfStep(n) {
  const row = rows.find((r) => r.includes(`<span class="step-number">${n}</span>`));
  if (!row) fail(`How It Works step ${n} not found`);
  const start = row.indexOf('<div class="step-visual');
  if (start < 0) fail(`visual for step ${n} not found`);
  return balancedDiv(row, start);
}
// The complete <div …>…</div> element starting at `start` (nested divs counted).
function balancedDiv(src, start) {
  const tag = /<div\b|<\/div>/g;
  tag.lastIndex = start;
  let depth = 0, m;
  while ((m = tag.exec(src))) {
    depth += m[0] === '</div>' ? -1 : 1;
    if (depth === 0) return src.slice(start, m.index + m[0].length);
  }
  fail('unbalanced <div> in index.html');
}
const VISUALS = {
  'location-icon': visualOfStep(2),
  'relocate-icon': visualOfStep(3),
  'avatars-screenshot': visualOfStep(4),
};

// ---- links -------------------------------------------------------------------
function playUrl(campaign) {
  const u = new URL(PLAY_BASE); // keeps id=com.myperson
  const referrer = new URLSearchParams({ ...SITE.playReferrer, utm_campaign: campaign }).toString();
  u.searchParams.set('referrer', referrer); // → utm_source%3Dwebsite%26…
  return u.toString();
}
function appStoreUrl(campaign) {
  if (!SITE.appleProviderToken) return APP_STORE_BASE;
  const u = new URL(APP_STORE_BASE);
  u.searchParams.set('pt', SITE.appleProviderToken);
  u.searchParams.set('ct', campaign);
  return u.toString();
}

// ---- render ------------------------------------------------------------------
const template = read('_landing/template.html');

function benefitRow(b, i) {
  const visual = VISUALS[b.visual];
  if (!visual) fail(`unknown visual "${b.visual}"`);
  return `
        <div class="step-row${i % 2 ? ' step-row--reverse' : ''}">
          <div class="step-text">
            <span class="step-number">${i + 1}</span>
            <strong>${esc(b.heading)}</strong>
            <p>${esc(b.body)}</p>
          </div>
          ${visual}
        </div>
`;
}

const report = [];
for (const p of PAGES) {
  if (!/^[a-z0-9-]+$/.test(p.path)) fail(`bad path "${p.path}"`);
  if (p.benefits?.length !== 3) fail(`${p.path}: expected 3 benefits`);
  const url = `${SITE.origin}/${p.path}`;
  const apple = appStoreUrl(p.campaign);
  const play = playUrl(p.campaign);
  const badges = [
    appleBadge.replace(`href="${APP_STORE_BASE}"`, `href="${esc(apple)}"`),
    playBadge.replace(`href="${PLAY_BASE}"`, `href="${esc(play)}"`),
  ].join('\n');

  const vars = {
    metaTitle: esc(p.metaTitle),
    metaDescription: esc(p.metaDescription),
    url: esc(url),
    headline: esc(p.headline),
    subhead: esc(p.subhead),
    nav, footer, badges,
    benefits: p.benefits.map(benefitRow).join(''),
  };
  const html = template.replace(/\{\{(\w+)\}\}/g, (m, k) => {
    if (!(k in vars)) fail(`template placeholder {{${k}}} has no value`);
    return vars[k];
  });
  writeFileSync(join(root, `${p.path}.html`), html);
  report.push({ page: `/${p.path}`, appStore: apple, googlePlay: play });
}

// ---- sitemap -----------------------------------------------------------------
const locs = [...SITE.sitemapPages, ...PAGES.map((p) => `/${p.path}`)].map((path) => `${SITE.origin}${path}`);
writeFileSync(join(root, 'sitemap.xml'),
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  locs.map((l) => `  <url><loc>${esc(l)}</loc></url>`).join('\n') +
  '\n</urlset>\n');

for (const r of report) console.log(`${r.page}\n  App Store:   ${r.appStore}\n  Google Play: ${r.googlePlay}`);
console.log(`sitemap.xml: ${locs.length} URLs`);
