import { create } from 'zustand';
import { persist, PersistStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type DelegationStore = {
  isDelegated: boolean;
  setDelegated: (value: boolean) => void;
  reset: () => void;
  hasActiveSession: boolean;
  setActiveSession: (value: boolean) => void;
};

// Custom storage adapter for AsyncStorage
const asyncStorage: PersistStorage<DelegationStore> = {
  getItem: async (name) => {
    const value = await AsyncStorage.getItem(name);
    return value ? JSON.parse(value) : null;
  },
  setItem: async (name, value) => {
    await AsyncStorage.setItem(name, JSON.stringify(value));
  },
  removeItem: async (name) => {
    await AsyncStorage.removeItem(name);
  },
};

export const useDelegationStore = create<DelegationStore>()(
  persist(
    (set) => ({
      isDelegated: false,
      setDelegated: (value) => set({ isDelegated: value }),
      reset: () => set({ isDelegated: false }),
      hasActiveSession: false,
      setActiveSession: (value) => set({ hasActiveSession: value }),
    }),
    {
      name: 'delegation-store',
      storage: asyncStorage,
    }
  )
);
