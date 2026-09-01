import { Client } from '@stomp/stompjs';
import { jwtDecode } from 'jwt-decode';
import {
  tokenStorage,
  ACCESS_TOKEN_KEY,
} from '@/entities/session/lib/tokenStorage';
import { useSocketStore } from '@/shared/lib/useSocketStore';
import { resolveApiBaseUrl, ensureFreshAccessToken } from './client';

const INITIAL_RECONNECT_DELAY_MS = 1_000;
const MAX_RECONNECT_DELAY_MS = 30_000;
const HEARTBEAT_MS = 10_000;

// 만료 직전에 붙으면 연결 도중 토큰이 죽는다. 여유를 두고 미리 갱신한다.
const TOKEN_EXPIRY_MARGIN_MS = 30_000;

// SockJS는 /ws/websocket을 순수 WebSocket 경로로 함께 열어준다. sockjs-client는 브라우저
// 전역 객체에 의존해 React Native에서 불안정하므로 그쪽을 쓴다.
function resolveSocketUrl(): string {
  const base = (resolveApiBaseUrl() ?? '').replace(/\/+$/, '');
  return `${base.replace(/^http/, 'ws')}/ws/websocket`;
}

function isExpiringSoon(token: string): boolean {
  try {
    const { exp } = jwtDecode<{ exp?: number }>(token);
    if (!exp) return false;
    return exp * 1000 - Date.now() <= TOKEN_EXPIRY_MARGIN_MS;
  } catch {
    return true; // 읽을 수 없는 토큰은 만료로 취급한다
  }
}

// STOMP 인증은 연결 시점에 한 번만 일어난다. 서버가 CONNECT를 검증해 "이 세션 = 유저 A"로
// 기록하고, 이후 프레임에는 토큰이 붙지 않는다. 그래서 연결 중에 토큰이 갱신돼도
// 재연결할 필요가 없다 — 서버 쪽 세션은 그대로다.
//
// 문제가 되는 건 반대 경우다. 백그라운드에 오래 있다 돌아와 재연결할 때 저장된
// accessToken이 이미 만료돼 있으면 CONNECT가 거부되고, 재시도해도 같은 토큰이라
// 계속 실패한다. axios의 401 재발급 경로를 STOMP는 타지 않으므로 여기서 직접 챙긴다.
async function resolveConnectToken(): Promise<string | null> {
  const stored = await tokenStorage.get(ACCESS_TOKEN_KEY);
  if (!stored) return null;
  if (!isExpiringSoon(stored)) return stored;

  if (__DEV__) {
    console.log('[socket] access token expired — refreshing before CONNECT');
  }

  try {
    return await ensureFreshAccessToken();
  } catch {
    return null;
  }
}

let stompClient: Client | null = null;

function createClient(): Client {
  const instance = new Client({
    brokerURL: resolveSocketUrl(),
    reconnectDelay: INITIAL_RECONNECT_DELAY_MS,
    heartbeatIncoming: HEARTBEAT_MS,
    heartbeatOutgoing: HEARTBEAT_MS,

    // 연결할 때마다 그 시점의 최신 토큰을 싣는다.
    beforeConnect: async () => {
      const token = await resolveConnectToken();
      instance.connectHeaders = token
        ? { Authorization: `Bearer ${token}` }
        : {};
    },

    onConnect: () => {
      instance.reconnectDelay = INITIAL_RECONNECT_DELAY_MS;
      useSocketStore.getState().setError(null);
      useSocketStore.getState().setStatus('connected');
    },

    // stompjs는 이 콜백을 부른 뒤 reconnectDelay만큼 기다렸다가 다시 붙는다.
    // 여기서 값을 키워 두면 실패가 이어질수록 간격이 벌어진다(지수 백오프).
    onWebSocketClose: () => {
      instance.reconnectDelay = Math.min(
        instance.reconnectDelay * 2,
        MAX_RECONNECT_DELAY_MS
      );
      useSocketStore
        .getState()
        .setStatus(instance.active ? 'reconnecting' : 'idle');
    },

    onStompError: (frame) => {
      useSocketStore
        .getState()
        .setError(frame.headers.message ?? 'STOMP error');
    },

    onWebSocketError: () => {
      useSocketStore.getState().setError('WebSocket error');
    },
  });

  return instance;
}

function getClient(): Client {
  if (!stompClient) stompClient = createClient();
  return stompClient;
}

export function activateSocket(): void {
  const instance = getClient();
  if (instance.active) return;

  instance.reconnectDelay = INITIAL_RECONNECT_DELAY_MS;
  useSocketStore.getState().setError(null);
  useSocketStore.getState().setStatus('connecting');
  instance.activate();
}

export async function deactivateSocket(): Promise<void> {
  if (!stompClient?.active) return;

  await stompClient.deactivate();
  useSocketStore.getState().setStatus('idle');
}

// 채팅방 API가 붙으면 subscribe/publish 헬퍼를 추가할 예정.
export function getStompClient(): Client {
  return getClient();
}

// 개발 중 콘솔에서 연결을 직접 여닫기 위한 창구.
// 재연결 경로는 손으로 재현해야 검증이 되는데, 백엔드를 껐다 켜면 그동안
// /auth/refresh까지 같이 죽어서 토큰 갱신 경로를 확인할 수 없다.
// 프로덕션 빌드에서는 __DEV__가 false라 등록되지 않는다.
if (__DEV__) {
  (globalThis as Record<string, unknown>).__socket = {
    activate: activateSocket,
    deactivate: deactivateSocket,
    client: getClient,
  };
}
