import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';
import { useAuthStore } from '@/entities/session/model/useAuthStore';
import {
  tokenStorage,
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
} from '@/entities/session/lib/tokenStorage';
import i18next from '@/shared/lib/i18n';
// axois 인터셉터, 인스턴스 등을 정의

// 백엔드 API 명세서의 공통 응답 포맷을 따른다
// 성공시
// {
//   "success": true,
//   "data": {},
//   "error": null
// }
// (인증) 실패시
// {
//   "success": false,
//   "data": null,
//   "error": {
//     "code": "AUTH_002",
//     "message": "..."
//   }
// }
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: { code: string; message: string } | null;
}

// 서버 에러를 담는 커스텀 에러 타입 (code로 분기 가능)
export class ApiError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
  }
}

function resolveApiBaseUrl(): string | undefined {
  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (Platform.OS === 'android' && baseUrl) {
    return baseUrl
      .replace('localhost', '10.0.2.2')
      .replace('127.0.0.1', '10.0.2.2');
  }
  return baseUrl;
}

export const client = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: 10000, // 10초
  headers: { 'Content-Type': 'application/json' },
});

// 요청 인터셉터: 모든 요청에 accessToken 자동 첨부
client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken; // React 밖이라 getState()를 사용
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 토큰 재발급 API 호출
export async function refreshAccessToken(
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string }> {
  const response = await axios.post<{
    accessToken: string;
    refreshToken: string;
  }>(`${client.defaults.baseURL ?? ''}/auth/refresh`, { refreshToken });
  return response.data;
}

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// 401 재발급 인터셉터가 개입하지 않는 auth 엔드포인트
// - /auth/login의 401은 아이디/비밀번호 오류(AUTH_002)라 재발급 대상이 아님
// - /auth/refresh의 401은 refresh token 자체가 만료/무효라 재발급을 시도하면 안 됨
const NO_REFRESH_RETRY_PATHS = ['/auth/login', '/auth/refresh'];

// 동시에 여러 요청이 401을 받아도 재발급 요청이 한 번만 나가도록 진행 중인 Promise를 공유
let refreshPromise: Promise<string> | null = null;

async function refreshAndPersistAccessToken(): Promise<string> {
  const currentRefreshToken = await tokenStorage.get(REFRESH_TOKEN_KEY);
  if (!currentRefreshToken) {
    throw new Error(i18next.t('error.noRefreshToken'));
  }

  const { accessToken, refreshToken: newRefreshToken } =
    await refreshAccessToken(currentRefreshToken);

  await Promise.all([
    tokenStorage.set(ACCESS_TOKEN_KEY, accessToken),
    tokenStorage.set(REFRESH_TOKEN_KEY, newRefreshToken),
  ]);
  useAuthStore.getState().setAccessToken(accessToken);

  return accessToken;
}

async function handleSessionExpired(): Promise<void> {
  await Promise.all([
    tokenStorage.remove(ACCESS_TOKEN_KEY),
    tokenStorage.remove(REFRESH_TOKEN_KEY),
  ]);
  useAuthStore.getState().setUnauthenticated(); // (main) 가드가 자동으로 /sign-in으로 보냄
}

// 응답 인터셉터: 서버 에러를 ApiError로 정규화 + 401 시 accessToken 재발급 후 원 요청 재시도
client.interceptors.response.use(
  (response) => response, // 성공은 그대로 통과
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const isNoRetryPath =
      !!originalRequest?.url &&
      NO_REFRESH_RETRY_PATHS.includes(originalRequest.url);

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isNoRetryPath
    ) {
      originalRequest._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = refreshAndPersistAccessToken().finally(() => {
            refreshPromise = null;
          });
        }
        await refreshPromise;
        return client(originalRequest); // 요청 인터셉터가 갱신된 accessToken을 다시 붙여준다
      } catch {
        await handleSessionExpired();
        return Promise.reject(
          new ApiError('AUTH_003', i18next.t('error.sessionExpired'))
        );
      }
    }

    // 실패시 백엔드 반환 형태 { error: { code, message } }
    const serverError = error.response?.data?.error;
    if (serverError) {
      return Promise.reject(
        new ApiError(serverError.code, serverError.message)
      );
    }
    // 네트워크/타임아웃 등 응답 자체가 없는 경우
    return Promise.reject(new ApiError('NETWORK', i18next.t('error.network')));
  }
);

// 로그아웃 api 연동 (예정)
// POST /auth/logout
