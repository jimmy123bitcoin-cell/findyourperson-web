// Audience landing pages — the ONLY file to edit when adding or changing one.
//
// Holds ONLY audience-specific copy. Everything shared with the homepage — the
// header, footer, store badges, How It Works (points 1, 3 and 4 plus all three
// screenshots), the ten general FAQs and their structured data — is copied
// from index.html at build time, so it cannot drift from the homepage.
//
// Rebuild after editing this file OR the homepage (repo root):
//
//     node _landing/build.mjs          # regenerate pages + sitemap.xml
//     node _landing/build.mjs --check  # write nothing; report stale pages
//
// then commit the regenerated <path>.html files plus sitemap.xml.
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

const CLOSING_LINE = 'No endless swiping. No algorithm deciding who you see. Just search for what matters to you.';

// Per page:
//   hero        — headline + subhead
//   about       — heading, body paragraphs, closing line
//   point2Body  — replaces ONLY the body of How It Works point 2 (its heading
//                 and the other three points come from the homepage)
//   who         — heading + items (homepage style: no closing periods)
//   faqs        — audience questions, shown BEFORE the homepage's ten
export const PAGES = [
  {
    path: 'homesteaders',
    campaign: 'homesteaders',
    metaTitle: 'Homestead Dating | Find Your Person',
    metaDescription: "Search the whole U.S. for someone who wants the homestead life too, and see who's willing to relocate.",
    headline: 'Looking for someone who wants the homestead life too?',
    subhead: "The right partner for a life on the land might be three states away. Find Your Person lets you search the whole U.S. by values and lifestyle, and see who's willing to relocate.",
    about: {
      heading: 'Find someone who shares your vision of the homestead life',
      paragraphs: [
        "Finding someone who wants the same kind of life can be difficult when you're limited to people nearby. Maybe you already have land and want a partner to share it with. Maybe you're still dreaming of a homestead, a garden, animals, and a more self-sufficient way of living.",
        'Find Your Person lets you search nationwide for people whose values, interests, and goals align with yours — including those who would consider relocating for the right relationship.',
      ],
      closing: CLOSING_LINE,
    },
    point2Body: 'Search nationwide instead of limiting yourself to nearby singles. Someone who shares your vision for land, self-sufficiency, and rural living might be in another state.',
    who: {
      heading: 'For people who want to build a life on the land together',
      items: [
        'People already living on a homestead who want a partner to share that life',
        'People planning to buy land or start homesteading in the future',
        'Rural and small-town singles who value self-sufficiency and simple living',
        'People passionate about gardening, livestock, farming, or off-grid living',
        'People living in cities or suburbs who dream of a different lifestyle',
        'Anyone open to looking beyond their local dating pool for someone with similar goals',
      ],
    },
    faqs: [
      {
        q: 'Do I need to own land or already be homesteading?',
        a: 'No. You might already have a homestead, or you might be working toward one. Find Your Person lets you describe what matters to you and search for people with compatible goals and interests.',
      },
      {
        q: "What if I already have land and can't relocate?",
        a: "Every profile shows whether someone would consider relocating for the right relationship. You can look beyond your local area for people who might be open to moving, without assuming you have to leave your own land.",
      },
    ],
  },
  {
    path: 'travel-nurses',
    campaign: 'travel-nurses',
    metaTitle: 'Dating for Travel Nurses | Find Your Person',
    metaDescription: "Stop starting over every contract. Search the whole U.S. by values and lifestyle, and see who's willing to relocate.",
    headline: "New contract, new city. Your dating life shouldn't start over every time.",
    subhead: "Most dating apps focus on who's near your current assignment. Find Your Person lets you search the whole U.S. by values and lifestyle, so this month's ZIP code doesn't decide who you meet.",
    about: {
      heading: "Your next assignment shouldn't define your dating options",
      paragraphs: [
        "Travel nursing can mean changing cities regularly, meeting new people, and starting over just when you're getting settled. Building a lasting relationship can be difficult when dating apps focus on whoever happens to be nearby.",
        "Find Your Person lets you search nationwide for someone who shares your values and relationship goals, regardless of where your current assignment takes you. You can also see who's willing to relocate.",
      ],
      closing: CLOSING_LINE,
    },
    point2Body: "Search nationwide regardless of where you're currently working. Your dating options don't have to reset whenever your next assignment takes you somewhere new.",
    who: {
      heading: 'For people whose careers keep them moving — and the people open to dating them',
      items: [
        'Travel nurses moving between temporary assignments',
        'Nurses considering travel assignments in the future',
        'People seeking a long-term relationship despite frequent moves',
        'Singles open to dating someone whose career involves travel',
        'People comfortable exploring long-distance relationships',
        'Anyone who cares more about compatibility than sharing the same ZIP code',
      ],
    },
    faqs: [
      {
        q: 'Can I keep searching when I change assignments?',
        a: "Yes. Find Your Person searches nationwide by default, so your search isn't limited to the city where you're currently working.",
      },
      {
        q: 'Is Find Your Person only for travel nurses?',
        a: "No. Find Your Person is open to eligible adults throughout the U.S. Travel nurses can search for people who share their values and relationship goals, including people who don't work in healthcare.",
      },
    ],
  },
];
