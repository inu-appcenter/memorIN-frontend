import { tokenStorage } from '@/shared/lib/tokenStorage';
import type { AuthUser } from '@/shared/model/useAuthStore';
import type { SignInInput, SignUpInput } from '@/shared/model/authSchema';

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

const MOCK_DELAY = 600;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ─── 전부 mock 구현 ───────────────────────────────────────
// 백엔드 확정 시 각 함수 본문만 실제 fetch로 교체 (시그니처 유지)
// 테스트 계정: fail@test.com → 로그인 실패 / exists@test.com → 가입 실패

export async function login(input: SignInInput): Promise<AuthResponse> {
  await sleep(MOCK_DELAY);
  if (input.email === 'fail@test.com') {
    throw new Error('이메일 또는 비밀번호가 올바르지 않습니다');
  }
  return {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    user: { id: 'u1', email: input.email, nickname: '테스트유저' },
  };
}

export async function signup(input: SignUpInput): Promise<AuthResponse> {
  await sleep(MOCK_DELAY);
  if (input.email === 'exists@test.com') {
    throw new Error('이미 가입된 이메일입니다');
  }
  return {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    user: { id: 'u2', email: input.email, nickname: input.nickname },
  };
}

// 부트스트랩용: 저장된 세션으로 내 정보 조회 (실연동 시 GET /auth/me)
export async function fetchMe(): Promise<AuthUser | null> {
  await sleep(300);
  const refreshToken = await tokenStorage.get('refreshToken');
  if (!refreshToken) return null;
  return { id: 'u1', email: 'saved@test.com', nickname: '저장된유저' };
}

// 실연동 시 POST /auth/logout (서버가 쿠키 만료 + 토큰 무효화)
export async function logout(): Promise<void> {
  await sleep(300);
}
