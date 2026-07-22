import type { PostMedia } from '../api/postsApi';

// presigned URL 발급이 실패한 미디어는 url이 null로 내려옴
export function resolveMediaUrl(media: PostMedia): string | undefined {
  return media.url ?? undefined;
}
