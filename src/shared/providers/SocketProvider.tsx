import { useEffect, type ReactNode } from 'react';
import { AppState, Platform, View } from 'react-native';
import { Text } from '@/shared/ui/text';
import { useAuthStore } from '@/entities/session/model/useAuthStore';
import { activateSocket, deactivateSocket } from '@/shared/api/socketClient';
import { useSocketStore, type SocketStatus } from '@/shared/lib/useSocketStore';

const STATUS_COLOR: Record<SocketStatus, string> = {
  idle: '#8A8F9C',
  connecting: '#C59E00',
  connected: '#2E7D32',
  reconnecting: '#D03B3B',
};

// 개발 중에만 뜨는 연결 상태 표시. 생명주기가 눈에 보여야 검증이 된다.
// __DEV__가 false인 프로덕션 빌드에서는 렌더되지 않는다.
function SocketStatusBadge() {
  const status = useSocketStore((state) => state.status);

  if (!__DEV__) return null;

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: 8,
        bottom: 8,
        zIndex: 9999,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999,
        backgroundColor: STATUS_COLOR[status],
        opacity: 0.85,
      }}
    >
      <Text style={{ color: '#FFFFFF', fontSize: 10 }}>{`WS ${status}`}</Text>
    </View>
  );
}

// 앱 전역에 STOMP 연결을 하나만 유지한다.
//
// 네이티브는 백그라운드로 가면 OS가 소켓을 얼리므로 명시적으로 끊고 복귀 시 다시 붙는다.
// 끊긴 동안의 알림은 푸시가 담당한다.
// 웹은 탭 전환에 반응하지 않음. (탭 전환마다 재연결하면 낭비)
export function SocketProvider({ children }: { children: ReactNode }) {
  const authStatus = useAuthStore((state) => state.status);

  useEffect(() => {
    if (authStatus !== 'authenticated') {
      deactivateSocket();
      return;
    }

    activateSocket();

    return () => {
      deactivateSocket();
    };
  }, [authStatus]);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    const subscription = AppState.addEventListener('change', (nextState) => {
      // 로그아웃 상태에서 앱을 오갈 때 연결이 살아나면 안 됨.
      if (useAuthStore.getState().status !== 'authenticated') return;

      if (nextState === 'active') {
        activateSocket();
        return;
      }
      deactivateSocket();
    });

    return () => subscription.remove();
  }, []);

  return (
    <>
      {children}
      <SocketStatusBadge />
    </>
  );
}
