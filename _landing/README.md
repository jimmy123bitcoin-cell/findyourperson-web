# Audience landing pages — how to add one

`/homesteaders` is the reference page. A new page is mostly content and assets;
everything shared (header, footer, How It Works, general FAQ, store badges,
Founding Member offer + availability, Early Access line, analytics, layout)
comes from the homepage and `config.mjs` `SITE`, so it cannot drift.

(`_landing/` is never published — GitHub Pages skips folders starting with `_`.)

## 1. Pick the path — it is also the campaign token

Lowercase words joined by hyphens, max 40 characters (`homesteaders`,
`travel-nurses`, `ranch-life`). Never reuse one for a different audience. The
build derives every campaign link from it:

| Where | Value | Example |
|---|---|---|
| App Store link `ct=` | path in capitals, hyphens removed | `Homesteaders`, `TravelNurses` |
| Google Play `utm_campaign=` | path | `homesteaders`, `travel-nurses` |
| Website counters `page=` | `/` + path | `/homesteaders` |

The Apple provider token is stored once in `SITE.appleProviderToken`, so App
Store links (`apps.apple.com/app/apple-store/id…?pt=…&ct=…&mt=8`, the same form
App Store Connect generates) are built automatically and nothing needs creating
in App Store Connect. Store links inside the shared FAQ answers are tagged too.
Never hand-type a `ct`: Apple campaign names are case-sensitive.

## 2. Create the promo code (optional, in the my-person repo)

```
npm run growth -- code add RANCH --type campaign --campaign "Ranch life" --days 0 --founding --yes
```

Campaign codes grant Founding Membership while spots remain, never pay a
referral, and attribute completed profiles to the campaign.

## 3. Generate the images (in the my-person repo)

1. Copy `scripts/landing-shots/niches/homesteaders/` to `niches/<path>/`. Edit
   `niche.mjs`: the search to show (category + keyword), the fictional demo
   profiles and their avatars, the profile to open, and the `og` headline.
2. Add a lifestyle photo as `findyourperson-web/img/landing/<path>-lifestyle-{720,1200}.{jpg,webp}`
   (3:2; generated or licensed, no people).
3. `node scripts/landing-shots/shoot.mjs <path>`: builds the real app for
   the browser, runs it on demo data only (every write is blocked, and no real
   member can appear), and saves `<path>-search/-results/-profile` screenshots.
4. `node scripts/landing-shots/og.mjs <path>`: 1200×630 sharing image.

## 4. Add the page to `config.mjs` `PAGES`

Required: `path`, meta title/description, headline/subhead, about, point2Body,
who, faqs. Optional: `promoCode`, `earlyAccessHero: true` (the Early Access
note under the hero buttons), `lifestyleImage`, `screenshots` (`hero`: the phone
beside the lifestyle photo, normally the `-results` shot because it shows
audience profiles; `profile`: How It Works), `searchExamples`, `og`. Leave out any of them and the page uses the shared
default. Shared offer wording lives in `SITE.offer` only.

## 5. Build, preview, deploy

```
node _landing/build.mjs                       # regenerates pages + sitemap
# my-person repo, Git Bash: keep the leading slash literal
MSYS_NO_PATHCONV=1 node scripts/landing-shots/preview.mjs <outDir> /<path>
```

Check the desktop and mobile previews, then commit and push `main`. The push
is the deploy.

## Where results show up

- `npm run growth -- web` (my-person): visits, App Store / Google Play clicks
  and code copies per page, plus redemptions, completed profiles and new
  Founding Members per public or campaign code. Test accounts are excluded.
- App Store Connect → App Analytics → Campaigns (`ct`), and Play Console
  acquisition reports (`utm_campaign`): store-side views and installs. These
  do not identify individual completed profiles; the promo code does.
