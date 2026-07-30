import { client, ApiError, type ApiResponse } from '@/shared/api/client';

// memorIN-backend PostCommentResponse / PostCommentCreateRequest 그대로 미러링
export interface PostComment {
  commentId: string;
  authorId: string | null; // 삭제된 댓글이면 null
  body: string; // 삭제된 댓글이면 "삭제된 댓글입니다." placeholder
  deleted: boolean;
  parentId: string | null; // 답글이면 부모 댓글 id, 최상위면 null
  createdAt: string;
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
      data.error?.message ?? '댓글을 불러오지 못했습니다'
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
      data.error?.message ?? '댓글을 작성하지 못했습니다'
    );
  }
  return data.data;
}