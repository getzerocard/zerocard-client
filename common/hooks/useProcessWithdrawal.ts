import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiService } from '../../api/api'; // Corrected path
import {
  ProcessWithdrawalParams,
  ProcessWithdrawalSuccessResponse,
} from '../../types/withdrawal';
import { ApiErrorResponse } from '../../types/spendingLimit'; // Reusing error type

export function useProcessWithdrawal() {
  const { post } = useApiService();
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ProcessWithdrawalSuccessResponse,
    Error, // Generic error type, adjust if apiService shapes errors differently
    ProcessWithdrawalParams
  >({
    mutationFn: async (params: ProcessWithdrawalParams) => {
      console.log('Attempting to process withdrawal with params:', params);
      console.log(`Withdrawing to address: ${params.recipientAddress}`);
      const endpoint = '/withdrawal/process/me';

      // Make the POST request using the api service hook
      const response = await post(endpoint, params, {}); // Pass params as body

      // Error handling integrated from useApiService hook, but we can double-check
      if (!response.ok) {
        let errorData: ApiErrorResponse | { message: string };
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { message: `Request failed with status ${response.status}: ${await response.text()}` };
        }
        console.error('Withdrawal processing failed:', errorData);
        // Use the message from the API response if available
        throw new Error(
          (errorData as ApiErrorResponse)?.message || 'Failed to process withdrawal'
        );
      }

      const result: ProcessWithdrawalSuccessResponse = await response.json();
      console.log('Withdrawal processed successfully:', result);
      return result;
    },
    onSuccess: (data) => {
      console.log('Withdrawal success:', data);
      // Optionally invalidate queries, e.g., user balance query
      queryClient.invalidateQueries({ queryKey: ['userBalance'] }); // Example invalidation
    },
    onError: (error) => {
      console.error('Error processing withdrawal:', error.message);
      // Further error handling (e.g., showing toast notification) can be done in the component
    },
  });

  return mutation;
} 