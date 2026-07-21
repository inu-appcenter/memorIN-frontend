import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store'; // 네이티브를 위한 시큐어 스토리지

const isWeb = Platform.OS === 'web';
/**
 * 플랫폼(웹 vs 네이티브 앱)에 따라 refresh token을 저장하는 방식을 자동으로 분기 처리해 주는 추상화 모듈
 * 웹: localStorage — 현재로서는 로컬스토리지를 사용하지만, 백엔드가 httpOnly 쿠키를 지원하면 웹에서는 아무동작도 하지 않도록 수정
 * 네이티브: SecureStore (iOS Keychain / Android Keystore)
 */
export const tokenStorage = {
  async get(key: string): Promise<string | null> {
    if (isWeb) return localStorage.getItem(key);
    return SecureStore.getItemAsync(key);
  },
  async set(key: string, value: string): Promise<void> {
    if (isWeb) {
      localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  async remove(key: string): Promise<void> {
    if (isWeb) {
      localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};
