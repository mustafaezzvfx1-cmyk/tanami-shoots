(function () {
  'use strict';
  var frame = document.getElementById('booking');
  var ALLOWED = /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/(exec|dev)$/;
  var src = frame.getAttribute('data-src');
  var offline = document.getElementById('offline');
  var store = { get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
                set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };

  function ready() { document.body.classList.add('ready'); }
  function load() {
    if (!navigator.onLine) { offline.hidden = false; return; }
    offline.hidden = true;
    if (!ALLOWED.test(src)) return;            // never load anything but the Tanami booking script
    frame.src = src;
  }
  frame.addEventListener('load', function () { if (frame.src) setTimeout(ready, 250); });
  setTimeout(ready, 8000);                       // never stay on the splash forever
  document.getElementById('retry').addEventListener('click', load);
  window.addEventListener('online', function () { if (!frame.src) load(); });
  window.addEventListener('offline', function () { if (!frame.src) offline.hidden = false; });
  load();

  // ── install prompt (only in the browser, not inside the installed app) ──
  var standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  var box = document.getElementById('install');
  var dismissed = Number(store.get('installDismissed') || 0);
  var recently = Date.now() - dismissed < 3 * 24 * 3600 * 1000;
  var ua = navigator.userAgent || '';
  var isIOS = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var deferred = null;

  function show(which) { if (standalone || recently) return; document.getElementById(which).hidden = false; box.hidden = false; }
  document.getElementById('install-x').addEventListener('click', function () { box.hidden = true; store.set('installDismissed', String(Date.now())); });
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault(); deferred = e;
    document.getElementById('install-go').hidden = false; show('install-and');
  });
  document.getElementById('install-go').addEventListener('click', function () {
    if (!deferred) return; deferred.prompt();
    deferred.userChoice.then(function () { deferred = null; box.hidden = true; });
  });
  window.addEventListener('appinstalled', function () { box.hidden = true; });
  if (isIOS) setTimeout(function () { show('install-ios'); }, 2500);

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js', { scope: './' }).catch(function () {}); });
  }
})();
