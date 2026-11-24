// /founding — copy-to-clipboard + live availability.
//
// Availability comes from the app's own counter (Supabase RPC founding_spots,
// the same call the app makes; the publishable key below is the public client
// key every app install already carries). No cookies, no analytics, no
// tracking: one anonymous POST that returns { enabled, capacity, filled,
// remaining, rule }.
//
// States:
//   open    — default markup, also kept if the check fails or times out
//             ("while spots remain" stays visible; owner decision 2026-11-24)
//   closed  — only when the counter says the program is off or full: the code
//             is hidden so the page never advertises an unavailable offer
(function () {
  var SUPABASE_URL = 'https://orwhyzrlzxpltlyuteii.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_ilPJgpt_roB96iuOYJxz-Q_KcJIDgLw';

  // ── Copy ────────────────────────────────────────────────────────────────
  var btn = document.getElementById('copy-code');
  var status = document.getElementById('copy-status');
  function done(msg) {
    if (status) status.textContent = msg;
    if (btn) btn.textContent = 'Copied!';
    setTimeout(function () { if (btn) btn.textContent = 'Copy code'; }, 2500);
  }
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
  if (btn) {
    btn.addEventListener('click', function () {
      var code = btn.getAttribute('data-code');
      var copiedMsg = 'Copied. Paste it in the app when your profile is complete.';
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(code).then(function () { done(copiedMsg); }, function () {
          done(fallbackCopy(code) ? copiedMsg : 'Press and hold the code to copy it.');
        });
      } else {
        done(fallbackCopy(code) ? copiedMsg : 'Press and hold the code to copy it.');
      }
    });
  }

  // ── Availability ────────────────────────────────────────────────────────
  if (SUPABASE_URL.indexOf('__') === 0 || !window.fetch) return;
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
    var closed = d.enabled === false || d.remaining <= 0;
    if (closed) {
      document.getElementById('founding-open').hidden = true;
      document.getElementById('founding-closed').hidden = false;
      document.getElementById('benefits-heading').textContent = 'What our Founding Members received';
      document.getElementById('founding-title').textContent = 'Founding Membership is full';
      document.getElementById('no-code-note').hidden = true;
      document.title = 'Founding Membership is full — Find Your Person';
    }
  }).catch(function () { clearTimeout(timer); });
})();
