const CACHE = 'gunluk-asistan-v12';
const FILES = ['./', 'index.html', 'styles.css', 'app.js', 'phone-alarm.js', 'account.js', 'groups.js', 'firebase-config.js', 'tetris.js', 'manifest.webmanifest', 'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png'];
const TIMEOUT = 3000;
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(FILES.map(f => fetch(f, { cache: 'no-cache' }).then(r => r.ok ? c.put(f, r) : null).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request, u = new URL(req.url);
  if (req.method !== 'GET' || u.origin !== location.origin) return;
  // Ağ önce (HTTP önbelleğini atlayarak); yalnızca başarılı yanıtlar önbelleğe yazılır
  const net = fetch(req, { cache: 'no-cache' }).then(r => {
    const put = r.ok ? caches.open(CACHE).then(c => c.put(req, r.clone())) : Promise.resolve();
    return { r, put };
  });
  e.waitUntil(net.then(o => o.put).catch(() => {}));
  // Ağ 3 sn içinde yanıt vermezse önbellekteki sürüm açılır
  const timer = new Promise(res => setTimeout(res, TIMEOUT, null));
  e.respondWith(
    Promise.race([net.then(o => o.r).catch(() => null), timer])
      .then(r => r || caches.match(req, { ignoreSearch: true }).then(c => c || net.then(o => o.r)))
      .catch(() => caches.match(req.mode === 'navigate' ? 'index.html' : req, { ignoreSearch: true }).then(c => c || caches.match('index.html')).then(c => c || Response.error()))
  );
});

// Chrome TimestampTrigger varsa alarmı tarayıcıya bırakır. Yoksa sayfa kendisi çalar.
async function clearScheduled() {
  const opts = { tag: 'ga-alarm-next' };
  let list = [];
  try { list = await self.registration.getNotifications(Object.assign({ includeTriggered: true }, opts)); }
  catch (e) { try { list = await self.registration.getNotifications(opts); } catch (e2) {} }
  list.forEach(n => n.close());
}
self.addEventListener('message', e => {
  const d = e.data || {};
  if (d.type === 'alarm-cancel') { e.waitUntil(clearScheduled()); return; }
  if (d.type !== 'alarm-schedule' || typeof d.at !== 'number') return;
  e.waitUntil((async () => {
    await clearScheduled();
    if (typeof TimestampTrigger !== 'function') return;
    try {
      await self.registration.showNotification(d.title || 'Vardiya alarmı', {
        body: d.body || '',
        tag: 'ga-alarm-next',
        showTrigger: new TimestampTrigger(d.at)
      });
    } catch (err) {}
  })());
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
    for (const c of cs) if (c.url && 'focus' in c) return c.focus();
    return self.clients.openWindow('./');
  }));
});
