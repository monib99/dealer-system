/* Car Express / Jack Bygraves — service worker.
   This is what lets a reminder reach the phone when the app is shut.
   It must sit at the top level of the site, next to index.html.        */
const SW_VERSION = 'v1';

self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('push', event => {
  let d = {};
  try { d = event.data ? event.data.json() : {}; } catch (e) {
    d = { title: 'Reminder', body: event.data ? event.data.text() : '' };
  }
  const title = d.title || 'Reminder';
  const opts = {
    body: d.body || '',
    icon: d.icon || './icon-192.png',
    badge: './icon-192.png',
    tag: d.tag || title,
    renotify: true,
    requireInteraction: !!d.sticky,
    data: { url: d.url || './', tag: d.tag || '' }
  };
  event.waitUntil(self.registration.showNotification(title, opts));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || './';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) {
        if ('focus' in c) { c.navigate(url); return c.focus(); }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

/* A subscription can be rotated by the browser. Tell the page to re-save it. */
self.addEventListener('pushsubscriptionchange', event => {
  event.waitUntil(
    clients.matchAll({ includeUncontrolled: true }).then(list => {
      list.forEach(c => c.postMessage({ type: 'resubscribe' }));
    })
  );
});
