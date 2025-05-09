import { useCallback, useState, useMemo } from 'react';
import { usePrivy, useIdentityToken } from '@privy-io/expo';
import { apiService } from '.';

/**
 * Shape of the data returned from the user sync endpoint.
 */
interface CreateUserResponseData {
  userId: string;
  userType: string;
  timeCreated: string;
  timeUpdated: string;
  walletAddresses: Record<string, string>;
  email: string;
  isNewUser: boolean;
}

/**
 * Full API response for create/sync user.
 */
interface CreateUserApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: CreateUserResponseData;
}

/**
 * Parsed user object returned by the hook after syncing.
 */
export interface ParsedUser {
  userId: string;
  userType: string;
  timeCreated: string;
  timeUpdated: string;
  walletAddresses: Record<string, string>;
  email: string;
  isNewUser: boolean;
}

/**
 * Return type of the useSyncUser hook.
 */
interface UseSyncUserReturn {
  /**
   * Function to trigger user creation or synchronization.
   * Returns ParsedUser on success, or null on failure.
   */
  syncUser: () => Promise<ParsedUser | null>;
  /** Whether the sync operation is in progress */
  isLoading: boolean;
  /** Error message if sync failed, otherwise null */
  error: string | null;
  /** Whether a successful sync has already occurred */
  isSynced: boolean;
}

/**
 * Custom hook to create or sync a user record on the backend.
 *
 * - Retrieves Privy user ID via usePrivy().
 * - Gets the Privy identity token via useIdentityToken().
 * - Calls POST /users/me using apiService.
 * - Parses and returns selected fields.
 *
 * Console.logs each step for detailed debugging.
 */
export function useSyncUser(): UseSyncUserReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSynced, setIsSynced] = useState(false);

  // Privy context provides the current authenticated user
  const privy = usePrivy() as any;
  // Hook to retrieve the identity token for authorization
  const { getIdentityToken } = useIdentityToken();
  
  // Memoize the user ID to prevent unnecessary re-renders
  const userId = useMemo(() => privy.user?.id, [privy.user?.id]);

  const syncUser = useCallback(async (): Promise<ParsedUser | null> => {
    // Prevent sync if already synced
    if (isSynced) {
      console.log('[useSyncUser] Sync already completed, skipping...');
      return null;
    }

    // Ensure we have a Privy user ID
    if (!userId) {
      const msg = 'No Privy user ID available';
      console.error('[useSyncUser] Error: No Privy user ID available');
      setError(msg);
      return null;
    }

    console.log('[useSyncUser] Starting user sync for user ID:', userId);

    setIsLoading(true);
    setError(null);

    try {
      // Retrieve identity token for backend authorization
      console.log('[useSyncUser] Retrieving identity token...');
      const idToken = await getIdentityToken();
      console.log('[useSyncUser] Identity token retrieved:', idToken ? 'Token exists' : 'No token');

      if (!idToken) {
        throw new Error('Failed to retrieve identity token');
      }

      // Make API request to create or sync user
      const endpoint = '/users/me';
      console.log('[useSyncUser] Making API request to:', endpoint);
      const response = await apiService.post<CreateUserApiResponse>(endpoint, {});
      console.log('[useSyncUser] API response received:', response ? 'Response exists' : 'No response');

      // Check if response data is valid
      if (!response || !response.data || !response.data.data) {
        console.error('[useSyncUser] Invalid response data received from API');
        throw new Error('Invalid response data received from API');
      }

      console.log('[useSyncUser] Response data valid, processing user data');

      // Parse the data from the response
      const userData = response.data.data;

      const parsed: ParsedUser = {
        userId: userData.userId,
        userType: userData.userType,
        timeCreated: userData.timeCreated,
        timeUpdated: userData.timeUpdated,
        walletAddresses: userData.walletAddresses,
        email: userData.email,
        isNewUser: userData.isNewUser,
      };

      console.log('[useSyncUser] User sync successful for:', userData.userId);
      setIsSynced(true); // Mark as synced
      return parsed;
    } catch (err: any) {
      // Set a user-friendly error message
      const message = err?.response?.data?.message || err?.message || 'Unknown error during user sync';
      console.error('[useSyncUser] Error during sync:', message);
      console.error('[useSyncUser] Full error details:', err);
      if (err?.response) {
        console.error('[useSyncUser] Response status:', err.response.status);
        console.error('[useSyncUser] Response data:', err.response.data);
      }
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [userId, getIdentityToken, isSynced]);

  return { syncUser, isLoading, error, isSynced };
} 