import { client, ApiError, type ApiResponse } from '@/shared/api/client';
import i18next from '@/shared/lib/i18n';

// 백엔드 domain/users, domain/follows DTO를 그대로 미러링한 타입.
// (memorIN-backend develop 브랜치 UserSearchResponse / UserSearchPageResponse /
// UserFollowResponse / UserFollowPageResponse / UserFollowRequestResponse 참고)

export interface UserSearchResult {
  id: string;
  username: string;
  displayName: string;
  bio: string | null;
}

export interface UserFollowSummary {
  id: string;
  username: string;
  displayName: string;
  profileImageKey: string | null;
}

export interface UserFollowPage {
  items: UserFollowSummary[];
  nextCursor: string | null;
  hasNext: boolean;
}

// 백엔드 응답 자체의 페이지 래퍼 모양 (검색 결과 아이템 타입만 다르고 구조는 동일)
interface CursorPage<T> {
  items: T[];
  nextCursor: string | null;
  hasNext: boolean;
}

export interface GetPageParams {
  cursor?: string;
  size?: number;
}

// GET /api/users/search?keyword=&cursor=&size= — 인증 불필요, 커서 페이지네이션.
// 부분일치(LIKE) 검색 지원. 응답이 배열이 아니라 {items, nextCursor, hasNext} 페이지
// 객체로 온다 — 배열로 잘못 가정하면 UI에서 아무것도 안 뜨는 원인이 된다(실제로 겪은 버그).
export async function searchUsers(
  keyword: string,
  params: GetPageParams = {}
): Promise<CursorPage<UserSearchResult>> {
  const { data } = await client.get<ApiResponse<CursorPage<UserSearchResult>>>(
    '/api/users/search',
    { params: { keyword, ...params } }
  );

  if (!data.success || !data.data) {
    throw new ApiError(
      data.error?.code ?? 'UNKNOWN',
      data.error?.message ?? i18next.t('error.profileLoad')
    );
  }

  return data.data;
}

// GET /api/users/{userId}/followers — ACCEPTED 상태만 반환. 인증 불필요(공개 목록).
export async function getFollowers(
  userId: string,
  params: GetPageParams = {}
): Promise<UserFollowPage> {
  const { data } = await client.get<ApiResponse<UserFollowPage>>(
    `/api/users/${userId}/followers`,
    { params }
  );

  if (!data.success || !data.data) {
    throw new ApiError(
      data.error?.code ?? 'UNKNOWN',
      data.error?.message ?? i18next.t('error.followersLoad')
    );
  }

  return data.data;
}

// GET /api/users/{userId}/followings — ACCEPTED 상태만 반환. 인증 불필요(공개 목록).
export async function getFollowings(
  userId: string,
  params: GetPageParams = {}
): Promise<UserFollowPage> {
  const { data } = await client.get<ApiResponse<UserFollowPage>>(
    `/api/users/${userId}/followings`,
    { params }
  );

  if (!data.success || !data.data) {
    throw new ApiError(
      data.error?.code ?? 'UNKNOWN',
      data.error?.message ?? i18next.t('error.followingsLoad')
    );
  }

  return data.data;
}

export interface FollowRequestItem {
  followId: string; // accept 호출 시 필요한 관계 행 id
  userId: string;
  username: string;
  displayName: string;
  bio: string | null;
}

// GET /api/follows/requests — 인증 필요. 내가 받은 PENDING 요청 목록(페이지네이션 없음, 배열 그대로).
export async function getFollowRequests(): Promise<FollowRequestItem[]> {
  const { data } = await client.get<ApiResponse<FollowRequestItem[]>>(
    '/api/follows/requests'
  );

  if (!data.success || !data.data) {
    throw new ApiError(
      data.error?.code ?? 'UNKNOWN',
      data.error?.message ?? i18next.t('error.followRequestsLoad')
    );
  }

  return data.data;
}

// POST /api/follows — 인증 필요. 항상 PENDING 상태로 생성된다(상대가 수락하기 전까지
// getFollowers/getFollowings 어느 목록에도 나타나지 않는다).
export async function requestFollow(followingId: string): Promise<void> {
  const { data } = await client.post<ApiResponse<null>>('/api/follows', {
    followingId,
  });

  if (!data.success) {
    throw new ApiError(
      data.error?.code ?? 'UNKNOWN',
      data.error?.message ?? i18next.t('error.followRequest')
    );
  }
}

// PATCH /api/follows/{followId}/accept — 인증 필요, 요청을 받은(following) 쪽만 가능.
// followId는 유저 id가 아니라 관계(Follows) 행의 id — 받은 요청 목록 응답에서 내려받아야 한다.
export async function acceptFollow(followId: string): Promise<void> {
  const { data } = await client.patch<ApiResponse<null>>(
    `/api/follows/${followId}/accept`
  );

  if (!data.success) {
    throw new ApiError(
      data.error?.code ?? 'UNKNOWN',
      data.error?.message ?? i18next.t('error.followAccept')
    );
  }
}

export interface UserPublicProfile {
  userId: string;
  username: string;
  displayName: string;
  profileImage: string | null;
  bio: string | null;
}

// GET /api/users/{userId} — 인증 필요. 다른 사용자의 공개 프로필 조회.
export async function getPublicProfile(
  userId: string
): Promise<UserPublicProfile> {
  const { data } = await client.get<ApiResponse<UserPublicProfile>>(
    `/api/users/${userId}`
  );

  if (!data.success || !data.data) {
    throw new ApiError(
      data.error?.code ?? 'UNKNOWN',
      data.error?.message ?? i18next.t('error.profileLoad')
    );
  }

  return data.data;
}

// DELETE /api/follows/{followingId} — 인증 필요.
// "내가(follower) 상대(followingId)를 팔로우한 관계"를 지운다.
export async function unfollow(followingId: string): Promise<void> {
  const { data } = await client.delete<ApiResponse<null>>(
    `/api/follows/${followingId}`
  );

  if (!data.success) {
    throw new ApiError(
      data.error?.code ?? 'UNKNOWN',
      data.error?.message ?? i18next.t('error.unfollow')
    );
  }
}

// DELETE /api/follows/requests/{followId} — 인증 필요, 요청을 받은(following) 쪽만 가능.
export async function rejectFollowRequest(followId: string): Promise<void> {
  const { data } = await client.delete<ApiResponse<null>>(
    `/api/follows/requests/${followId}`
  );

  if (!data.success) {
    throw new ApiError(
      data.error?.code ?? 'UNKNOWN',
      data.error?.message ?? i18next.t('error.followReject')
    );
  }
}
