import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';
import { useAuthStore } from '@/entities/session/model/useAuthStore';
import {
  tokenStorage,
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
} from '@/entities/session/lib/tokenStorage';
import i18next from '@/shared/lib/i18n';
import { isOffline } from '@/shared/lib/networkStatus';
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

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// API 경로에 넣는 ID는 반드시 이 함수를 거친다. ID는 대부분 라우트 파라미터에서
// 오는데, expo-router가 `%2F`를 `/`로 디코딩하므로 `..%2Fposts%2F<id>` 같은 링크가
// 그대로 경로에 들어가면 사용자 토큰을 단 채 다른 API를 호출하게 된다.
// 백엔드 경로 변수는 모두 UUID라 형식이 다르면 요청을 보내지 않는다.
export function pathId(id: string): string {
  if (!UUID_PATTERN.test(id)) {
    throw new ApiError('INVALID_ID', i18next.t('error.invalidId'));
  }
  return id;
}

export function resolveApiBaseUrl(): string | undefined {
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
// client가 아니라 순수 axios를 쓰는 이유: 재발급 요청까지 응답 인터셉터를 타면
// 401이 났을 때 재발급이 자기 자신을 다시 부르는 무한 루프가 된다.
export async function refreshAccessToken(
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string }> {
  const response = await axios.post<
    ApiResponse<{ accessToken: string; refreshToken: string }>
  >(`${client.defaults.baseURL ?? ''}/auth/refresh`, { refreshToken });

  const body = response.data;

  if (!body.success || !body.data) {
    throw new ApiError(
      body.error?.code ?? 'AUTH_003',
      body.error?.message ?? i18next.t('error.sessionExpired')
    );
  }

  return body.data;
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

// 인터셉터 밖(WebSocket 연결 등)에서도 같은 큐를 타도록 export한다.
// 백엔드의 refresh_token은 유저당 한 행이고 재발급마다 회전하므로, 각자 따로 부르면 서로의 토큰을 무효화해 AUTH_003("다시 로그인하여 주세요")이 난다.
export function ensureFreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = refreshAndPersistAccessToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

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
        await ensureFreshAccessToken();
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
    return Promise.reject(await toEnvelopeLessError(error));
  }
);

// 서버 오류 봉투가 없는 실패. nginx·Spring CORS 필터처럼 백엔드 컨트롤러에 닿기 전에
// 끝난 응답이거나, 응답 자체가 없는 경우다.
async function toEnvelopeLessError(error: AxiosError): Promise<ApiError> {
  if (error.code === AxiosError.ERR_CANCELED) {
    return new ApiError('CANCELED', i18next.t('error.canceled'));
  }
  if (
    error.code === AxiosError.ECONNABORTED ||
    error.code === AxiosError.ETIMEDOUT
  ) {
    return new ApiError('TIMEOUT', i18next.t('error.timeout'));
  }

  const status = error.response?.status;
  if (status !== undefined) {
    switch (status) {
      // 백엔드의 일반 403은 RestAccessDeniedHandler가 봉투를 붙인다. 봉투 없는 403은
      // Origin이 CORS_ALLOWED_ORIGINS에 없을 때 Spring CORS 필터가 내는
      // "Invalid CORS request"다. 운영은 웹과 API가 같은 도메인이라 브라우저가 이
      // 응답을 그대로 넘겨 주므로 여기서 구분할 수 있다.
      case 403:
        if (__DEV__) {
          console.warn(
            `[api] 403 without an error envelope (likely "Invalid CORS request"). ` +
              `Check that backend CORS_ALLOWED_ORIGINS includes ${currentOrigin()}.`
          );
        }
        return new ApiError('CORS_REJECTED', i18next.t('error.corsRejected'));
      case 413:
        return new ApiError(
          'PAYLOAD_TOO_LARGE',
          i18next.t('error.payloadTooLarge')
        );
      case 429:
        return new ApiError(
          'TOO_MANY_REQUESTS',
          i18next.t('error.tooManyRequests')
        );
      case 502:
      case 503:
      case 504:
        return new ApiError(
          'SERVER_UNAVAILABLE',
          i18next.t('error.serverUnavailable')
        );
      default:
        return new ApiError(
          'HTTP_ERROR',
          i18next.t('error.httpStatus', { status })
        );
    }
  }

  if (await isOffline()) {
    return new ApiError('OFFLINE', i18next.t('error.offline'));
  }
  // 로컬 개발은 웹(:8081)과 API(:8080)의 출처가 달라, CORS 거부도 브라우저가 응답을
  // 막아 여기로 온다. 서버가 꺼진 것과 구분할 수 없으므로 개발 모드 안내만 남긴다.
  if (__DEV__) {
    console.warn(
      `[api] No response from ${client.defaults.baseURL || currentOrigin()}. ` +
        `Check that the backend is running and the API base URL is correct. ` +
        `On local web dev, a CORS rejection also ends up here: ` +
        `check backend CORS_ALLOWED_ORIGINS includes ${currentOrigin()}.`
    );
  }
  return new ApiError('NETWORK', i18next.t('error.network'));
}

function currentOrigin(): string {
  return Platform.OS === 'web' && typeof window !== 'undefined'
    ? window.location.origin
    : 'the app origin';
}
