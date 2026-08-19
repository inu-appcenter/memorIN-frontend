import { Alert, Platform } from 'react-native';
import i18next from '@/shared/lib/i18n';

// 아직 구현되지 않은 진입점(알림 등)을 눌렀을 때 띄우는 공통 안내.
// 화면마다 같은 함수를 복사하던 것을 한 곳으로 모았다.
export function showNotReady() {
  const message = i18next.t('common.notReady');
  if (Platform.OS === 'web') {
    window.alert(message);
  } else {
    Alert.alert(i18next.t('common.notice'), message);
  }
}
