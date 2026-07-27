import axios, { AxiosError } from 'axios';
import { Platform } from 'react-native';
import { useAuthStore } from '@/entities/session/model/useAuthStore';
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

// 응답 인터셉터: 서버 에러를 ApiError로 정규화
client.interceptors.response.use(
  (response) => response, // 성공은 그대로 통과
  (error: AxiosError<ApiResponse<unknown>>) => {
    // 실패시 백엔드 반환 형태 { error: { code, message } }
    const serverError = error.response?.data?.error;
    if (serverError) {
      return Promise.reject(
        new ApiError(serverError.code, serverError.message)
      );
    }
    // 네트워크/타임아웃 등 응답 자체가 없는 경우
    return Promise.reject(new ApiError('NETWORK', '서버에 연결할 수 없습니다'));
  }
);

// 토큰 재발급 함수는 features/auth/api/authApi.ts의 refreshAccessToken으로 구현돼 있다.
// 401 발생 시 자동으로 재발급을 시도하고 원래 요청을 재시도하는 인터셉터는 아직 연결하지
// 않았다 - 백엔드의 POST /auth/refresh가 만료되지 않은 access token을 요구하고 있어서,
// 정작 access token이 만료된 상황(401이 나는 그 상황)에 재발급 자체가 401로 실패하는
// 문제가 있다(백엔드 확인 필요). 이 문제가 해결된 뒤 여기에 인터셉터를 추가한다.

// 로그아웃 api 연동 (예정)
// POST /auth/logout
