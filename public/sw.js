/* memorIN Web Push Service Worker
 *
 * 번들러를 안 거치는 순수 JS.
 *
 * 백엔드 WebPushService가 보내는 페이로드:
 *   { title, body, type, referenceId, actorId }
 *   type = FOLLOW_REQUEST | FOLLOW_ACCEPTED | COMMENT | LIKE
 */

const TAG_PREFIX = 'memorin-';

self.addEventListener('install', () => {
  // 새 SW를 대기 상태에서 바로 빼낸다. 이게 없으면 열려 있는 탭이 전부 닫힐 때까지 예전 SW가 계속 푸시를 처리해서, 고친 내용이 반영되지 않는다.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

function parsePayload(event) {
  if (!event.data) return {};
  try {
    return event.data.json();
  } catch {
    // DevTools나 curl로 평문을 직접 쏴본 경우에도 뜨게 해둔다.
    return { title: 'memorIN', body: event.data.text() };
  }
}

// src/features/push/lib/notificationRoute.ts에 같은 매핑이 있다.
// 서비스워커는 번들러를 안 거쳐서 import가 안 된다. 바꿀 때 같이 바꾼다.
function routeOf(type) {
  switch (type) {
    case 'FOLLOW_REQUEST':
    case 'FOLLOW_ACCEPTED':
      return '/social';
    // 게시물 상세는 아직 단독 라우트가 아니라 피드 위에 뜨는 모달이다.
    // 알림 화면이 붙으면 '/notifications'로 바꾼다.
    case 'COMMENT':
    case 'LIKE':
    default:
      return '/feed';
  }
}

self.addEventListener('push', (event) => {
  const payload = parsePayload(event);

  event.waitUntil(
    self.registration.showNotification(payload.title || 'memorIN', {
      body: payload.body || '',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      // 같은 종류가 여러 개 쌓이지 않게 묶는다. renotify는 tag가 있어야 동작한다.
      tag: TAG_PREFIX + (payload.type || 'general'),
      renotify: true,
      data: { url: routeOf(payload.type) },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl =
    (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // 이미 열려 있는 탭이 있으면 새 창을 띄우지 않고 그쪽을 재활용한다.
        for (const client of clientList) {
          if ('focus' in client) {
            client.focus();
            if ('navigate' in client) client.navigate(targetUrl);
            return undefined;
          }
        }
        return self.clients.openWindow
          ? self.clients.openWindow(targetUrl)
          : undefined;
      })
  );
});
