import { useQuery } from '@tanstack/react-query';
import { useApiService } from '../../../../api/api';
import { ValidationStatus } from '../../../../types/username';
import { useMemo, useCallback, useEffect } from 'react';

interface UsernameCheckResponse {
  available: boolean;
}

interface ApiEnvelope {
  success: boolean;
  statusCode: number;
  message: string;
  data: UsernameCheckResponse;
}

const DEBOUNCE_DELAY = 300; // 300ms debounce
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes for React Query gcTime

// Custom debounce implementation
function useDebounce<T extends (...args: any[]) => Promise<any>>(
  callback: T,
  delay: number
): T {
  let timeoutId: NodeJS.Timeout | undefined;

  return useCallback(
    ((...args: any[]) => {
      return new Promise((resolve, reject) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(async () => {
          try {
            const result = await callback(...args);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        }, delay);
      });
    }) as T,
    [callback, delay]
  );
}

export function useCheckUsername(username: string) {
  const apiService = useApiService();
  const trimmedUsername = username.trim();

  // Debounced actual API call function
  const debouncedFetchUsernameAvailability = useDebounce(async (currentUsername: string) => {
    console.log(`[useCheckUsername] Debounced API call for username: '${currentUsername}'`);
    try {
      const response = await apiService.get(`/users/check-username/${currentUsername}`);
      const fullResponse: ApiEnvelope = await response.json();

      if (fullResponse && typeof fullResponse.data === 'object' && typeof fullResponse.data.available === 'boolean') {
        return fullResponse.data;
      }
      console.error('[useCheckUsername] Invalid API response structure:', fullResponse);
      throw new Error('Invalid API response structure for username check');
    } catch (error) {
      console.error(`[useCheckUsername] Error in API call for username '${currentUsername}':`, error);
      throw error;
    }
  }, DEBOUNCE_DELAY);

  const { data, error: queryError, isLoading, isFetching } = useQuery<
    UsernameCheckResponse,
    Error,
    UsernameCheckResponse,
    [string, string]
  >({
    queryKey: ['usernameCheck', trimmedUsername],
    queryFn: () => debouncedFetchUsernameAvailability(trimmedUsername),
    enabled: trimmedUsername.length > 0,
    staleTime: 30000,
    gcTime: CACHE_TTL,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  const { status, error } = useMemo(() => {
    if (trimmedUsername.length === 0) {
      return { status: 'empty' as ValidationStatus, error: null };
    }
    if (isFetching) {
      return { status: 'checking' as ValidationStatus, error: null };
    }
    if (queryError) {
      return {
        status: 'empty' as ValidationStatus,
        error: queryError instanceof Error ? queryError.message : 'Failed to check username',
      };
    }
    if (data) {
      return {
        status: data.available ? 'available' as ValidationStatus : 'taken' as ValidationStatus,
        error: null,
      };
    }
    return { status: 'empty' as ValidationStatus, error: null };
  }, [trimmedUsername, isFetching, queryError, data]);

  useEffect(() => {
    console.log(`[useCheckUsername] Input: '${username}', Trimmed: '${trimmedUsername}', Status: ${status}, Error: ${error}, isLoading: ${isLoading}, isFetching: ${isFetching}, API_Data:`, data);
  }, [username, trimmedUsername, status, error, isLoading, isFetching, data]);

  return { status, error };
}