import { create } from 'zustand';

import { ValidationStatus } from '../types/username';

interface UsernameState {
  username: string;
  status: ValidationStatus;
  error: string | null;
  setUsername: (username: string) => void;
  setStatus: (status: ValidationStatus) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useUsernameStore = create<UsernameState>((set) => ({
  username: '',
  status: 'empty',
  error: null,
  setUsername: (username) => set({ username }),
  setStatus: (status) => set({ status }),
  setError: (error) => set({ error }),
  reset: () => set({ username: '', status: 'empty', error: null }),
}));