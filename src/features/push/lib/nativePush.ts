import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Notifications from 'expo-notifications';

export type NativeDeviceType = 'ANDROID' | 'IOS';

// Expo Go는 SDK 53부터 안드로이드 원격 푸시 미지원
// expo-dev-client로 만든 개발 빌드에서 실행해야 토큰이 나온다
export function isExpoGo(): boolean {
  return Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
}

export function isNativePushSupported(): boolean {
  return Platform.OS === 'android' && !isExpoGo();
}

export function nativeDeviceType(): NativeDeviceType {
  return Platform.OS === 'ios' ? 'IOS' : 'ANDROID';
}

export async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('default', {
    name: 'memorIN',
    importance: Notifications.AndroidImportance.DEFAULT,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
}

// PermissionStatus는 문자열 enum이라 'granted'와 직접 비교하면 TS가 막는다.
// 호출부에서 문자열로 다루도록 여기서 풀어서 넘긴다.
export async function getNativePermissionStatus(): Promise<string> {
  const { status } = await Notifications.getPermissionsAsync();
  return String(status);
}

export async function requestNativePermission(): Promise<string> {
  const { status } = await Notifications.requestPermissionsAsync();
  return String(status);
}

// 백엔드가 Firebase Admin으로 직접 쏘기 때문에 Expo 푸시 토큰이 아니라
// 네이티브 FCM 토큰이 필요하다. getExpoPushTokenAsync()를 쓰면 Expo 서버를
// 거치는 다른 토큰이 나와서 백엔드 발송이 실패한다.
export async function getNativeDeviceToken(): Promise<string | null> {
  if (!isNativePushSupported()) return null;
  await ensureAndroidChannel();
  const token = await Notifications.getDevicePushTokenAsync();
  return typeof token.data === 'string' ? token.data : null;
}
