import { useEffect, useState, type ReactNode } from 'react';
import { AppState, Platform, View } from 'react-native';
import { Text } from '@/shared/ui/text';
import { CHAT_ENABLED } from '@/shared/config/features';
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

// 앱이 사용자 눈앞에 있는지. 네이티브는 AppState, 웹은 문서 visibility로 본다.
function useIsForeground(): boolean {
  const [foreground, setForeground] = useState(() =>
    Platform.OS === 'web'
      ? typeof document === 'undefined' || document.visibilityState !== 'hidden'
      : AppState.currentState === 'active'
  );

  useEffect(() => {
    if (Platform.OS === 'web') {
      if (typeof document === 'undefined') return;
      const handleChange = () =>
        setForeground(document.visibilityState !== 'hidden');
      document.addEventListener('visibilitychange', handleChange);
      return () =>
        document.removeEventListener('visibilitychange', handleChange);
    }

    const subscription = AppState.addEventListener('change', (nextState) =>
      setForeground(nextState === 'active')
    );
    return () => subscription.remove();
  }, []);

  return foreground;
}

// STOMP 연결을 하나만 두고, 아래 조건이 모두 맞을 때만 붙인다.
// - 채팅이 켜져 있다(CHAT_ENABLED)
// - 로그인 상태다
// - 소켓이 필요한 화면이 열려 있다(useSocketDemand — 지금은 채팅 화면)
// - 앱이 포그라운드다
//
// 백엔드는 소켓이 하나라도 열려 있으면 푸시를 보내지 않는다(백엔드 #307). 소켓을
// 열어 두는 범위가 곧 푸시가 막히는 범위라 필요한 순간에만 연다. 네이티브는
// 백그라운드에서 OS가 소켓을 얼리고, 웹은 탭이 가려져도 소켓이 살아 있어 푸시만
// 막는다. 둘 다 가려지면 끊고, 끊긴 동안의 알림은 푸시가 맡는다.
export function SocketProvider({ children }: { children: ReactNode }) {
  const authStatus = useAuthStore((state) => state.status);
  const demand = useSocketStore((state) => state.demand);
  const foreground = useIsForeground();

  const shouldConnect =
    CHAT_ENABLED && authStatus === 'authenticated' && demand > 0 && foreground;

  useEffect(() => {
    if (!shouldConnect) {
      deactivateSocket();
      return;
    }

    activateSocket();

    return () => {
      deactivateSocket();
    };
  }, [shouldConnect]);

  return (
    <>
      {children}
      {CHAT_ENABLED && <SocketStatusBadge />}
    </>
  );
}
