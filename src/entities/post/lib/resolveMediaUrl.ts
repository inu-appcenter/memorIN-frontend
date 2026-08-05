import type { PostMedia } from '../api/postsApi';

// presigned URL 발급이 실패한 미디어는 url이 null로 내려옴
// 안드로이드 에뮬레이터 환경에서는 adb reverse tcp:9000 tcp:9000으로 네트워크 경로만 우회
export function resolveMediaUrl(media: PostMedia): string | undefined {
  return media.url ?? undefined;
}
