import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserSettingsState {
  biometricsEnabled: boolean;
  notificationsEnabled: boolean;
  toggleBiometrics: () => void;
  toggleNotifications: () => void;
  setNotificationsEnabled: (enabled: boolean) => void; // Added for external control if needed
}

export const useSettingsStore = create<UserSettingsState>()(
  persist(
    (set) => ({
      biometricsEnabled: true, // Default value
      notificationsEnabled: false, // Default value
      toggleBiometrics: () =>
        set((state) => ({ biometricsEnabled: !state.biometricsEnabled })),
      toggleNotifications: () =>
        set((state) => ({ notificationsEnabled: !state.notificationsEnabled })),
      setNotificationsEnabled: (enabled) =>
        set({ notificationsEnabled: enabled }),
    }),
    {
      name: 'user-settings-storage', // Name of the item in AsyncStorage
      storage: createJSONStorage(() => AsyncStorage), // Specify AsyncStorage
    }
  )
); 