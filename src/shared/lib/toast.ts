import { create } from 'zustand';

// neutral은 "성공했지만 축하할 일은 아닌" 알림용이다.
// 알림 끄기처럼 사용자가 기능을 비활성화한 경우 녹색은 의미가 어긋난다.
export type ToastVariant = 'error' | 'success' | 'neutral';

export interface ToastItem {
  id: number;
  variant: ToastVariant;
  message: string;
}

interface ToastState {
  toasts: ToastItem[];
  push: (variant: ToastVariant, message: string) => void;
  dismiss: (id: number) => void;
}

let nextId = 0;

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  push: (variant, message) => {
    // 같은 메시지가 이미 떠 있으면 새로 안 띄우고 무시한다.
    const alreadyShowing = get().toasts.some(
      (t) => t.variant === variant && t.message === message
    );
    if (alreadyShowing) return;
    set((state) => ({
      toasts: [...state.toasts, { id: nextId++, variant, message }],
    }));
  },
  dismiss: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

// React 밖(axios 인터셉터 등)에서 호출하기 위한 진입점
export const toast = {
  error: (message: string) => useToastStore.getState().push('error', message),
  success: (message: string) =>
    useToastStore.getState().push('success', message),
  neutral: (message: string) =>
    useToastStore.getState().push('neutral', message),
};
