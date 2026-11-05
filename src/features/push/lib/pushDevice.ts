import { Platform } from 'react-native';
import { getExistingSubscription, isWebPushSupported } from './webPushSupport';
import { getNativeDeviceToken } from './nativePush';

// 백엔드 LogoutRequest와 같은 모양. 서버는 이 값으로 "이 기기"의 등록만 지운다.
// 보내지 않으면 같은 기기로 다음 사람이 로그인해도 이전 사용자의 푸시가 온다.
export interface PushDeviceTarget {
  fcmToken?: string;
  webPushEndpoint?: string;
}

// 토큰 조회가 늦어도 로그아웃이 멈추면 안 된다. 못 구하면 빈 값으로 보낸다.
const LOOKUP_TIMEOUT_MS = 3000;

async function lookup(): Promise<PushDeviceTarget> {
  if (Platform.OS === 'web') {
    if (!isWebPushSupported()) return {};
    const existing = await getExistingSubscription();
    return existing ? { webPushEndpoint: existing.endpoint } : {};
  }

  const token = await getNativeDeviceToken();
  return token ? { fcmToken: token } : {};
}

export async function getCurrentPushTarget(): Promise<PushDeviceTarget> {
  const timeout = new Promise<PushDeviceTarget>((resolve) =>
    setTimeout(() => resolve({}), LOOKUP_TIMEOUT_MS)
  );
  return Promise.race([lookup().catch(() => ({})), timeout]);
}
