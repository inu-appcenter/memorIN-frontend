import { client, ApiError, type ApiResponse } from '@/shared/api/client';
import i18next from '@/shared/lib/i18n';

export type VisibilityType = 'PUBLIC' | 'FRIENDS' | 'PRIVATE';
export type TimeslotType = 'AM' | 'PM';

export type TagType =
  | 'STUDY'
  | 'GAME'
  | 'ANIMAL'
  | 'TRAVEL'
  | 'EXERCISE'
  | 'FOOD'
  | 'MUSIC'
  | 'DAILY'
  | 'HOBBY'
  | 'ETC';

export type PostSortType = 'LATEST' | 'VIEW_COUNT_DESC' | 'ACCURACY_DESC';
export interface PostMedia {
  objectKey: string;
  url: string | null;
  contentType: string;
  order: number;
  width: number | null;
  height: number | null;
}

export interface PostSummary {
  postId: string;
  authorId: string;
  content: string;
  visibility: VisibilityType;
  timeslot: TimeslotType | null;
  recordedDate: string;
  viewCount: number;
  attachments: PostMedia[];
  // 백엔드 PostSummaryResponse는 요청 필드명(tags)과 달리 tagTypes로 내려준다.
  tagTypes: TagType[];
}

export interface FeedPage {
  items: PostSummary[];
  nextCursor: string | null;
  hasNext: boolean;
}

export interface GetFeedParams {
  cursor?: string;
  size?: number;
  // recorded_date 기준 기간 필터(yyyy-MM-dd, 양쪽 포함). 캘린더 뷰용.
  // 하루만 보려면 from과 to에 같은 날짜를 준다.
  from?: string;
  to?: string;
}

// GET /api/posts — userId를 생략하면 백엔드가 JWT의 인증 사용자를 기준으로
// "내 기록" 피드를 반환한다 (PostService.list 참고). 인증 필요.
export async function getMyFeed(params: GetFeedParams = {}): Promise<FeedPage> {
  const { data } = await client.get<ApiResponse<FeedPage>>('/api/posts', {
    params: {
      cursor: params.cursor,
      size: params.size,
      from: params.from,
      to: params.to,
    },
  });

  if (!data.success || !data.data) {
    throw new ApiError(
      data.error?.code ?? 'UNKNOWN',
      data.error?.message ?? i18next.t('error.feedLoad')
    );
  }

  return data.data;
}

// GET /api/posts/friends — 내가 팔로우한(ACCEPTED) 사용자들의 게시물만 반환.
export async function getFriendFeed(
  params: GetFeedParams = {}
): Promise<FeedPage> {
  const { data } = await client.get<ApiResponse<FeedPage>>(
    '/api/posts/friends',
    { params: { cursor: params.cursor, size: params.size } }
  );

  if (!data.success || !data.data) {
    throw new ApiError(
      data.error?.code ?? 'UNKNOWN',
      data.error?.message ?? i18next.t('error.friendFeedLoad')
    );
  }

  return data.data;
}
// GET /api/posts/recommend — 최근 14일 내 전체공개 게시물을 참여도(댓글 수)와 최신성으로 점수화해 정렬한다.
export async function getRecommendedFeed(
  params: GetFeedParams = {}
): Promise<FeedPage> {
  const { data } = await client.get<ApiResponse<FeedPage>>(
    '/api/posts/recommend',
    { params: { cursor: params.cursor, size: params.size } }
  );

  if (!data.success || !data.data) {
    throw new ApiError(
      data.error?.code ?? 'UNKNOWN',
      data.error?.message ?? i18next.t('error.feedLoad')
    );
  }

  return data.data;
}

// GET /api/posts?userId= — 특정 사용자의 게시물 목록 (다른 사람 프로필 화면용).
// 백엔드가 공개범위(PUBLIC/FRIENDS)를 요청자 기준으로 이미 필터링해서 내려준다.
export async function getUserFeed(
  userId: string,
  params: GetFeedParams = {}
): Promise<FeedPage> {
  const { data } = await client.get<ApiResponse<FeedPage>>('/api/posts', {
    params: { userId, cursor: params.cursor, size: params.size },
  });

  if (!data.success || !data.data) {
    throw new ApiError(
      data.error?.code ?? 'UNKNOWN',
      data.error?.message ?? i18next.t('error.postLoad')
    );
  }

  return data.data;
}

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
  recordedDate?: string;
  attachments?: CreatePostAttachment[];
  // 요청은 tags, 응답(PostSummaryResponse)은 tagTypes로 이름이 다른 상태
  tags?: TagType[];
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
      data.error?.message ?? i18next.t('error.postCreate')
    );
  }

  return data.data;
}

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
// 메뉴·수정·공유는 게시물의 일부 필드만 쓴다
export type PostActionTarget = Pick<
  PostSummary,
  'postId' | 'authorId' | 'content' | 'visibility' | 'timeslot'
>;

export interface UpdatePostParams {
  content?: string;
  visibilityType?: VisibilityType;
  timeslotType?: TimeslotType;
  recordedDate?: string;
  attachments?: CreatePostAttachment[];
}

export interface SearchPostsParams {
  keyword?: string;
  tags?: TagType[];
  timeslot?: TimeslotType;
  sort?: PostSortType;
  cursor?: string;
  size?: number;
}

// GET /api/posts/search — 인증 필요.
//
// 이 엔드포인트만 ApiResponse 봉투 없이 PostListResponse를 그대로 반환한다.
export async function searchPosts(
  params: SearchPostsParams = {}
): Promise<FeedPage> {
  const { data } = await client.get<FeedPage>('/api/posts/search', {
    params: {
      keyword: params.keyword,
      tags: params.tags?.length ? params.tags : undefined,
      timeslot: params.timeslot,
      sort: params.sort,
      cursor: params.cursor,
      size: params.size,
    },
    // axios 기본값은 tags[]=STUDY라 인덱스 표기를 끈다.
    paramsSerializer: { indexes: null },
  });

  return data;
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
      data.error?.message ?? i18next.t('error.postUpdate')
    );
  }

  return data.data;
}

// DELETE /api/posts/{postId} — 인증 필요, 소프트 삭제. 응답 data는 항상 null
export async function deletePost(postId: string): Promise<void> {
  const { data } = await client.delete<ApiResponse<null>>(
    `/api/posts/${postId}`
  );

  if (!data.success) {
    throw new ApiError(
      data.error?.code ?? 'UNKNOWN',
      data.error?.message ?? i18next.t('error.postDelete')
    );
  }
}

// GET /api/posts/{postId} — 인증 필요.
// 작성자 본인이 아니면 서버가 조회수를 1 올림
export async function getPost(postId: string): Promise<PostDetail> {
  const { data } = await client.get<ApiResponse<PostDetail>>(
    `/api/posts/${postId}`
  );

  if (!data.success || !data.data) {
    throw new ApiError(
      data.error?.code ?? 'UNKNOWN',
      data.error?.message ?? i18next.t('error.postLoad')
    );
  }

  return data.data;
}
