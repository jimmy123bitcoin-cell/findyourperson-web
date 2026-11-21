// Builds the audience landing pages from _landing/config.mjs + template.html.
//
//   node _landing/build.mjs          regenerate <path>.html + sitemap.xml
//   node _landing/build.mjs --check  write nothing; report anything stale
//
// The homepage (index.html) is the single source for everything shared and is
// only ever READ. Copied from it at build time:
//   - <nav> and <footer>
//   - the two hero store badges (hrefs swapped for campaign links)
//   - the whole How It Works section; only point 2's body is replaced
//   - the ten general FAQs (visible <details> + their FAQPage structured data)
//   - the Who It's For checkmark icon
//
// Consistency check (both modes, warnings only — never a rewrite or a failure):
//   - expected homepage content that can't be found is reported by name
//   - each landing page's shared FAQs and How It Works text are compared with
//     the homepage after stripping markup/entities/whitespace; in build mode
//     this lists what the rebuild just refreshed, in --check mode it lists what
//     is STALE in the committed pages (e.g. the homepage changed, no rebuild).
// Structural pieces the build cannot work without (nav, footer, sections)
// stop the build with an error instead. No dependencies beyond Node.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE, PAGES } from './config.mjs';

const CHECK = process.argv.includes('--check');
const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const read = (f) => readFileSync(join(root, f), 'utf8').replace(/\r\n/g, '\n');

const PLAY_BASE = 'https://play.google.com/store/apps/details?id=com.myperson';
const APP_STORE_BASE = 'https://apps.apple.com/app/find-your-person/id6770636823';
const EXPECTED_HOME_FAQS = 10;

const warnings = [];
const warn = (m) => warnings.push(m);
function fail(msg) { console.error(`build failed: ${msg}`); process.exit(1); }
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Text with markup, entities and spacing removed — what a reader sees.
const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", apos: "'", nbsp: ' ', copy: '©' };
const norm = (html) => String(html)
  .replace(/<[^>]+>/g, ' ')
  .replace(/&(#39|amp|lt|gt|quot|apos|nbsp|copy);/g, (_, e) => ENTITIES[e])
  .replace(/\s+/g, ' ')
  .trim();

// The complete <tag …>…</tag> element starting at `start` (nesting counted).
function element(src, start, tag) {
  const re = new RegExp(`<${tag}\\b|</${tag}>`, 'g');
  re.lastIndex = start;
  let depth = 0, m;
  while ((m = re.exec(src))) {
    depth += m[0].startsWith('</') ? -1 : 1;
    if (depth === 0) return src.slice(start, m.index + m[0].length);
  }
  return null;
}
function sectionById(src, id) {
  const start = src.search(new RegExp(`<section\\b[^>]*\\bid="${id}"`));
  return start < 0 ? null : element(src, start, 'section');
}

// ---- readers shared by the build and the check -------------------------------
function stepsOf(html) {                      // How It Works point n → {heading, body}
  const sec = sectionById(html, 'how-it-works') || '';
  const out = {};
  for (const n of [1, 2, 3, 4]) {
    const i = sec.indexOf(`<span class="step-number">${n}</span>`);
    if (i < 0) continue;
    const h = sec.slice(i).match(/<strong>([\s\S]*?)<\/strong>[\s\S]*?<p>([\s\S]*?)<\/p>/);
    if (h) out[n] = { heading: norm(h[1]), body: norm(h[2]) };
  }
  return out;
}
function faqBlocksOf(html) {
  const sec = sectionById(html, 'faq') || '';
  return sec.match(/<details class="faq-item">[\s\S]*?<\/details>/g) || [];
}
function faqsOf(html) {                       // visible question → answer (normalized)
  const map = new Map();
  for (const b of faqBlocksOf(html)) {
    const q = b.match(/<summary>([\s\S]*?)<span class="chevron">/);
    const a = b.match(/<div class="faq-a">([\s\S]*?)<\/div>/);
    if (q && a) map.set(norm(q[1]), norm(a[1]));
  }
  return map;
}
function jsonLdFaqsOf(html) {                 // structured-data question → answer
  const m = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (!m) return null;
  try {
    const ld = JSON.parse(m[1]);
    return new Map((ld.mainEntity || []).map((e) => [norm(e.name), norm(e.acceptedAnswer?.text)]));
  } catch { return null; }
}

// Shared content of `page` that differs from `home` — one line per item.
function sharedDiffs(page, home, audienceQs) {
  const diffs = [];
  const hs = stepsOf(home), ps = stepsOf(page);
  for (const n of [1, 2, 3, 4]) {
    if (!hs[n]) { diffs.push(`How It Works point ${n}: not found on the homepage, so it could not be compared`); continue; }
    if (!ps[n]) { diffs.push(`How It Works point ${n}: missing from the page`); continue; }
    if (ps[n].heading !== hs[n].heading) diffs.push(`How It Works point ${n}: heading differs ("${ps[n].heading}" vs homepage "${hs[n].heading}")`);
    if (n !== 2 && ps[n].body !== hs[n].body) diffs.push(`How It Works point ${n}: body text differs from the homepage`);
  }
  const hf = faqsOf(home), pf = faqsOf(page);
  if (hf.size === 0) diffs.push('FAQ: no homepage FAQs found, so none could be compared');
  for (const [q, a] of hf) {
    if (!pf.has(q)) diffs.push(`FAQ "${q}": on the homepage but missing from the page`);
    else if (pf.get(q) !== a) diffs.push(`FAQ "${q}": answer differs from the homepage`);
  }
  for (const q of pf.keys()) {
    if (!hf.has(q) && !audienceQs.has(q)) diffs.push(`FAQ "${q}": on the page but no longer on the homepage`);
  }
  const hl = jsonLdFaqsOf(home), pl = jsonLdFaqsOf(page);
  if (!hl || !pl) diffs.push('FAQ structured data: could not be read on the ' + (!hl ? 'homepage' : 'page'));
  else for (const [q, a] of hl) {
    if (pl.get(q) !== a) diffs.push(`FAQ structured data "${q}": ${pl.has(q) ? 'answer differs from' : 'missing, but present on'} the homepage`);
  }
  return diffs;
}

// ---- pieces from the homepage ------------------------------------------------
const home = read('index.html');
const need = (v, what) => v || fail(`could not find ${what} in index.html`);

const nav = need(home.match(/<nav>[\s\S]*?<\/nav>/)?.[0], '<nav>');
const footer = need(home.match(/<footer>[\s\S]*?<\/footer>/)?.[0], '<footer>');

const heroBadgeRow = need(home.match(/<div class="badge-row" id="get-the-app">([\s\S]*?)\n\s*<\/div>/)?.[1], 'the hero badge row');
const badgeAnchors = heroBadgeRow.match(/<a class="store-badge"[\s\S]*?<\/a>/g) || [];
const appleBadge = need(badgeAnchors.find((a) => a.includes(`href="${APP_STORE_BASE}"`)), 'the App Store badge');
const playBadge = need(badgeAnchors.find((a) => a.includes(`href="${PLAY_BASE}"`)), 'the Google Play badge');

const homeHowItWorks = need(sectionById(home, 'how-it-works'), 'the How It Works section');
const homeSteps = stepsOf(home);
for (const n of [1, 2, 3, 4]) if (!homeSteps[n]) warn(`homepage How It Works point ${n} not found`);
const p2 = homeHowItWorks.indexOf('<span class="step-number">2</span>');
const p2Body = p2 < 0 ? -1 : homeHowItWorks.indexOf('<p>', p2);
if (p2Body < 0) fail('could not find How It Works point 2 body in index.html');
const p2End = homeHowItWorks.indexOf('</p>', p2Body) + '</p>'.length;

const whoSection = need(sectionById(home, 'who-its-for'), 'the Who It\'s For section');
const checkIcon = need(whoSection.match(/<div class="who-item">\s*(<svg[\s\S]*?<\/svg>)/)?.[1], 'the Who It\'s For checkmark icon');

const homeFaqBlocks = faqBlocksOf(home);
if (homeFaqBlocks.length !== EXPECTED_HOME_FAQS) warn(`homepage has ${homeFaqBlocks.length} FAQs (expected ${EXPECTED_HOME_FAQS}) — check that every general FAQ was picked up`);
const homeLd = (() => {
  const m = home.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  try { return m && JSON.parse(m[1]); } catch { return null; }
})();
if (!homeLd?.mainEntity) warn('homepage FAQ structured data not found or unreadable — landing pages will carry only their audience FAQs in it');
else {
  const visible = [...faqsOf(home).keys()], ld = homeLd.mainEntity.map((e) => norm(e.name));
  if (visible.join('|') !== ld.join('|')) warn('homepage FAQ structured data does not list the same questions, in the same order, as the visible FAQ');
}

// ---- links -------------------------------------------------------------------
function playUrl(campaign) {
  const u = new URL(PLAY_BASE); // keeps id=com.myperson
  u.searchParams.set('referrer', new URLSearchParams({ ...SITE.playReferrer, utm_campaign: campaign }).toString());
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

function render(p) {
  const url = `${SITE.origin}/${p.path}`;
  const badges = [
    appleBadge.replace(`href="${APP_STORE_BASE}"`, `href="${esc(appStoreUrl(p.campaign))}"`),
    playBadge.replace(`href="${PLAY_BASE}"`, `href="${esc(playUrl(p.campaign))}"`),
  ].join('\n');
  const howItWorks = homeHowItWorks.slice(0, p2Body) + `<p>${esc(p.point2Body)}</p>` + homeHowItWorks.slice(p2End);
  const audienceFaqBlocks = p.faqs.map((f) =>
    `        <details class="faq-item">\n          <summary>${esc(f.q)}<span class="chevron"></span></summary>\n          <div class="faq-a">${esc(f.a)}</div>\n        </details>`);
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      ...p.faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      ...(homeLd?.mainEntity || []),
    ],
  };
  const vars = {
    metaTitle: esc(p.metaTitle),
    metaDescription: esc(p.metaDescription),
    url: esc(url),
    headline: esc(p.headline),
    subhead: esc(p.subhead),
    nav, footer, badges, howItWorks,
    faqJsonLd: JSON.stringify(ld, null, 2).replace(/</g, '\\u003c').replace(/^/gm, '  '),
    aboutHeading: esc(p.about.heading),
    aboutBody: p.about.paragraphs.map((t) => `      <p class="about-body">${esc(t)}</p>`).join('\n'),
    aboutClosing: esc(p.about.closing),
    whoHeading: esc(p.who.heading),
    whoItems: p.who.items.map((t) => `        <div class="who-item">\n          ${checkIcon}\n          ${esc(t)}\n        </div>`).join('\n'),
    faqItems: [...audienceFaqBlocks, ...homeFaqBlocks.map((b) => `        ${b}`)].join('\n'),
  };
  const html = template.replace(/\{\{(\w+)\}\}/g, (m, k) => {
    if (!(k in vars)) fail(`template placeholder {{${k}}} has no value`);
    return vars[k];
  });
  // Every in-page link (e.g. the nav's #faq) must have a target on this page.
  for (const [, id] of html.matchAll(/href="#([\w-]+)"/g)) {
    if (!html.includes(`id="${id}"`)) warn(`/${p.path}: link "#${id}" has no matching section on the page`);
  }
  return { html, apple: appStoreUrl(p.campaign), play: playUrl(p.campaign) };
}

const report = [];
for (const p of PAGES) {
  if (!/^[a-z0-9-]+$/.test(p.path)) fail(`bad path "${p.path}"`);
  const { html, apple, play } = render(p);
  const file = `${p.path}.html`;
  const audienceQs = new Set(p.faqs.map((f) => norm(esc(f.q))));

  // A fresh render should always agree with the homepage; if not, extraction broke.
  for (const d of sharedDiffs(html, home, audienceQs)) warn(`/${p.path} (fresh build): ${d}`);

  const committed = existsSync(join(root, file)) ? read(file) : null;
  const stale = committed ? sharedDiffs(committed, home, audienceQs) : [];
  if (CHECK) {
    if (!committed) warn(`/${p.path}: ${file} has not been built yet`);
    for (const d of stale) warn(`/${p.path} is STALE — ${d}`);
    if (committed && !stale.length && committed !== html) warn(`/${p.path}: differs from a fresh build (config, template, header or footer changed) — rebuild`);
  } else {
    writeFileSync(join(root, file), html);
    for (const d of stale) console.log(`/${p.path} refreshed from homepage — ${d}`);
  }
  report.push({ page: `/${p.path}`, apple, play });
}

// ---- sitemap -----------------------------------------------------------------
const locs = [...SITE.sitemapPages, ...PAGES.map((p) => `/${p.path}`)].map((path) => `${SITE.origin}${path}`);
const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  locs.map((l) => `  <url><loc>${esc(l)}</loc></url>`).join('\n') + '\n</urlset>\n';
if (CHECK) {
  if (!existsSync(join(root, 'sitemap.xml')) || read('sitemap.xml') !== sitemap) warn('sitemap.xml differs from a fresh build — rebuild');
} else {
  writeFileSync(join(root, 'sitemap.xml'), sitemap);
}

if (!CHECK) {
  for (const r of report) console.log(`${r.page}\n  App Store:   ${r.apple}\n  Google Play: ${r.play}`);
  console.log(`sitemap.xml: ${locs.length} URLs`);
}
if (warnings.length) {
  console.log(`\n${warnings.length} warning(s):`);
  for (const w of warnings) console.log(`  ⚠ ${w}`);
} else {
  console.log(CHECK ? 'check: landing pages are up to date with the homepage' : 'consistency check: no warnings');
}
