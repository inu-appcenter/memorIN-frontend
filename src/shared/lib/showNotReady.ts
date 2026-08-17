import { Alert, Platform } from 'react-native';

// 아직 구현되지 않은 진입점(알림 등)을 눌렀을 때 띄우는 공통 안내.
// 화면마다 같은 함수를 복사하던 것을 한 곳으로 모았다.
export function showNotReady() {
  const message = '아직 준비 중인 기능이에요';
  if (Platform.OS === 'web') {
    window.alert(message);
  } else {
    Alert.alert('안내', message);
  }
}
