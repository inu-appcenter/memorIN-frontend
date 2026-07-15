import { create } from 'zustand';

// 인증 세션 상태 — client.ts(shared/api) 등 shared 레이어에서도 참조하므로 shared/model에 위치
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthUser {
  id: string;
  email: string;
  nickname: string;
}

interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  accessToken: string | null;
  setAuthenticated: (accessToken: string, user: AuthUser) => void;
  setUnauthenticated: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'loading', // 앱 시작 시 부트스트랩(fetchMe) 판정 전까지 loading
  user: null,
  accessToken: null,
  setAuthenticated: (accessToken, user) =>
    set({ status: 'authenticated', accessToken, user }),
  setUnauthenticated: () =>
    set({ status: 'unauthenticated', accessToken: null, user: null }),
}));

export const useAuthStatus = () => {
  const authStatus = useAuthStore((store) => store.status);
  return authStatus;
};

export const useSetAuthenticated = () => {
  const setAuthenticated = useAuthStore((store) => store.setAuthenticated);
  return setAuthenticated;
};

export const useSetUnauthenticated = () => {
  const setUnauthenticated = useAuthStore((store) => store.setUnauthenticated);
  return setUnauthenticated;
};
