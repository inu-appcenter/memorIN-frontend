import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  signIn: () => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  signIn: () => set({ isAuthenticated: true }),
  signOut: () => set({ isAuthenticated: false }),
}));
