// MGWG 최소 서비스워커: 앱 설치 조건 충족 + 앱 껍데기 캐시(네트워크 우선이라 업데이트는 항상 최신)
const CACHE = 'mgwg-shell-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim())
));

self.addEventListener('fetch', e => {
  const req = e.request;
  // 같은 출처의 GET만 처리 → 구글 API(데이터 통신)·CDN은 건드리지 않음
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy));
      return res;
    }).catch(() => caches.match(req))
  );
});
