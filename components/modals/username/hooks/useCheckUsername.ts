import { useQuery } from '@tanstack/react-query';
import { useApiService } from '../../../../api/api';
import { ValidationStatus } from '../../../../types/username';
import { useMemo, useCallback } from 'react';

interface UsernameCheckResponse {
  available: boolean;
}

interface ApiEnvelope {
  success: boolean;
  statusCode: number;
  message: string;
  data: UsernameCheckResponse;
}

// Cache for username validation results
const validationCache = new Map<string, { result: UsernameCheckResponse; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
const DEBOUNCE_DELAY = 300; // 300ms debounce

// Custom debounce implementation
function useDebounce<T extends (...args: any[]) => Promise<any>>(
  callback: T,
  delay: number
): T {
  let timeoutId: NodeJS.Timeout;

  return useCallback(
    ((...args) => {
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

  // Base query function
  const baseQueryFn = useCallback(async () => {
    if (!username || username.length === 0) {
      return { available: false, isEmpty: true } as any;
    }

    // Check cache first
    const cached = validationCache.get(username);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`[useCheckUsername] Using cached result for username: '${username}'`);
      return cached.result;
    }

    try {
      const response = await apiService.get(`/users/check-username/${username}`);
      const fullResponse: ApiEnvelope = await response.json();

      if (fullResponse && typeof fullResponse.data === 'object' && typeof fullResponse.data.available === 'boolean') {
        // Update cache
        validationCache.set(username, {
          result: fullResponse.data,
          timestamp: Date.now(),
        });
        return fullResponse.data;
      }

      console.error('[useCheckUsername] Invalid API response structure:', fullResponse);
      throw new Error('Invalid API response structure for username check');
    } catch (error) {
      console.error(`[useCheckUsername] Error checking username '${username}':`, error);
      throw error;
    }
  }, [username, apiService]);

  // Debounced query function
  const debouncedQueryFn = useDebounce(baseQueryFn, DEBOUNCE_DELAY);

  const { data, error: queryError, isLoading } = useQuery<UsernameCheckResponse, Error, UsernameCheckResponse, [string, string]>({
    queryKey: ['username', username],
    queryFn: debouncedQueryFn,
    enabled: username.length > 0,
    staleTime: 30000,
    gcTime: CACHE_TTL,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  // Derive status directly from query state
  const { status, error } = useMemo(() => {
    let currentStatus: ValidationStatus = 'empty';
    let currentError: string | null = null;

    if (!username || username.length === 0) {
      currentStatus = 'empty';
      console.log(`[useCheckUsername] Status: ${currentStatus} (Username is empty)`);
    } else if (isLoading) {
      currentStatus = 'checking';
      console.log(`[useCheckUsername] Status: ${currentStatus} (Checking username: '${username}')`);
    } else if (queryError) {
      currentStatus = 'empty';
      currentError = queryError instanceof Error ? queryError.message : 'Failed to check username availability';
      console.log(`[useCheckUsername] Status: ${currentStatus} (Error checking username: '${username}'), Error: ${currentError}`);
    } else if (data) {
      if ((data as any).isEmpty) {
        currentStatus = 'empty';
        console.log(`[useCheckUsername] Status: ${currentStatus} (Data indicates empty for username: '${username}')`);
      } else {
        currentStatus = data.available ? 'available' : 'taken';
        console.log(`[useCheckUsername] Status: ${currentStatus} (Username: '${username}' is ${currentStatus === 'available' ? 'available based on API' : 'taken based on API'}) API raw available: ${data.available}`);
      }
    }

    return { status: currentStatus, error: currentError };
  }, [username, isLoading, queryError, data]);

  return { status, error };
}