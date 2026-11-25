// First-party, cookie-less website counters (owner-approved 2026-11-24).
//
// Sends ONLY: the event name, the page path, and for store clicks which store
// (apple | play) or for code copies which code. No cookies, no storage, no
// device or visitor id, no referrer, no query string, no third parties. The
// database function (log_web_event) rejects anything else.
//
// Events:  page_view (on load) · store_click (App Store / Google Play badge)
//          code_copy (fired by founding.js via window.fypTrack)
// Report:  my-person repo → `npm run growth -- web`
(function () {
  var URL_ = 'https://orwhyzrlzxpltlyuteii.supabase.co/rest/v1/rpc/log_web_event';
  var KEY = 'sb_publishable_ilPJgpt_roB96iuOYJxz-Q_KcJIDgLw'; // public client key (also in every app install)
  if (!window.fetch) { window.fypTrack = function () {}; return; }

  var page = (location.pathname || '/').toLowerCase().replace(/\.html$/, '').replace(/\/index$/, '/') || '/';

  function track(event, detail) {
    try {
      fetch(URL_, {
        method: 'POST',
        headers: { 'apikey': KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ p_event: event, p_page: page, p_detail: detail || null }),
        credentials: 'omit',
        keepalive: true, // still delivered when the click navigates away
        referrerPolicy: 'no-referrer'
      }).catch(function () {});
    } catch (e) { /* a counter must never break the page */ }
  }
  window.fypTrack = track;

  track('page_view');

  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a.store-badge') : null;
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (href.indexOf('apps.apple.com') !== -1) track('store_click', 'apple');
    else if (href.indexOf('play.google.com') !== -1) track('store_click', 'play');
  }, true);
})();
