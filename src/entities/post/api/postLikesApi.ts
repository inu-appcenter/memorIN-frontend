import { client, ApiError, type ApiResponse } from '@/shared/api/client';
import i18next from '@/shared/lib/i18n';

export interface PostLike {
  liked: boolean;
  likeCount: number;
}

// GET /api/posts/{postId}/likes — 인증 필요. 접근 권한이 없으면 POST_002.
export async function getPostLike(postId: string): Promise<PostLike> {
  const { data } = await client.get<ApiResponse<PostLike>>(
    `/api/posts/${postId}/likes`
  );

  if (!data.success || !data.data) {
    throw new ApiError(
      data.error?.code ?? 'UNKNOWN',
      data.error?.message ?? i18next.t('error.postLoad')
    );
  }

  return data.data;
}

// POST /api/posts/{postId}/likes — 토글. 이미 눌렀으면 취소된다.
// 응답의 liked가 토글 후 최종 상태이고, 연타는 서버가 멱등 처리한다.
export async function togglePostLike(postId: string): Promise<PostLike> {
  const { data } = await client.post<ApiResponse<PostLike>>(
    `/api/posts/${postId}/likes`
  );

  if (!data.success || !data.data) {
    throw new ApiError(
      data.error?.code ?? 'UNKNOWN',
      data.error?.message ?? i18next.t('error.postLoad')
    );
  }

  return data.data;
}
