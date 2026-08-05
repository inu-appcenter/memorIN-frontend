import axios, { AxiosError } from 'axios';
import { Alert, Platform } from 'react-native';
import { useAuthStore } from '@/entities/session/model/useAuthStore';
import { toast } from '@/shared/lib/toast';
// axois 인터셉터, 인스턴스 등을 정의

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: { code: string; message: string } | null;
}

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
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

async function handleSessionExpired() {
  const { status, setUnauthenticated } = useAuthStore.getState();
  if (status !== 'authenticated') return;

  setUnauthenticated();
  const message = '세션이 만료되었습니다. 다시 로그인해주세요.';
  if (Platform.OS === 'web') {
    window.alert(message);
  } else {
    Alert.alert('세션 만료', message);
  }
}

client.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse<unknown>>) => {
    if (error.response?.status === 401) {
      handleSessionExpired();
      return Promise.reject(
        new ApiError(
          'SESSION_EXPIRED',
          '세션이 만료되었습니다. 다시 로그인해주세요.'
        )
      );
    }

    const serverError = error.response?.data?.error;
    if (serverError && typeof serverError.message === 'string') {
      toast.error(serverError.message);
      return Promise.reject(
        new ApiError(serverError.code, serverError.message)
      );
    }
    if (serverError) {
      const message = '알 수 없는 오류가 발생했습니다';
      toast.error(message);
      return Promise.reject(new ApiError('UNKNOWN', message));
    }
    const message = '서버에 연결할 수 없습니다';
    toast.error(message);
    return Promise.reject(new ApiError('NETWORK', message));
  }
);

// 로그아웃 api 연동 (예정)
// POST /auth/logout
