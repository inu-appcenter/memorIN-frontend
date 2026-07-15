import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const isWeb = Platform.OS === 'web';

/**
 * 리프레시 토큰 저장소 (플랫폼 분기)
 * - 네이티브: SecureStore (iOS Keychain / Android Keystore)
 * - 웹: localStorage — ⚠️ Plan B 임시안. 백엔드가 httpOnly 쿠키를
 *   지원하면 웹 분기를 no-op으로 교체한다 (프론트가 토큰을 만지지 않게 됨)
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
