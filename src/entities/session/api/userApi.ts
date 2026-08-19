import { client, ApiError, type ApiResponse } from '@/shared/api/client';
import i18next from '@/shared/lib/i18n';

// memorIN-backend MyPageResponseDto 그대로 미러링
export interface MyProfile {
  username: string;
  displayName: string;
  bio: string | null;
}

// GET /api/users/me — 인증 필요. 항상 나의 프로필만 반환
// (타인 프로필 단건 조회 API는 아직 없음 — /search, /followers, /followings만 존재)
export async function getMyProfile(): Promise<MyProfile> {
  const { data } = await client.get<ApiResponse<MyProfile>>('/api/users/me');
  if (!data.success || !data.data) {
    throw new ApiError(
      data.error?.code ?? 'UNKNOWN',
      data.error?.message ?? i18next.t('error.profileLoad')
    );
  }
  return data.data;
}
