// Audience landing pages — the ONLY file to edit when adding or changing one.
//
// After any change here (or to the homepage header/footer/store badges, which
// the pages copy from index.html), rebuild from the repo root:
//
//     node _landing/build.mjs
//
// and commit the regenerated <path>.html files plus sitemap.xml.
// The _landing/ folder itself is never published (GitHub Pages' Jekyll step
// skips folders that start with "_").

export const SITE = {
  origin: 'https://findyourperson.app',

  // App Store campaign attribution (pt + ct). Leave EMPTY until a real
  // provider token is copied from App Store Connect → App Analytics →
  // Campaigns → "Generate a campaign link". Empty = ordinary App Store links,
  // no attribution claimed. Never invent one.
  appleProviderToken: '',

  // Fixed Google Play install-referrer values; utm_campaign comes from each
  // page's `campaign` below.
  playReferrer: { utm_source: 'website', utm_medium: 'landing_page' },

  // Non-landing public pages for sitemap.xml (privacy-policy.html is a
  // redirect to privacy.html, so it is deliberately left out).
  sitemapPages: ['/', '/privacy.html', '/terms.html', '/safety.html', '/contact.html', '/child-safety.html'],
};

// `visual` reuses a How It Works illustration from the homepage:
//   'location-icon'      — map pin   (homepage step 2)
//   'relocate-icon'      — house     (homepage step 3)
//   'avatars-screenshot' — avatar picker screenshot (homepage step 4)
const PRIVACY_BENEFIT = {
  heading: "Your real photos aren't public.", // period matches the homepage's step 4
  body: 'Your public profile shows a stylized avatar — not the selfie you upload to create it. Your selfie is never shown to other users.',
  visual: 'avatars-screenshot',
};

const RELOCATE_BENEFIT = {
  heading: "See who's willing to move",
  body: 'Every profile shows whether that person would consider relocating for the right relationship.',
  visual: 'relocate-icon',
};

export const PAGES = [
  {
    path: 'homesteaders',
    campaign: 'homesteaders',
    metaTitle: 'Homestead Dating | Find Your Person',
    metaDescription: "Search the whole U.S. for someone who wants the homestead life too, and see who's willing to relocate.",
    headline: 'Looking for someone who wants the homestead life too?',
    subhead: "The right partner for a life on the land might be three states away. Find Your Person lets you search the whole U.S. by values and lifestyle, and see who's willing to relocate.",
    benefits: [
      {
        heading: 'Whether you have land or want it',
        body: "Whether you're already living on your land or dreaming of getting there, search for someone who shares that vision.",
        visual: 'location-icon',
      },
      RELOCATE_BENEFIT,
      PRIVACY_BENEFIT,
    ],
  },
  {
    path: 'travel-nurses',
    campaign: 'travel-nurses',
    metaTitle: 'Dating for Travel Nurses | Find Your Person',
    metaDescription: "Stop starting over every contract. Search the whole U.S. by values and lifestyle, and see who's willing to relocate.",
    headline: "New contract, new city. Your dating life shouldn't start over every time.",
    subhead: "Most dating apps focus on who's near your current assignment. Find Your Person lets you search the whole U.S. by values and lifestyle, so this month's ZIP code doesn't decide who you meet.",
    benefits: [
      {
        heading: 'Search anywhere, not just nearby',
        body: 'Your search covers the whole country by default, wherever your next assignment takes you.',
        visual: 'location-icon',
      },
      RELOCATE_BENEFIT,
      PRIVACY_BENEFIT,
    ],
  },
];
