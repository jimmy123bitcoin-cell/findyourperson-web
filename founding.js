// Shared Founding Member offer behaviour — used by /founding AND every
// audience landing page (one copy of the logic, so pages can't drift).
//
// Markup contract (data attributes, any number per page):
//   [data-copy-code="CODE"]   button that copies CODE; shows feedback in the
//                             nearest [data-copy-status] inside the same
//                             [data-offer] (or the page's only one)
//   [data-founding-open]      shown while spots remain (DEFAULT — also kept if
//                             the availability check fails or times out)
//   [data-founding-closed]    shown instead once the program is full or off
//   [data-closed-text="…"]    element whose text is replaced when closed
//   <body data-closed-title="…">  document.title when closed
//
// Availability comes from the app's own counter (Supabase RPC founding_spots,
// the same call the app makes, with the public client key every install
// carries). No cookies, no tracking: one anonymous POST returning
// { enabled, capacity, filled, remaining, rule }.
(function () {
  var SUPABASE_URL = 'https://orwhyzrlzxpltlyuteii.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_ilPJgpt_roB96iuOYJxz-Q_KcJIDgLw';
  var each = function (sel, fn) { Array.prototype.forEach.call(document.querySelectorAll(sel), fn); };

  // ── Copy ────────────────────────────────────────────────────────────────
  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'absolute';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }
  each('[data-copy-code]', function (btn) {
    var label = btn.textContent;
    var scope = btn.closest('[data-offer]') || document;
    var status = scope.querySelector('[data-copy-status]');
    function done(msg, copied) {
      if (status) status.textContent = msg;
      if (copied) {
        btn.textContent = 'Copied!';
        setTimeout(function () { btn.textContent = label; }, 2500);
        if (window.fypTrack) window.fypTrack('code_copy', btn.getAttribute('data-copy-code'));
      }
    }
    btn.addEventListener('click', function () {
      var code = btn.getAttribute('data-copy-code');
      var okMsg = 'Copied. Paste it in the app when your profile is complete.';
      var failMsg = 'Press and hold the code to copy it.';
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(code).then(function () { done(okMsg, true); }, function () {
          var ok = fallbackCopy(code); done(ok ? okMsg : failMsg, ok);
        });
      } else {
        var ok = fallbackCopy(code); done(ok ? okMsg : failMsg, ok);
      }
    });
  });

  // ── Availability ────────────────────────────────────────────────────────
  if (!document.querySelector('[data-founding-open]') || !window.fetch) return;
  var controller = window.AbortController ? new AbortController() : null;
  var timer = setTimeout(function () { if (controller) controller.abort(); }, 6000);
  fetch(SUPABASE_URL + '/rest/v1/rpc/founding_spots', {
    method: 'POST',
    headers: { 'apikey': SUPABASE_KEY, 'Content-Type': 'application/json' },
    body: '{}',
    credentials: 'omit',
    signal: controller ? controller.signal : undefined
  }).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
    clearTimeout(timer);
    if (!d || typeof d.remaining !== 'number') return; // unknown → stay open
    if (!(d.enabled === false || d.remaining <= 0)) return;
    each('[data-founding-open]', function (el) { el.hidden = true; });
    each('[data-founding-closed]', function (el) { el.hidden = false; });
    each('[data-closed-text]', function (el) { el.textContent = el.getAttribute('data-closed-text'); });
    var t = document.body.getAttribute('data-closed-title');
    if (t) document.title = t;
  }).catch(function () { clearTimeout(timer); });
})();
