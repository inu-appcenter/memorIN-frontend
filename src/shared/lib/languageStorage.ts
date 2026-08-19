import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGE_STORAGE_KEY = 'memorin.language';

// tokenStorage와 같은 패턴 — 웹은 localStorage, 네이티브는 AsyncStorage.
// 언어 설정은 인증 토큰과 달리 민감정보가 아니라 SecureStore를 쓰지 않는다.
export const languageStorage = {
  async get(): Promise<string | null> {
    if (Platform.OS === 'web')
      return localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
  },
  async set(value: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, value);
      return;
    }
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, value);
  },
};
