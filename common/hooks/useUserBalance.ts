import { useQuery } from '@tanstack/react-query';
import { useApiService } from '../../api/api';
import {
  GetBalanceParams,
  GetBalanceSuccessResponse,
  BalancesData,
} from '../../types/balance';
import { ApiErrorResponse } from '../../types/spendingLimit'; // Reusing error type

export function useUserBalance(params: GetBalanceParams, options: { enabled?: boolean } = {}) {
  const { get } = useApiService();

  // Construct the query key including parameters to ensure uniqueness
  const queryKey = ['userBalance', params];

  const query = useQuery<BalancesData, Error>({ // Return BalancesData directly
    queryKey: queryKey,
    queryFn: async () => {
      console.log('Fetching user balance with params:', params);
      // Construct the URL with query parameters
      const endpoint = `/withdrawal/balance?symbols=${params.symbols}&chainType=${params.chainType}&blockchainNetwork=${encodeURIComponent(params.blockchainNetwork)}`;

      const response = await get(endpoint);

      if (!response.ok) {
        let errorData: ApiErrorResponse | { message: string };
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { message: `Request failed with status ${response.status}: ${await response.text()}` };
        }
        console.error('Fetching balance failed:', errorData);
        throw new Error(
          (errorData as ApiErrorResponse)?.message || 'Failed to fetch balance'
        );
      }

      const result: GetBalanceSuccessResponse = await response.json();
      console.log('User balance fetched successfully:', result);
      // Extract and return only the balances part of the data
      return result.data.balances;
    },
    enabled: options.enabled, // Control whether the query runs automatically
    // Add other React Query options like staleTime, cacheTime if needed
    // staleTime: 1000 * 60 * 1, // Example: 1 minute stale time
  });

  return {
    ...query,
    balances: query.data, // Provide direct access to balances data
  };
} 