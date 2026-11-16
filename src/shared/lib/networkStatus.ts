import NetInfo from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';
import i18next from '@/shared/lib/i18n';
import { toast } from '@/shared/lib/toast';

// 기본 설정은 인터넷 연결 여부(isInternetReachable)를 확인하려고 clients3.google.com에
// 주기적으로 요청을 보낸다. 오프라인 판단에는 isConnected만 쓰므로 끈다.
// configure는 설정만 저장하고 상태 객체는 첫 fetch·addEventListener 때 만들어지는데,
// NetInfo는 이 모듈에서만 쓰므로 모듈을 불러올 때 설정하면 항상 그보다 먼저 적용된다.
NetInfo.configure({ reachabilityShouldRun: () => false });

// isConnected가 false로 확인됐을 때만 오프라인이다. null(아직 모름)은 온라인으로 본다.
function isConnected(state: { isConnected: boolean | null }): boolean {
  return state.isConnected !== false;
}

// fetch()는 첫 호출 뒤로는 네이티브 이벤트(웹은 online·offline 이벤트)로 갱신되는
// 마지막 상태를 바로 돌려주므로 오류가 날 때마다 불러도 부담이 없다.
export async function isOffline(): Promise<boolean> {
  try {
    return !isConnected(await NetInfo.fetch());
  } catch {
    return false;
  }
}

// React Query의 온라인 판단을 NetInfo에 맞춘다. 기본값은 window의 online·offline
// 이벤트라 네이티브에는 이벤트가 없어 늘 온라인으로 보고, 다시 연결돼도 실패한
// 조회를 다시 불러오지 않는다. 오프라인이면 조회는 요청 없이 멈췄다가 연결이
// 돌아오면 이어서 불러온다.
// 온라인에서 오프라인으로 바뀔 때 토스트를 한 번 띄운다. 멈춘 조회는 오류 없이
// 결과가 오지 않아 화면만으로는 이유를 알 수 없기 때문이다. 앱을 켤 때 이미 오프라인이어도
// onlineManager의 초기값이 온라인이라 같은 전환으로 한 번 띄운다.
// 반환값은 토스트 구독 해제다. 이벤트 리스너는 onlineManager가 계속 들고 있는다.
export function syncOnlineManagerWithNetInfo(): () => void {
  onlineManager.setEventListener((setOnline) =>
    NetInfo.addEventListener((state) => setOnline(isConnected(state)))
  );
  return onlineManager.subscribe((online) => {
    if (!online) toast.error(i18next.t('error.offline'));
  });
}
