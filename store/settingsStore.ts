import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserSettingsState {
  biometricsEnabled: boolean;
  notificationsEnabled: boolean;
  toggleBiometrics: () => void;
  toggleNotifications: () => void;
  setNotificationsEnabled: (enabled: boolean) => void; // Added for external control if needed
  resetSettings: () => void; // Added to reset settings to default
}

const defaultSettings = {
  biometricsEnabled: true,
  notificationsEnabled: false,
};

export const useSettingsStore = create<UserSettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,
      toggleBiometrics: () =>
        set((state) => ({ biometricsEnabled: !state.biometricsEnabled })),
      toggleNotifications: () =>
        set((state) => ({ notificationsEnabled: !state.notificationsEnabled })),
      setNotificationsEnabled: (enabled) =>
        set({ notificationsEnabled: enabled }),
      resetSettings: () => set(defaultSettings), // Implementation for reset
    }),
    {
      name: 'user-settings-storage', // Name of the item in AsyncStorage
      storage: createJSONStorage(() => AsyncStorage), // Specify AsyncStorage
    }
  )
); 