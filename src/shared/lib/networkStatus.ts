import NetInfo from '@react-native-community/netinfo';

// 기본 설정은 인터넷 연결 여부(isInternetReachable)를 확인하려고 clients3.google.com에
// 주기적으로 요청을 보낸다. 오프라인 판단에는 isConnected만 쓰므로 끈다.
// configure는 설정만 저장하고 상태 객체는 첫 fetch 때 만들어지는데, NetInfo는 이
// 모듈에서만 쓰므로 모듈을 불러올 때 설정하면 첫 fetch보다 항상 먼저 적용된다.
NetInfo.configure({ reachabilityShouldRun: () => false });

// 기기가 네트워크에 연결돼 있지 않다고 확인됐을 때만 true다.
// isConnected가 null(아직 모름)이면 오프라인으로 보지 않는다.
// fetch()는 첫 호출 뒤로는 네이티브 이벤트(웹은 online·offline 이벤트)로 갱신되는
// 마지막 상태를 바로 돌려주므로 오류가 날 때마다 불러도 부담이 없다.
export async function isOffline(): Promise<boolean> {
  try {
    const state = await NetInfo.fetch();
    return state.isConnected === false;
  } catch {
    return false;
  }
}
