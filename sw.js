importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.4.1/workbox-sw.js');

if (workbox) {
  // デバッグ用設定を有効化
  workbox.setConfig({ debug: true });

  // Force production builds
  //workbox.setConfig({ debug: false });

  console.log("Workbox loaded.");
  
  // htmlをキャッシュ登録  
  // workbox.routing.registerRoute(
  //   new RegExp('/'),
  //   workbox.strategies.networkFirst()
  // );
  workbox.routing.registerRoute(
    new RegExp('.*\.html'),
    workbox.strategies.networkFirst()
  );
 
  // jsをキャッシュ登録
  workbox.routing.registerRoute(
    new RegExp('.*\.js'),
    workbox.strategies.networkFirst()
  );

  // cssをキャッシュ登録
  workbox.routing.registerRoute(
    // Cache CSS files
    /.*\.css/,
    // Use cache but update in the background ASAP
    workbox.strategies.staleWhileRevalidate({
      // Use a custom cache name
      cacheName: 'css-cache',
    })
  );

  // アセットファイルをキャッシュ登録
  workbox.routing.registerRoute(
    // Cache image files
    /.*\.(?:png|jpg|mp3|tmss|tmx|ttf)/,

    // Use the cache if it's available
    workbox.strategies.cacheFirst({
      // Use a custom cache name
      cacheName: 'asset-cache',
      plugins: [
        new workbox.expiration.Plugin({
          // Cache only 20 images
          maxEntries: 100,
          // Cache for a maximum of a week
          maxAgeSeconds: 7 * 24 * 60 * 60,
        })
      ],
    })
  );

} else {
  console.log("Workbox didn't load");
}