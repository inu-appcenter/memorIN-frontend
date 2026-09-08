import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 사용자가 알림을 "껐다"는 사실을 사용자 단위로 남긴다.
//
// 브라우저 권한(Notification.permission)은 오리진 단위라 계정과 무관하고 한 번
// 허용하면 계속 granted로 남는다. 그래서 권한만 보고 자동 등록하면 사용자가
// 토글을 꺼도 다음 실행에서 다시 켜진다.
//
// 네이티브에는 쓰지 않는다. 그쪽은 OS 권한이 유일한 진실이고, 서버 토큰을
// 지우는 API가 없어서 앱만 껐다고 표시하면 실제 동작과 어긋난다.
//
// 민감정보가 아니라 languageStorage와 같은 패턴을 쓴다(SecureStore 아님).
const keyOf = (userId: string) => `memorin.push.optOut.${userId}`;

export const pushPreference = {
  async isOptedOut(userId: string): Promise<boolean> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(keyOf(userId)) === '1';
    }
    return (await AsyncStorage.getItem(keyOf(userId))) === '1';
  },

  async setOptedOut(userId: string, value: boolean): Promise<void> {
    const key = keyOf(userId);

    if (Platform.OS === 'web') {
      if (value) localStorage.setItem(key, '1');
      else localStorage.removeItem(key);
      return;
    }

    if (value) await AsyncStorage.setItem(key, '1');
    else await AsyncStorage.removeItem(key);
  },
};
