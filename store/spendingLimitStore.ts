import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SpendingLimitResponseData } from '../types/spendingLimit';

interface SpendingLimitState {
  limitDetails: SpendingLimitResponseData | null;
  setLimitDetails: (limitDetails: SpendingLimitResponseData | null) => void;
}

export const useSpendingLimitStore = create<SpendingLimitState>()(
  persist(
    (set) => ({
      limitDetails: null,
      setLimitDetails: (limitDetails) => {
        console.log('Updating spending limit in Zustand store:', limitDetails);
        set({ limitDetails });
      },
    }),
    {
      name: 'spending-limit-storage', // name of the item in storage (must be unique)
      storage: createJSONStorage(() => AsyncStorage), // use AsyncStorage for persistence
    }
  )
); 