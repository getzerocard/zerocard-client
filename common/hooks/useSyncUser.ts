import { useCallback, useState, useMemo } from 'react';
import { usePrivy, useIdentityToken } from '@privy-io/expo';
import { apiService } from '../../api';

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

  // Privy context provides the current authenticated user
  const privy = usePrivy() as any;
  // Hook to retrieve the identity token for authorization
  const { getIdentityToken } = useIdentityToken();
  
  // Memoize the user ID to prevent unnecessary re-renders
  const userId = useMemo(() => privy.user?.id, [privy.user?.id]);

  const syncUser = useCallback(async (): Promise<ParsedUser | null> => {
    console.log('[useSyncUser] Starting user sync process');

    // Ensure we have a Privy user ID
    if (!userId) {
      const msg = 'No Privy user ID available';
      console.error('[useSyncUser] Error:', msg);
      setError(msg);
      return null;
    }
    console.log('[useSyncUser] Privy user ID:', userId);

    setIsLoading(true);
    setError(null);

    try {
      // Retrieve identity token for backend authorization
      console.log('[useSyncUser] Retrieving identity token from Privy');
      const idToken = await getIdentityToken();
      console.log('[useSyncUser] Identity token retrieved:', idToken);

      if (!idToken) {
        throw new Error('Failed to retrieve identity token');
      }

      // Make API request to create or sync user - use /users/me endpoint 
      // which is handled by the API service's interceptors
      const endpoint = '/users/me';
      console.log('[useSyncUser] Calling API endpoint:', endpoint);
      const response = await apiService.post<CreateUserApiResponse>(endpoint);
      console.log('[useSyncUser] Raw API response:', response);

      // Parse the data from the response
      const { data } = response;
      console.log('[useSyncUser] Parsed response data:', data);

      const parsed: ParsedUser = {
        userId: data.userId,
        userType: data.userType,
        timeCreated: data.timeCreated,
        timeUpdated: data.timeUpdated,
        walletAddresses: data.walletAddresses,
        email: data.email,
        isNewUser: data.isNewUser,
      };
      console.log('[useSyncUser] Final parsed user object:', parsed);

      return parsed;
    } catch (err: any) {
      // Detailed error logging for debugging
      console.error('[useSyncUser] ❌ API Request Config:', err.config);
      console.error('[useSyncUser] ❌ API Response Status:', err.response?.status);
      console.error('[useSyncUser] ❌ API Response Headers:', err.response?.headers);
      console.error('[useSyncUser] ❌ API Response Data:', err.response?.data);
      console.error('[useSyncUser] ❌ Error Request:', err.request);
      console.error('[useSyncUser] ❌ Error Message:', err.message);
      // Set a user-friendly error message
      const message = err?.response?.data?.message || err?.message || 'Unknown error during user sync';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
      console.log('[useSyncUser] Sync process complete');
    }
  // We use only userId since it's now memoized, reducing re-renders
  }, [userId, getIdentityToken]);

  return { syncUser, isLoading, error };
} 