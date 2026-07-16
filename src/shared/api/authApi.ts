import type { SignInInput, SignUpInput } from '@/shared/model/authSchema';
import { client, type ApiResponse } from './client';

// 로그인 비동기함수
export async function login(
  input: SignInInput
): Promise<{ accessToken: string }> {
  const res = await client.post<ApiResponse<{ accessToken: string }>>(
    '/auth/login',
    {
      email: input.email,
      password: input.password,
    }
  );
  return res.data.data;
}

// 회원가입 비동기 함수
export async function signup(input: SignUpInput): Promise<void> {
  await client.post('/auth/signup', {
    email: input.email,
    password: input.password,
    username: input.username,
    displayName: input.displayName,
  });
}

// 부트스트랩용: 저장된 세션으로 내 정보 조회 (실연동 시 GET /auth/me)
export async function fetchMe() {
  return null; // /me 엔드포인트 없음 → 부트스트랩은 항상 미인증으로 판정
}

// 실연동 시 POST /auth/logout (서버가 쿠키 만료 + 토큰 무효화)
export async function logout(): Promise<void> {
  await client.post('/auth/logout'); // Bearer는 인터셉터가 자동 첨부
}
