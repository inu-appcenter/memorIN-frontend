import { create } from 'zustand';

export type ToastVariant = 'error' | 'success';

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
};
