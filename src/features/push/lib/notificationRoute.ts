// 알림 종류별 이동 경로.
//
// public/sw.js와 NotificationsPage에도 같은 매핑이 있다. 서비스워커는 번들러를
// 안 거쳐서 import를 할 수 없기 때문에 어쩔 수 없이 따로 둔다. 바꿀 때 같이
// 바꿔야 한다.
//
// 푸시 페이로드의 type은 문자열이라 모르는 값이 올 수 있어 default를 둔다.
export function routeOfNotification(
  type?: string,
  referenceId?: string
): string {
  switch (type) {
    case 'FOLLOW_REQUEST':
    case 'FOLLOW_ACCEPTED':
      return '/social';
    // MESSAGE의 referenceId는 roomId다.
    case 'MESSAGE':
      return referenceId ? `/chat/${referenceId}` : '/chat';
    // LIKE의 referenceId는 postId다.
    case 'LIKE':
      return referenceId ? `/post/${referenceId}` : '/feed';
    // COMMENT의 referenceId는 댓글 id라 게시물을 열 수 없다. 백엔드가 postId를
    // 주기 전까지 알림 목록으로 보낸다.
    case 'COMMENT':
      return '/notifications';
    default:
      return '/feed';
  }
}
