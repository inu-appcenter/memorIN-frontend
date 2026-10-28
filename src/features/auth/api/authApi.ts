import type {
  SignInInput,
  SignUpInput,
} from '@/features/auth/model/authSchema';
import { client, type ApiResponse } from '../../../shared/api/client';
import i18next from '@/shared/lib/i18n';
import type { PushDeviceTarget } from '@/features/push';

// 로그인 비동기함수
export async function login(
  input: SignInInput
): Promise<{ accessToken: string; refreshToken: string }> {
  const response = await client.post<
    ApiResponse<{ accessToken: string; refreshToken: string }>
  >('/auth/login', {
    email: input.email,
    password: input.password,
  });

  const body = response.data;

  if (!body.success || !body.data) {
    throw new Error(body.error?.message ?? i18next.t('auth.signInFailed'));
  }

  return body.data;
}
export { refreshAccessToken } from '@/shared/api/client';

// 회원가입 비동기 함수
export async function signup(input: SignUpInput): Promise<void> {
  const { data } = await client.post('/auth/signup', {
    email: input.email,
    password: input.password,
    username: input.username,
    displayName: input.displayName,
  });
  if (!data.success)
    throw new Error(data.error?.message ?? i18next.t('auth.signUpFailed'));
}

// DELETE /auth/logout — 인증 필요. 서버의 refresh_token 행을 삭제하고,
// 본문에 담은 이 기기의 FCM 토큰·Web Push 구독도 함께 지운다.
// 응답은 204라 봉투가 없다.
export async function logout(target: PushDeviceTarget = {}): Promise<void> {
  // Bearer는 인터셉터가 자동 첨부. DELETE 본문은 axios config의 data로 넘긴다.
  await client.delete('/auth/logout', { data: target });
}
