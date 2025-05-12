import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiService } from '../../api/api';
import { useSpendingLimitStore } from '../../store/spendingLimitStore';
import {
  SetSpendingLimitParams,
  SetSpendingLimitSuccessResponse,
  ApiErrorResponse,
} from '../../types/spendingLimit';

export function useSetSpendingLimit() {
  const { post } = useApiService();
  const queryClient = useQueryClient();
  const setLimitDetails = useSpendingLimitStore((state) => state.setLimitDetails);

  const mutation = useMutation<
    SetSpendingLimitSuccessResponse,
    Error, // Using a generic Error type, refine if needed based on api client error shaping
    SetSpendingLimitParams
  >({
    mutationFn: async (params: SetSpendingLimitParams) => {
      console.log('Attempting to set spending limit with params:', params);
      // Construct the URL with query parameters
      const endpoint = `/spending-limits/set-limit/me?usdAmount=${params.usdAmount}&chainType=${params.chainType}&tokenSymbol=${params.tokenSymbol}&blockchainNetwork=${params.blockchainNetwork}`;

      // Make the POST request using the api service hook
      // The body is empty as specified by the curl example, data is in query params
      const response = await post(endpoint, {}, {}); // Pass empty body and options

      if (!response.ok) {
        let errorData: ApiErrorResponse | { message: string };
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { message: `Request failed with status ${response.status}` };
        }
        console.error('Set spending limit failed:', errorData);
        throw new Error(
          (errorData as ApiErrorResponse).message || 'Failed to set spending limit'
        );
      }

      const result: SetSpendingLimitSuccessResponse = await response.json();
      console.log('Set spending limit successful:', result);
      return result;
    },
    onSuccess: (data) => {
      console.log('Spending limit set successfully, updating Zustand store.');
      // Update the Zustand store with the new limit details
      setLimitDetails(data.data);

      // Optionally, invalidate relevant queries if needed
      // Example: queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
    onError: (error) => {
      console.error('Error setting spending limit:', error.message);
      // Handle error display or reporting here (e.g., show a toast notification)
    },
  });

  return mutation;
} 