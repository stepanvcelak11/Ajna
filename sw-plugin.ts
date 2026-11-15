import type { Plugin } from 'vite';
import { createHash } from 'node:crypto';

/**
 * Generates dist/sw.js at build time with the full list of built files,
 * so the whole app is precached on the first visit and works offline.
 */
export function offlineServiceWorker(): Plugin {
  return {
    name: 'ajna-offline-sw',
    apply: 'build',
    generateBundle(_opts, bundle) {
      const files = Object.keys(bundle).filter((f) => !f.endsWith('.map'));
      const precache = ['./', ...files.map((f) => `./${f}`), './manifest.webmanifest', './icon.svg'];
      const version = createHash('sha1').update(files.sort().join('|')).digest('hex').slice(0, 10);
      this.emitFile({ type: 'asset', fileName: 'sw.js', source: swSource(version, precache) });
    },
  };
}

function swSource(version: string, precache: string[]) {
  return `// Generated at build time. Do not edit.
const CACHE = 'ajna-${version}';
const PRECACHE = ${JSON.stringify([...new Set(precache)], null, 2)};

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('ajna-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  // Only same-origin GETs. AI API calls (other origins) are never touched.
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;

  // Pages: network first (to get updates), fall back to the cached app shell offline.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put('./', copy)); return res; })
        .catch(() => caches.match('./', { ignoreSearch: true }))
    );
    return;
  }

  // Hashed assets & icons: cache first.
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then((hit) =>
      hit || fetch(req).then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
        return res;
      })
    )
  );
});
`;
}
