import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type NotificationKind =
  'like' | 'comment' | 'followRequest' | 'message' | 'followerRecord';

export const NOTIFICATION_KINDS: NotificationKind[] = [
  'like',
  'comment',
  'followRequest',
  'message',
  'followerRecord',
];

export type NotificationPreference = Record<NotificationKind, boolean>;

export const DEFAULT_NOTIFICATION_PREFERENCE: NotificationPreference = {
  like: true,
  comment: true,
  followRequest: true,
  message: true,
  followerRecord: true,
};

// 종류별 수신 여부를 저장하는 백엔드 API가 없어 기기에만 남긴다.
// 서버는 여전히 모든 알림을 보내므로, 이 값은 포그라운드 수신을 거를 때만
// 쓸 수 있고 OS가 직접 띄우는 백그라운드 알림은 막지 못한다.
const keyOf = (userId: string) => `memorin.push.kinds.${userId}`;

async function read(key: string): Promise<string | null> {
  if (Platform.OS === 'web') return localStorage.getItem(key);
  return AsyncStorage.getItem(key);
}

async function write(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
    return;
  }
  await AsyncStorage.setItem(key, value);
}

export const notificationPreference = {
  async get(userId: string): Promise<NotificationPreference> {
    const raw = await read(keyOf(userId));
    if (!raw) return DEFAULT_NOTIFICATION_PREFERENCE;
    try {
      const parsed = JSON.parse(raw) as Partial<NotificationPreference>;
      // 저장 이후 종류가 늘어났을 수 있어 기본값 위에 덮는다.
      return { ...DEFAULT_NOTIFICATION_PREFERENCE, ...parsed };
    } catch {
      return DEFAULT_NOTIFICATION_PREFERENCE;
    }
  },

  async set(userId: string, value: NotificationPreference): Promise<void> {
    await write(keyOf(userId), JSON.stringify(value));
  },
};
