// キャッシュにバージョンを付けておくと、古いキャッシュを消す時に便利
var CACHE_STATIC_VERSION = 'static-v1';

// サービスワーカーのインストール
self.addEventListener('install', function(event) {
  console.log('[Service Worker] Installing Service Worker...');

  // キャッシュできるまで次の処理を待つ
  event.waitUntil(
    caches.open(CACHE_STATIC_VERSION)
      .then(function(cache) {
        console.log('[Service Worker] Precaching App...');
        cache.addAll([
          '/',
          '/qdt.js',
        ]);
      })
  );
});