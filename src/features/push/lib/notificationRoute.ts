// 알림 종류별 이동 경로.
//
// public/sw.js에도 같은 매핑이 있다. 서비스워커는 번들러를 안 거쳐서 import를
// 할 수 없기 때문에 어쩔 수 없이 두 곳에 둔다. 바꿀 때 같이 바꿔야 한다.
export function routeOfNotification(type?: string): string {
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
