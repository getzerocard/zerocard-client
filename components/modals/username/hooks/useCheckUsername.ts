import { useQuery } from '@tanstack/react-query';
import { useApiService } from '../../../../api/api';
import { ValidationStatus } from '../../../../types/username'; // Assuming ValidationStatus is defined here

interface UsernameCheckResponse {
  available: boolean;
}

interface ApiEnvelope {
  success: boolean;
  statusCode: number;
  message: string;
  data: UsernameCheckResponse;
}

export function useCheckUsername(username: string) {
  const apiService = useApiService();

  const { data, error: queryError, isLoading } = useQuery<UsernameCheckResponse, Error, UsernameCheckResponse, [string, string]>({
    queryKey: ['username', username],
    queryFn: async () => {
      if (!username || username.length === 0) {
        // For an empty username, we don't query but need a defined state.
        // This won't be reached if `enabled` is false, but as a fallback:
        return { available: false, isEmpty: true } as any; // Add a flag to indicate it's due to empty
      }

      const response = await apiService.get(`/users/check-username/${username}`);
      const fullResponse: ApiEnvelope = await response.json();

      if (fullResponse && typeof fullResponse.data === 'object' && typeof fullResponse.data.available === 'boolean') {
        return fullResponse.data; // Return the nested data object
      }
      // If the response structure is not as expected, throw an error.
      console.error('[useCheckUsername] Invalid API response structure:', fullResponse);
      throw new Error('Invalid API response structure for username check');
    },
    enabled: username.length > 0, // Only run query if username has text
    staleTime: 30000, 
  });

  // Derive status directly from query state
  let currentStatus: ValidationStatus = 'empty';
  let currentError: string | null = null;

  if (!username || username.length === 0) {
    currentStatus = 'empty';
    console.log(`[useCheckUsername] Status: ${currentStatus} (Username is empty)`);
  } else if (isLoading) {
    currentStatus = 'checking';
    console.log(`[useCheckUsername] Status: ${currentStatus} (Checking username: '${username}')`);
  } else if (queryError) {
    currentStatus = 'empty'; // Or a specific error status like 'error_checking'
    currentError = queryError instanceof Error ? queryError.message : 'Failed to check username availability';
    console.log(`[useCheckUsername] Status: ${currentStatus} (Error checking username: '${username}'), Error: ${currentError}`);
  } else if (data) {
    // If data exists but query was for an empty string (hypothetical, due to queryFn modification for empty)
    if ((data as any).isEmpty) {
        currentStatus = 'empty';
        console.log(`[useCheckUsername] Status: ${currentStatus} (Data indicates empty for username: '${username}')`);
    } else {
        // Correctly interpret the API response:
        // API returns data.available: true when username IS ACTUALLY AVAILABLE for use.
        // API returns data.available: false when username IS ACTUALLY TAKEN.
        currentStatus = data.available ? 'available' : 'taken';
        console.log(`[useCheckUsername] Status: ${currentStatus} (Username: '${username}' is ${currentStatus === 'available' ? 'available based on API' : 'taken based on API'}) API raw available: ${data.available}`);
    }
  }

  return {
    status: currentStatus,
    error: currentError,
    // No longer returning status/error from useUsernameStore directly here
  };
}