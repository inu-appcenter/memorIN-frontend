import { client, ApiError, type ApiResponse } from '@/shared/api/client';

// 백엔드 domain/posts DTO를 그대로 미러링한 타입.
// (memorIN-backend PostSummaryResponse / PostListResponse / PostMediaResponse 참고)
export type VisibilityType = 'PUBLIC' | 'FRIENDS' | 'PRIVATE';
export type TimeslotType = 'AM' | 'PM';

export interface PostMedia {
  objectKey: string;
  url: string | null; // presigned 다운로드 URL. 발급 실패 시 null
  contentType: string;
  order: number;
  width: number | null;
  height: number | null;
}

export interface PostSummary {
  postId: string;
  authorId: string;
  content: string; // JSONB 원문 문자열 (블록 배열). 파싱은 화면단 책임.
  visibility: VisibilityType;
  timeslot: TimeslotType | null;
  recordedDate: string; // yyyy-MM-dd
  viewCount: number;
  attachments: PostMedia[];
}

export interface FeedPage {
  items: PostSummary[];
  nextCursor: string | null;
  hasNext: boolean;
}

export interface GetFeedParams {
  cursor?: string;
  size?: number;
}

// GET /api/posts — userId를 생략하면 백엔드가 JWT의 인증 사용자를 기준으로
// "내 기록" 피드를 반환한다 (PostService.list 참고). 인증 필요.
export async function getMyFeed(params: GetFeedParams = {}): Promise<FeedPage> {
  const { data } = await client.get<ApiResponse<FeedPage>>('/api/posts', {
    params: {
      cursor: params.cursor,
      size: params.size,
    },
  });

  if (!data.success || !data.data) {
    throw new ApiError(
      data.error?.code ?? 'UNKNOWN',
      data.error?.message ?? '피드를 불러오지 못했습니다'
    );
  }

  return data.data;
}

// 게시물 생성
export interface CreatePostAttachment {
  fileKey: string;
  mimeType: string;
  fileSizeBytes: number;
  width?: number | null;
  height?: number | null;
}

export interface CreatePostParams {
  content: string;
  visibilityType: VisibilityType;
  timeslotType: TimeslotType;
  recordedDate?: string; // yyyy-MM-dd, 생략하면 백엔드가 오늘 날짜로 채움
  attachments?: CreatePostAttachment[]; // 최대 10개 (백엔드 제약)
}

export interface CreatePostResponse {
  postId: string;
  authorId: string;
  content: string;
  visibility: VisibilityType;
  timeslot: TimeslotType;
  recordedDate: string;
  attachments: PostMedia[];
  createdAt: string;
}

// POST /api/posts — 인증 필요
export async function createPost(
  params: CreatePostParams
): Promise<CreatePostResponse> {
  const { data } = await client.post<ApiResponse<CreatePostResponse>>(
    '/api/posts',
    params
  );

  if (!data.success || !data.data) {
    throw new ApiError(
      data.error?.code ?? 'UNKNOWN',
      data.error?.message ?? '게시물을 작성하지 못했습니다'
    );
  }

  return data.data;
}

// PATCH /api/posts/{postId} 응답 — memorIN-backend PostResponse 미러링.
// CreatePostResponse와 달리 viewCount/updatedAt이 추가로 내려온다.
export interface PostDetail {
  postId: string;
  authorId: string;
  content: string;
  visibility: VisibilityType;
  timeslot: TimeslotType;
  recordedDate: string;
  viewCount: number;
  attachments: PostMedia[];
  createdAt: string;
  updatedAt: string;
}

// PATCH 요청이라 모든 필드는 optional — 보내지 않은 필드는 "변경하지 않음"으로 처리된다
// (attachments를 생략하면 기존 미디어 유지, 배열로 보내면 통째로 교체).
export interface UpdatePostParams {
  content?: string;
  visibilityType?: VisibilityType;
  timeslotType?: TimeslotType;
  recordedDate?: string;
  attachments?: CreatePostAttachment[];
}

// PATCH /api/posts/{postId} — 인증 필요, 작성자만 가능
export async function updatePost(
  postId: string,
  params: UpdatePostParams
): Promise<PostDetail> {
  const { data } = await client.patch<ApiResponse<PostDetail>>(
    `/api/posts/${postId}`,
    params
  );

  if (!data.success || !data.data) {
    throw new ApiError(
      data.error?.code ?? 'UNKNOWN',
      data.error?.message ?? '게시물을 수정하지 못했습니다'
    );
  }

  return data.data;
}

// DELETE /api/posts/{postId} — 인증 필요, 소프트 삭제. 응답 data는 항상 null.
export async function deletePost(postId: string): Promise<void> {
  const { data } = await client.delete<ApiResponse<null>>(
    `/api/posts/${postId}`
  );

  if (!data.success) {
    throw new ApiError(
      data.error?.code ?? 'UNKNOWN',
      data.error?.message ?? '게시물을 삭제하지 못했습니다'
    );
  }
}
