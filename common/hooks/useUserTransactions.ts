import { useQuery, QueryKey } from '@tanstack/react-query';
import { useApiService } from './useApiService';
import { GetTransactionsSuccessResponse, Transaction } from '../../types/transactions';
import { ApiErrorResponse } from '../../types/spendingLimit'; // Reusing general error type

interface UseUserTransactionsParams {
  page?: number;
  limit?: number;
  enabled?: boolean; // To control when the query is executed
}

const QUERY_KEY_USER_TRANSACTIONS = 'userTransactions';

// Define the specific query key type
type UserTransactionsQueryKey = [string, { page: number; limit: number }];

export function useUserTransactions({
  page = 1,
  limit = 10,
  enabled = true,
}: UseUserTransactionsParams = {}) {
  const { get } = useApiService();

  return useQuery<
    GetTransactionsSuccessResponse, // Fetcher returns the full response
    ApiErrorResponse,              // Error type
    Transaction[],                 // Selector returns Transaction[]
    UserTransactionsQueryKey       // Explicit QueryKey type
  >({
    queryKey: [QUERY_KEY_USER_TRANSACTIONS, { page, limit }],
    queryFn: async (): Promise<GetTransactionsSuccessResponse> => {
      const endpoint = `/transactions/me?limit=${limit}&page=${page}`;
      const response = await get(endpoint);
      // The useApiService already throws an error for !response.ok
      // and parses JSON, so we can directly work with the parsed data.
      // However, the current useApiService.get returns a Response object, not parsed JSON directly.
      // We need to call .json() on it.
      if (!response.ok) {
        // Attempt to parse error JSON, otherwise throw a generic error
        let errorData: ApiErrorResponse;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = {
            statusCode: response.status,
            success: false,
            message: `API request failed with status ${response.status}`,
          };
        }
        throw errorData; // This will be caught by React Query
      }
      return response.json(); // No need to cast here if queryFn returns the correct type
    },
    select: (data) => data.data, // Selects the array of transactions from the response
    enabled: enabled, // Control query execution
    staleTime: 1000 * 60 * 2, // Cache data for 2 minutes
    // Add other React Query options as needed, e.g., onSuccess, onError, placeholderData
  });
} 