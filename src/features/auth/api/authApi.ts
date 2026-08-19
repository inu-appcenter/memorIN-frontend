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

// 실연동 시 POST /auth/logout (서버가 쿠키 만료 + 토큰 무효화)
export async function logout(): Promise<void> {
  await client.post('/auth/logout'); // Bearer는 인터셉터가 자동 첨부
}
