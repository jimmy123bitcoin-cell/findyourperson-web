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

  // App Store campaign attribution. The provider token (pt) is account-wide
  // and the same for every campaign (copied 2026-11-24 from the owner's App
  // Store Connect campaign link); each page's link adds its own ct.
  appleProviderToken: '128898873',

  // CAMPAIGN NAMING CONVENTION (2026-11-24, Apple form revised 2026-11-25)
  // — one campaign per landing page, named after its path: lowercase words
  // joined by hyphens, max 40 chars (homesteaders, travel-nurses, …). Never
  // reused for a different audience. The build derives every link from it:
  //   App Store link   ct=<Path in capitals, hyphens removed>  (Homesteaders, TravelNurses)
  //                    → App Store Connect → App Analytics → Campaigns
  //   Google Play link utm_campaign=<path>   (homesteaders, travel-nurses)
  //                    → Play Console acquisition reports
  //   website counters page=/<path>          (npm run growth -- web, my-person repo)
  // Apple's form matches the owner's first App Store Connect link
  // (ct=Homesteaders); Apple campaign names are case-sensitive, so never
  // hand-type a ct.
  // Store links inside the shared homepage FAQ answers are tagged the same
  // way on landing pages, so no download link bypasses the campaign.
  // The page's promo code is separate: a short capitalised word
  // (HOMESTEAD) created as a `campaign` code whose campaign label names the
  // audience, so completed profiles are attributed in the growth report.
  campaignConvention: 'path',

  // Fixed Google Play install-referrer values; utm_campaign comes from each
  // page's `campaign` below.
  playReferrer: { utm_source: 'website', utm_medium: 'landing_page' },

  // Shared Founding Member offer copy — every landing page with a promoCode
  // shows exactly this (once near the hero buttons, once in the closing CTA).
  // Change the terms HERE and rebuild; never per page. Must match /founding
  // and the app (Phase 1 terms).
  offer: {
    title: 'Become one of our first 100 Founding Members',
    body: (code) => `Create your profile, then enter promo code ${code} when the app asks at the end, or anytime in Settings → Redeem a Promo Code, to receive free Premium through one year after messaging opens, along with exclusive Founding Member benefits.`,
    referralNote: 'Have a referral code from a friend? Use theirs instead to receive the same benefits.',
  },

  // Understated Early Access note under the hero download buttons, on pages
  // that set earlyAccessHero: true (the /homesteaders reference format).
  heroEarlyAccessLine: "We're currently in Early Access. Create your profile and explore matches nationwide. Messaging will open as soon as the community is ready.",

  // Shared Early Access line for the closing CTA.
  earlyAccessLine: 'Early Access: Create your profile and explore the founding community now. Messaging will open as soon as the community is ready.',

  // Shown under every generated app screenshot (they use fictional demo
  // profiles — see my-person/scripts/landing-shots).
  illustrativeCaption: 'App screens shown with illustrative demo profiles.',

  // Under every search-examples section: what search really does, and no
  // implied community size.
  searchExamplesNote: "Search matches the words people write in their profiles, plus categories and filters. Results depend on who has joined, and we're in Early Access and still growing.",

  // Closing line under each page's About text (owner-approved 2026-11-25,
  // replaced "No algorithm deciding who you see"). A page may override it
  // with about.closing, but normally should not.
  closingLine: 'No swiping. You decide who to search for, based on what matters to you.',

  // Non-landing public pages for sitemap.xml (privacy-policy.html is a
  // redirect to privacy.html, so it is deliberately left out).
  sitemapPages: ['/', '/founding', '/privacy.html', '/terms.html', '/safety.html', '/contact.html', '/child-safety.html'],
};

// ─── Per page ───────────────────────────────────────────────────────────────
// /homesteaders is the reference page and the DEFAULT for every page: all
// shared features are ON unless a page opts out explicitly with `false`.
// The build fails if a page is missing anything a full page needs, so a new
// page can never silently ship in a reduced form.
//
// Path is also the campaign name — see SITE.campaignConvention.
//
// Required copy:
//   path, metaTitle, metaDescription, headline, subhead
//   about        — { heading, paragraphs }   (closing defaults to SITE.closingLine)
//   point2Body   — replaces ONLY the body of How It Works point 2
//   who          — { heading, items }        (homepage style: no closing periods)
//   faqs         — audience questions, shown BEFORE the homepage's general ones
// Required features (or `false` to opt out):
//   promoCode       — campaign code for the shared Founding offer (create it
//                     first: npm run growth -- code add CODE --type campaign --founding …)
//   searchExamples  — { heading, intro, items: [{ text, query, chips }] }
//                     (chips must be real app categories/filters)
//   lifestyleImage  — { alt }  files img/landing/<path>-lifestyle-720/-1200 .webp/.jpg
//                     (optional focus: CSS object-position, e.g. '58% 50%', when
//                     the subject sits off-centre and the hero frame crops it)
//   screenshots     — { hero: { alt }, profile: { alt } }
//                     files img/landing/<path>-results / -profile .webp/.png,
//                     generated by my-person: node scripts/landing-shots/shoot.mjs <path>
//   og              — { imageAlt }  file img/landing/<path>-og.jpg (og.mjs <path>)
// On by default (opt out with `false`):
//   earlyAccessHero — the Early Access note under the hero buttons
// File locations follow the naming above; pass `base` / `image` only to
// point somewhere else.
export const PAGES = [
  {
    path: 'homesteaders',
    promoCode: 'HOMESTEAD',
    lifestyleImage: {
      alt: 'A white farmhouse with a vegetable garden and a chicken coop at golden hour',
    },
    screenshots: {
      hero: { alt: 'Illustrative Find Your Person search results for "Chickens": Rosa and Hannah, both tagged Rural & Homestead and willing to relocate, describing goats, chickens, gardens and canning season' },
      profile: { alt: 'An illustrative profile: Hannah, willing to relocate, passionate about raising chickens and growing her own food' },
    },
    searchExamples: {
      heading: 'Search for the life you want to build',
      intro: 'Type the words that matter to you, then narrow it down with categories and filters. A few searches to try:',
      items: [
        { text: 'Someone who wants to raise a family on a homestead', query: 'Homestead', chips: ['Kids Soon'] },
        { text: 'Someone into gardening, raising animals, and self-sufficiency', query: 'Gardening', chips: ['Rural & Homestead'] },
        { text: 'Someone willing to relocate to build a rural life together', query: 'Off-grid', chips: ['Rural & Homestead', 'Willing to relocate: Yes'] },
      ],
    },
    og: {
      imageAlt: 'A farmhouse and vegetable garden beside the words "Dating for homesteaders" and the Find Your Person logo',
    },
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
        q: 'Can I find someone who wants to start a homestead together?',
        a: "Yes. Search for the words people use when they describe that goal, like homestead, chickens, or off-grid, and add the Rural & Homestead category. Every profile also shows whether someone is willing to relocate, so you can find people open to building that life somewhere new.",
      },
      {
        q: "What if I already have land and can't relocate?",
        a: "Every profile shows whether someone would consider relocating for the right relationship. You can look beyond your local area for people who might be open to moving, without assuming you have to leave your own land.",
      },
    ],
  },
  {
    path: 'travel-nurses',
    promoCode: 'TRAVELNURSE',
    lifestyleImage: {
      alt: 'A sunlit apartment with navy scrubs and a stethoscope on a chair, a packed suitcase, and a coffee mug by a window overlooking a city',
      focus: '22% 50%', // desktop hero: scrubs + city view, clear of the phone overlap
    },
    screenshots: {
      hero: { alt: 'Illustrative Find Your Person search results for "Travel nurse" with the Work Traveler category, showing travel nurses in different states and whether they are willing to relocate' },
      profile: { alt: 'An illustrative profile: Maya, an ICU travel nurse in Denver who is willing to relocate' },
    },
    searchExamples: {
      heading: 'Search for someone who gets the travel nurse life',
      intro: 'Type the words that matter to you, then narrow it down with categories and filters. A few searches to try:',
      items: [
        { text: 'Someone who understands contracts, night shifts, and moving every few months', query: 'Travel nurse', chips: ['Work Traveler'] },
        { text: 'Someone ready to build a family, wherever your next assignment is', query: 'Nurse', chips: ['Kids Soon'] },
        { text: 'Someone willing to relocate for the right relationship', query: 'Hiking', chips: ['Willing to relocate: Yes'] },
      ],
    },
    og: {
      imageAlt: 'A sunlit apartment with scrubs, a stethoscope and a packed suitcase beside the words "Dating for travel nurses" and the Find Your Person logo',
    },
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
        q: 'Can I find someone who understands travel nursing?',
        a: 'Yes. Search for the words people use in their profiles, like travel nurse, nurse, or contract, and add the Work Traveler category to find people whose careers keep them moving too. Every profile also shows whether someone is willing to relocate.',
      },
      {
        q: 'Is Find Your Person only for travel nurses?',
        a: "No. Find Your Person is open to eligible adults throughout the U.S. Travel nurses can search for people who share their values and relationship goals, including people who don't work in healthcare.",
      },
    ],
  },
  {
    path: 'digital-nomads',
    promoCode: 'NOMAD',
    lifestyleImage: {
      alt: 'A laptop and a cup of coffee on a sunny terrace overlooking a colorful seaside town and a turquoise bay',
    },
    screenshots: {
      hero: { alt: 'Illustrative Find Your Person search results for "Remote" with the Work Traveler category, showing remote workers who love to travel' },
      profile: { alt: 'An illustrative profile: Lena, a remote UX designer in San Diego who loves surfing and slow travel' },
    },
    searchExamples: {
      heading: 'Search for the life you want to share',
      intro: 'Type the words that matter to you, then narrow it down with categories and filters. A few searches to try:',
      items: [
        { text: 'Someone who works remotely and loves to travel', query: 'Remote', chips: ['Work Traveler'] },
        { text: 'Someone into slow travel, new cities, and spontaneous trips', query: 'Travel', chips: ['Work Traveler'] },
        { text: 'Someone who wants a life of freedom and adventure, without kids', query: 'Adventure', chips: ['Childfree'] },
      ],
    },
    og: {
      imageAlt: 'A laptop and coffee on a sunny terrace above a colorful seaside town beside the words "Dating for digital nomads" and the Find Your Person logo',
    },
    metaTitle: 'Dating for Digital Nomads | Find Your Person',
    metaDescription: 'Find someone who shares your location-independent lifestyle. Search the whole U.S. by values, interests, and a love of travel.',
    headline: 'Looking for someone who wants to work from anywhere too?',
    subhead: "Most dating apps only show who's near you this week. Find Your Person lets you search the whole U.S. for people who share your location-independent lifestyle and your love of travel.",
    about: {
      heading: 'Find someone who shares your freedom to roam',
      paragraphs: [
        "When home is wherever your laptop is, dating apps built around who's nearby don't fit. You meet someone great, then one of you moves on. What you really want is someone who wants the same kind of life: flexible, curious, and always ready for the next trip.",
        'Find Your Person lets you search nationwide by values, interests, and lifestyle, so you can look for people who work remotely, love to travel, and want to explore together.',
      ],
    },
    point2Body: "Search nationwide instead of only the city you're in this month. Someone who shares your location-independent life could be anywhere in the U.S.",
    who: {
      heading: 'For people whose office is wherever they open their laptop',
      items: [
        'Remote workers and freelancers who travel often',
        'Digital nomads with a home base in the U.S.',
        'People planning to go location-independent',
        'Singles who want a partner to travel and explore with',
        'People who value freedom, flexibility, and new experiences',
        'Anyone who cares more about a shared lifestyle than a shared ZIP code',
      ],
    },
    faqs: [
      {
        q: 'Can I find someone who also works remotely?',
        a: 'Yes. Search for the words people use to describe that life, like remote, freelance, or travel, and add the Work Traveler category to find people whose work lets them move around too.',
      },
      {
        q: 'I travel all the time. What location do I use?',
        a: "Every profile uses a U.S. ZIP code to show a general area, so use your home base. Search covers the whole U.S., so you can find people wherever they are in the country, and you can hide your location down to the state level in Settings.",
      },
      {
        q: 'Is Find Your Person only for digital nomads?',
        a: 'No. Find Your Person is open to eligible adults throughout the U.S. You can search for anyone who shares your values and lifestyle, whether they travel full time or simply want a life with more adventure.',
      },
    ],
  },
  {
    path: 'flight-attendants',
    promoCode: 'FLYCREW',
    lifestyleImage: {
      alt: 'A carry-on suitcase beside an airport terminal window at sunrise, with a jet on the runway outside',
      focus: '58% 50%', // keep both the jet and the suitcase in the cropped hero frame
    },
    screenshots: {
      hero: { alt: 'Illustrative Find Your Person search results for "Flight attendant" with the Work Traveler category, showing flight attendants and airline crew in different states' },
      profile: { alt: 'An illustrative profile: Ava, a flight attendant based in Dallas who loves layover food tours' },
    },
    searchExamples: {
      heading: 'Search for someone who fits your life',
      intro: 'Type the words that matter to you, then narrow it down with categories and filters. A few searches to try:',
      items: [
        { text: 'Someone who understands reserve days and layovers', query: 'Flight attendant', chips: ['Work Traveler'] },
        { text: 'Someone who works in aviation too', query: 'Pilot', chips: ['Work Traveler'] },
        { text: 'Someone willing to relocate for the right relationship', query: 'Travel', chips: ['Willing to relocate: Yes'] },
      ],
    },
    og: {
      imageAlt: 'A carry-on suitcase by an airport window at sunrise beside the words "Dating for flight attendants" and the Find Your Person logo',
    },
    metaTitle: 'Dating for Flight Attendants | Find Your Person',
    metaDescription: "Your schedule changes every month. Search the whole U.S. by values and lifestyle, not just around your base, and see who's willing to relocate.",
    headline: "Life at 35,000 feet shouldn't keep you from finding your person.",
    subhead: "Most dating apps focus on who's near you right now, which is hard when you're rarely home. Find Your Person lets you search the whole U.S. by values and lifestyle, and see who's willing to relocate.",
    about: {
      heading: 'Find someone who understands life in the air',
      paragraphs: [
        'Reserve days, early report times, and a different city every few nights can make it hard to build something lasting with someone who only lives near your base, and harder still to find someone who understands the lifestyle.',
        "Find Your Person lets you search nationwide for people whose values and relationship goals match yours, including people in aviation, people with their own travel-heavy careers, and people who would consider relocating for the right relationship.",
      ],
    },
    point2Body: 'Search nationwide, not just around your base. Someone who understands an airline schedule might live in another state.',
    who: {
      heading: 'For people whose careers keep them in the air, and the people open to dating them',
      items: [
        'Flight attendants at any airline, from new hires to senior crew',
        'Pilots and other airline crew',
        'People with travel-heavy careers who understand changing schedules',
        'Singles open to dating someone who is often away',
        'People comfortable exploring long-distance relationships',
        'Anyone who cares more about compatibility than sharing the same ZIP code',
      ],
    },
    faqs: [
      {
        q: 'Can I search for other flight attendants or airline crew?',
        a: 'Yes. Search for the words people use in their profiles, like flight attendant, pilot, or airline, and add the Work Traveler category to find people whose careers keep them traveling too.',
      },
      {
        q: 'What if I transfer to a new base?',
        a: "Search covers the whole U.S., so a new base doesn't mean starting over. Every profile also shows whether someone would consider relocating for the right relationship.",
      },
      {
        q: 'Is Find Your Person only for flight attendants?',
        a: 'No. Find Your Person is open to eligible adults throughout the U.S. Flight attendants can search for anyone who shares their values and relationship goals, whether they work in aviation or not.',
      },
    ],
  },
];
