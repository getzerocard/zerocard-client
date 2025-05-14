import { useState } from 'react';
import { usePrivy } from '@privy-io/expo';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import { useSettingsStore } from '../../store/settingsStore';
// import { useUsernameStore } from '../../store/usernameStore'; // Removed
// It's good practice to keep storage keys in a constants file if they are used in multiple places,
// but for now, we'll use them directly.
const USER_SESSION_KEY = 'user_session';
const USERNAME_KEY = 'username';
const USER_PROFILE_CACHE_KEY = 'user_profile'; // From useGetUser.ts

export const useLogout = () => {
  const privy = usePrivy();
  const queryClient = useQueryClient();
  const resetSettings = useSettingsStore((state) => state.resetSettings);
  // const resetUsernameGlobalState = useUsernameStore.getState().reset; // Removed
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = async () => {
    setIsLoggingOut(true);
    console.log('[useLogout] Starting logout process...');
    try {
      // 1. Clear secure storage
      await SecureStore.deleteItemAsync(USER_SESSION_KEY);
      console.log(`[useLogout] Cleared ${USER_SESSION_KEY} from SecureStore.`);

      // 2. Clear AsyncStorage items
      await AsyncStorage.removeItem(USERNAME_KEY); // This key is largely deprecated but good to clear
      console.log(`[useLogout] Cleared ${USERNAME_KEY} from AsyncStorage.`);
      await AsyncStorage.removeItem(USER_PROFILE_CACHE_KEY);
      console.log(`[useLogout] Cleared ${USER_PROFILE_CACHE_KEY} from AsyncStorage.`);
      // Note: 'user-settings-storage' is handled by resetSettings which clears the Zustand part,
      // and Zustand's persist middleware handles the AsyncStorage for that key.

      // 3. Reset Zustand stores
      resetSettings();
      console.log('[useLogout] Reset user settings store.');
      // resetUsernameGlobalState(); // Removed
      // console.log('[useLogout] Reset username global store.'); // Removed

      // 4. Clear React Query cache
      queryClient.clear(); // Clears all query caches
      // Alternatively, be more specific if needed:
      // queryClient.invalidateQueries({ queryKey: ['user'] }); // Example
      console.log('[useLogout] Cleared React Query cache.');

      // 5. Logout from Privy (should be one of the last steps)
      await privy.logout();
      console.log('[useLogout] Privy logout successful.');

      console.log('[useLogout] Logout process completed successfully.');
    } catch (error) {
      console.error('[useLogout] Error during logout:', error);
      // Potentially re-throw or handle error display to the user
    } finally {
      setIsLoggingOut(false);
    }
  };

  return { logout, isLoggingOut };
}; 