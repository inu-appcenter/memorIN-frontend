import { client, ApiError, type ApiResponse } from '@/shared/api/client';
import type { EmojiSummary } from '@/entities/reaction';
import i18next from '@/shared/lib/i18n';

// memorIN-backend PostCommentResponse / PostCommentCreateRequest 그대로 미러링
export interface PostComment {
  commentId: string;
  authorId: string | null; // 삭제된 댓글이면 null
  authorUsername: string | null; // 삭제된 댓글이면 null
  authorDisplayName: string | null; // 삭제된 댓글이면 null
  authorProfileImageKey: string | null; // MinIO 키 원본
  body: string; // 삭제된 댓글이면 "삭제된 댓글입니다." placeholder
  deleted: boolean;
  parentId: string | null; // 답글이면 부모 댓글 id, 최상위면 null
  createdAt: string;
  emojis: EmojiSummary[]; // 이 댓글에 달린 이모지 집계. 없으면 빈 배열
}

export interface CreateCommentParams {
  body: string;
  parentId?: string;
}

export async function getCommentThread(postId: string): Promise<PostComment[]> {
  const { data } = await client.get<ApiResponse<PostComment[]>>(
    `/api/posts/${postId}/comments`
  );
  if (!data.success || !data.data) {
    throw new ApiError(
      data.error?.code ?? 'UNKNOWN',
      data.error?.message ?? i18next.t('error.commentsLoad')
    );
  }
  return data.data;
}

export async function createComment(
  postId: string,
  params: CreateCommentParams
): Promise<PostComment> {
  const { data } = await client.post<ApiResponse<PostComment>>(
    `/api/posts/${postId}/comments`,
    params
  );
  if (!data.success || !data.data) {
    throw new ApiError(
      data.error?.code ?? 'UNKNOWN',
      data.error?.message ?? i18next.t('error.commentCreate')
    );
  }
  return data.data;
}
