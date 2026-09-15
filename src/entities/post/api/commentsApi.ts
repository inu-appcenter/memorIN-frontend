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

export interface CommentPage {
  items: PostComment[];
  nextCursor: string | null;
  hasNext: boolean;
}

export interface GetCommentThreadParams {
  cursor?: string;
  size?: number;
}

export interface CreateCommentParams {
  body: string;
  parentId?: string;
}

// GET /api/posts/{postId}/comments
//
// 페이징 단위는 최상위 댓글이다. 한 페이지에 실린 최상위 댓글의 대댓글은 개수와
// 무관하게 전부 같이 오므로 items.length가 size보다 클 수 있다. 다음 페이지 판단은
// items.length가 아니라 hasNext로 하고, nextCursor는 마지막 최상위 댓글의 id다.
export async function getCommentThread(
  postId: string,
  params: GetCommentThreadParams = {}
): Promise<CommentPage> {
  const { data } = await client.get<ApiResponse<CommentPage>>(
    `/api/posts/${postId}/comments`,
    { params: { cursor: params.cursor, size: params.size } }
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

// PATCH /api/comments/{commentId} — 작성자 본인만 가능
export async function updateComment(
  commentId: string,
  body: string
): Promise<PostComment> {
  const { data } = await client.patch<ApiResponse<PostComment>>(
    `/api/comments/${commentId}`,
    { body }
  );
  if (!data.success || !data.data) {
    throw new ApiError(
      data.error?.code ?? 'UNKNOWN',
      data.error?.message ?? i18next.t('error.commentUpdate')
    );
  }
  return data.data;
}

// DELETE /api/comments/{commentId} — 작성자 본인만 가능
export async function deleteComment(commentId: string): Promise<void> {
  const { data } = await client.delete<ApiResponse<null>>(
    `/api/comments/${commentId}`
  );
  if (!data.success) {
    throw new ApiError(
      data.error?.code ?? 'UNKNOWN',
      data.error?.message ?? i18next.t('error.commentDelete')
    );
  }
}
