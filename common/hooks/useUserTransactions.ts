import { useQuery, QueryKey } from '@tanstack/react-query';
import { useApiService } from './useApiService';
import { GetTransactionsSuccessResponse, Transaction } from '../../types/transactions';
import { ApiErrorResponse } from '../../types/spendingLimit'; // Reusing general error type

// Re-export Transaction type for use in other modules
export type { Transaction };

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
      
      if (!response.ok) {
        let errorData: ApiErrorResponse;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = {
            statusCode: response.status,
            success: false,
            message: `API request failed with status ${response.status} and could not parse error body.`,
          };
        }
        console.error('Fetching transactions failed (original error):', errorData); // Log original

        let finalMessage: string;
        const status = errorData.statusCode || response.status;

        switch (status) {
          case 400:
            finalMessage = "There was an issue with the information used to fetch your transactions. Please try refreshing. If the problem persists, contact support.";
            break;
          case 401:
          case 403:
            finalMessage = "You are not authorized to view these transactions. Please contact support if you believe this is an error.";
            break;
          case 404:
            finalMessage = "No transactions found. If you're expecting transactions, they may not have processed yet.";
            break;
          case 500:
            finalMessage = "We're currently unable to fetch your transactions due to a server issue. Please try again shortly.";
            break;
          default:
            console.warn(`Unhandled error status code: ${status} with original message: ${errorData.message}`);
            finalMessage = "We couldn't fetch your transactions due to an unexpected issue. Please try refreshing. If the problem continues, please contact support.";
            break;
        }
        throw { ...errorData, statusCode: status, message: finalMessage }; 
      }
      return response.json(); 
    },
    select: (data) => data.data, // Selects the array of transactions from the response
    enabled: enabled, // Control query execution
    staleTime: 1000 * 60 * 2, // Cache data for 2 minutes
    // Add other React Query options as needed, e.g., onSuccess, onError, placeholderData
  });
} 