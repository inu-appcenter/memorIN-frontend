import type {
  SignInInput,
  SignUpInput,
} from '@/features/auth/model/authSchema';
import { client, type ApiResponse } from '../../../shared/api/client';
import i18next from '@/shared/lib/i18n';

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

// DELETE /auth/logout — 인증 필요. 서버의 refresh_token 행을 삭제한다.
// refresh 토큰이 사용자당 하나라 로그아웃하면 다른 기기의 세션도 끝난다. 본문을
// 보내지 않으면 백엔드가 그 사용자의 모든 기기 푸시 등록을 함께 지워, 세션이
// 끝난 기기로 알림이 계속 가는 일이 없다. 응답은 204라 봉투가 없다.
export async function logout(): Promise<void> {
  // Bearer는 인터셉터가 자동 첨부.
  await client.delete('/auth/logout');
}
