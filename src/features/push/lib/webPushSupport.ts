import { Platform } from 'react-native';

const SERVICE_WORKER_PATH = '/sw.js';
const RUNTIME_CONFIG_PATH = '/config.json';

// EXPO_PUBLIC_*는 빌드 시점에 문자열로 치환되어 이미지 안에 굳는다. Docker 이미지를
// 여러 배포 환경(스테이징/운영)에서 재사용하려면 이 값만은 런타임에 바꿀 수 있어야
// 한다 — nginx 엔트리포인트가 기동 시 만드는 /config.json을 한 번 fetch해 쓰고,
// 그 파일이 없는 환경(로컬 dev, EAS 네이티브 빌드)에서는 빌드 시점 값으로 폴백한다.
let cachedVapidKey: string | null = null;
let vapidKeyPromise: Promise<string> | null = null;

async function fetchRuntimeVapidKey(): Promise<string> {
  const buildTimeKey = process.env.EXPO_PUBLIC_VAPID_PUBLIC_KEY ?? '';
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return buildTimeKey;
  }
  try {
    const response = await fetch(RUNTIME_CONFIG_PATH, { cache: 'no-store' });
    if (response.ok) {
      const config = (await response.json()) as { vapidPublicKey?: string };
      if (config.vapidPublicKey) return config.vapidPublicKey;
    }
  } catch {
    // config.json이 없는 환경(로컬 dev 등)은 빌드 시점 값으로 조용히 폴백한다.
  }
  return buildTimeKey;
}

export async function getVapidPublicKey(): Promise<string> {
  if (cachedVapidKey !== null) return cachedVapidKey;
  vapidKeyPromise ??= fetchRuntimeVapidKey().then((key) => {
    cachedVapidKey = key;
    return key;
  });
  return vapidKeyPromise;
}

export function isWebPushSupported(): boolean {
  return (
    Platform.OS === 'web' &&
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

// VAPID 공개키는 base64url 문자열인데 PushManager.subscribe는 바이트 배열을 받는다.
// base64url은 표준 base64와 +/ 문자가 다르고 패딩이 없어서 변환이 필요하다.
export function urlBase64ToUint8Array(
  base64String: string
): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) {
    output[i] = raw.charCodeAt(i);
  }
  // ArrayBuffer 타입 단언을 통해 SharedArrayBuffer와의 충돌 방지
  return output as unknown as Uint8Array<ArrayBuffer>;
}

// register는 멱등이지만, ready를 기다려야 pushManager가 준비된 등록 객체가 온다.
export async function ensureServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isWebPushSupported()) return null;
  await navigator.serviceWorker.register(SERVICE_WORKER_PATH);
  return navigator.serviceWorker.ready;
}

export async function getExistingSubscription(): Promise<PushSubscription | null> {
  const registration = await ensureServiceWorker();
  if (!registration) return null;
  return registration.pushManager.getSubscription();
}

export async function subscribeToPush(): Promise<PushSubscription | null> {
  const registration = await ensureServiceWorker();
  const vapidPublicKey = await getVapidPublicKey();
  if (!registration || !vapidPublicKey) return null;

  const existing = await registration.pushManager.getSubscription();
  if (existing) return existing;

  return registration.pushManager.subscribe({
    // false면 "사용자에게 안 보이는 푸시"가 되는데 크롬은 이를 허용하지 않는다.
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
  });
}

// 백엔드는 표준 toJSON()의 중첩 keys가 아니라 평탄한 형태를 받는다.
export interface FlatSubscription {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export function toFlatSubscription(
  subscription: PushSubscription
): FlatSubscription | null {
  const json = subscription.toJSON();
  const endpoint = json.endpoint;
  const p256dh = json.keys?.p256dh;
  const auth = json.keys?.auth;
  if (!endpoint || !p256dh || !auth) return null;
  return { endpoint, p256dh, auth };
}
