/* 莫等闲 service worker
 * 策略：
 *  - 页面导航：有缓存就立刻给缓存（秒开、不白屏），同时后台拉新版刷新缓存。
 *  - 其它同源静态资源：先用缓存，同时后台更新。
 *  - 安装时逐个资源缓存，任何一个 404 都不会让整个安装失败。
 * 改版时把下面的 CACHE 版本号 +1 即可让所有设备换新版。
 */
var CACHE = 'mdx-v7';

var ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      // 其它文件坏一个不算事；但 index.html 必须拿到，否则宁可不升级，
      // 这样联网不稳时老的缓存还能继续用，不会把离线能力弄丢。
      return Promise.all(ASSETS.map(function (url) {
        return c.add(url).catch(function () { return null; });
      })).then(function () {
        return c.match('./index.html');
      }).then(function (page) {
        if (!page) throw new Error('index.html 没缓存到，暂不升级');
        return self.skipWaiting();
      });
    })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        return k === CACHE ? null : caches.delete(k);
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

function offlinePage() {
  return new Response(
    '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>莫等闲</title>' +
    '<body style="font-family:system-ui;padding:48px 24px;color:#2c2a27;background:#faf7f2">' +
    '<p>现在没有网络，页面还没缓存好。联网后再打开一次即可。</p>',
    { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}

function cachePut(request, response) {
  try {
    if (!response) return;
    caches.open(CACHE).then(function (c) { c.put(request, response); }).catch(function () {});
  } catch (e) {}
}

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;

  var url;
  try { url = new URL(req.url); } catch (err) { return; }
  if (url.origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    var network = fetch(req).then(function (res) {
      if (res && res.status === 200 && res.type === 'basic') {
        cachePut('./index.html', res.clone());
      }
      return res;
    }).catch(function () { return null; });

    var cached = caches.match('./index.html').then(function (r) {
      return r || caches.match('./');
    });

    e.respondWith(
      cached.then(function (r) {
        if (r) {
          // 有缓存：立刻返回，网络结果留给后台（不给用户干等）
          e.waitUntil(network.then(function () {}).catch(function () {}));
          return r;
        }
        return network.then(function (n) { return n || offlinePage(); });
      }).catch(function () {
        return network.then(function (n) { return n || offlinePage(); });
      })
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(function (cached) {
      var network = fetch(req).then(function (res) {
        if (res && res.status === 200 && res.type === 'basic') {
          cachePut(req, res.clone());
        }
        return res;
      }).catch(function () { return cached; });
      return cached || network;
    })
  );
});
