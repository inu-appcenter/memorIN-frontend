import type {
  SignInInput,
  SignUpInput,
} from '@/features/auth/model/authSchema';
import { client, type ApiResponse } from '../../../shared/api/client';

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
    throw new Error(body.error?.message ?? '로그인 실패');
  }

  return body.data;
}

// 토큰 재발급 비동기함수
// 이 엔드포인트(POST /auth/refresh)는 다른 auth API와 달리 ApiResponse 봉투를 안 쓰고
// { accessToken, refreshToken }을 그대로 반환한다. login()처럼 response.data.data로
// 꺼내려 하면 항상 undefined가 된다.
// 주의: 백엔드가 이 엔드포인트를 인증이 필요한 경로로 취급하고 있어(SecurityConfig에
// permitAll로 등록돼 있지 않음), access token이 만료된 뒤에 호출하면 만료된 토큰이
// 그대로 요청에 실려 401로 거부된다. 401 발생 시 자동으로 이 함수를 호출해
// 재시도하는 인터셉터는 이 문제가 백엔드에서 해결되기 전까지는 연결하지 않는다.
export async function refreshAccessToken(
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string }> {
  const response = await client.post<{
    accessToken: string;
    refreshToken: string;
  }>('/auth/refresh', { refreshToken });
  return response.data;
}

// 회원가입 비동기 함수
export async function signup(input: SignUpInput): Promise<void> {
  const { data } = await client.post('/auth/signup', {
    email: input.email,
    password: input.password,
    username: input.username,
    displayName: input.displayName,
    bio: '안녕하세요! 신규 가입자입니다.' /* 백엔드에서 선택 필드로 바꾸는 방향으로 결정. bio(자기소개)는 추후 프로필 설정에서 설정 가능 - 백엔드 코드 반영 이후 해당 코드 삭제 예정*/,
  });
  if (!data.success) throw new Error(data.error?.message ?? '회원가입 실패');
}

// 실연동 시 POST /auth/logout (서버가 쿠키 만료 + 토큰 무효화)
export async function logout(): Promise<void> {
  await client.post('/auth/logout'); // Bearer는 인터셉터가 자동 첨부
}
