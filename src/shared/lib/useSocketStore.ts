import { create } from 'zustand';

export type SocketStatus =
  | 'idle' // 연결하지 않은 상태 (로그아웃·백그라운드)
  | 'connecting' // 첫 연결 시도 중
  | 'connected'
  | 'reconnecting'; // 끊긴 뒤 백오프를 두고 재시도 중

interface SocketState {
  status: SocketStatus;
  error: string | null;
  setStatus: (status: SocketStatus) => void;
  setError: (error: string | null) => void;
}

// 연결 상태는 화면 여러 곳에서 읽게 되므로(개발용 배지, 나중엔 채팅 헤더의 "연결 중" 표시 등) 전역 스토어에 둔다.
export const useSocketStore = create<SocketState>((set) => ({
  status: 'idle',
  error: null,
  setStatus: (status) => set({ status }),
  setError: (error) => set({ error }),
}));
