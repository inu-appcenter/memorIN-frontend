import { useEffect } from 'react';
import { create } from 'zustand';

export type SocketStatus =
  | 'idle' // 연결하지 않은 상태 (로그아웃·백그라운드·소켓이 필요한 화면 밖)
  | 'connecting' // 첫 연결 시도 중
  | 'connected'
  | 'reconnecting'; // 끊긴 뒤 백오프를 두고 재시도 중

interface SocketState {
  status: SocketStatus;
  error: string | null;
  // 지금 소켓이 필요한 화면 수. 0이면 SocketProvider가 연결을 끊는다.
  demand: number;
  setStatus: (status: SocketStatus) => void;
  setError: (error: string | null) => void;
  acquire: () => void;
  release: () => void;
}

// 연결 상태는 화면 여러 곳에서 읽게 되므로(개발용 배지, 나중엔 채팅 헤더의 "연결 중" 표시 등) 전역 스토어에 둔다.
export const useSocketStore = create<SocketState>((set) => ({
  status: 'idle',
  error: null,
  demand: 0,
  setStatus: (status) => set({ status }),
  setError: (error) => set({ error }),
  acquire: () => set((state) => ({ demand: state.demand + 1 })),
  release: () => set((state) => ({ demand: Math.max(0, state.demand - 1) })),
}));

// enabled인 동안 연결을 요청한다. 화면이 마운트돼 있어도 보이지 않을 수 있으니
// (Stack 아래에 깔린 화면 등) 호출부가 지금 보이는지를 넘긴다. 실제 연결 여부는
// SocketProvider가 로그인·포그라운드 상태와 함께 판단한다. 여러 화면이 동시에
// 요청해도 하나의 연결을 나눠 쓰도록 개수로 센다.
export function useSocketDemand(enabled = true): void {
  useEffect(() => {
    if (!enabled) return;
    const { acquire, release } = useSocketStore.getState();
    acquire();
    return release;
  }, [enabled]);
}
