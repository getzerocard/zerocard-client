import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiService } from '../../api/api';
import {
  ProcessWithdrawalParams,
  ProcessWithdrawalSuccessResponse,
} from '../../types/withdrawal';
import { ApiErrorResponse } from '../../types/spendingLimit';

interface WithdrawalErrorResponse extends ApiErrorResponse {
  statusCode: 400 | 401 | 404 | 500;
}

export function useProcessWithdrawal() {
  const { post } = useApiService();
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ProcessWithdrawalSuccessResponse,
    WithdrawalErrorResponse,
    ProcessWithdrawalParams
  >({
    mutationFn: async (params: ProcessWithdrawalParams) => {
      console.log('Attempting to process withdrawal with params:', params);
      console.log(`Withdrawing to address: ${params.recipientAddress}`);

      // Construct query string from params
      const queryParams = new URLSearchParams({
        tokenSymbol: params.tokenSymbol,
        amount: params.amount,
        recipientAddress: params.recipientAddress,
        chainType: params.chainType,
        blockchainNetwork: params.blockchainNetwork,
      }).toString();

      const endpoint = `/withdrawal/process/me?${queryParams}`;

      // Start timing the API call
      console.time('Withdrawal API Call Duration');

      // Make the POST request using the api service hook
      const response = await post(endpoint, undefined, {}); // No body needed, all params in query

      // End timing the API call
      console.timeEnd('Withdrawal API Call Duration');

      // Handle specific error cases
      if (!response.ok) {
        let errorData: WithdrawalErrorResponse;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = {
            statusCode: response.status as WithdrawalErrorResponse['statusCode'],
            success: false,
            message: `Request failed with status ${response.status}`,
          };
        }

        console.error('Withdrawal processing failed (original error):', errorData); // Log original for debugging

        let finalMessage: string;

        switch (errorData.statusCode) {
          case 400:
            if (errorData.message && 
                (errorData.message.toLowerCase().includes("insufficient funds") || 
                 errorData.message.toLowerCase().includes("exceeds the balance"))) {
              finalMessage = "It looks like you don't have enough funds for this withdrawal. Please check your available balance and try again.";
            } else {
              finalMessage = "There was an issue with your withdrawal request. Please ensure all details are correct and try again.";
            }
            break;
          case 401:
            finalMessage = "You are not authorized to make withdrawals.";
            break;
          case 404:
            finalMessage = "We couldn't find the necessary information for your account. Please contact support if this issue persists.";
            break;
          case 500:
            finalMessage = "We're experiencing a temporary issue on our end. Please try your withdrawal again in a few moments.";
            break;
          default:
            console.warn(`Unhandled error status code: ${errorData.statusCode} with original message: ${errorData.message}`);
            finalMessage = "An unexpected error occurred while processing your withdrawal. Please try again later.";
            break;
        }
        // The thrown error will be caught by React Query and available in mutation.error.
        // The message property will be our human-readable one.
        throw { ...errorData, message: finalMessage }; 
      }

      const result = await response.json();
      console.log('Withdrawal processed successfully:', result);
      return result;
    },
    onSuccess: (data) => {
      console.log('Withdrawal success:', data);
      // Log the transaction hash specifically
      if (data?.data?.transactionHash) {
        console.log('Withdrawal Transaction Hash:', data.data.transactionHash);
      } else {
        console.log('Withdrawal success data did not contain a transaction hash.');
      }
      // Invalidate queries that might be affected by this withdrawal
      queryClient.invalidateQueries({ queryKey: ['userBalance'] });
    },
    onError: (error: WithdrawalErrorResponse) => {
      console.error('[HOOK_useProcessWithdrawal_onError] Processed Error Message:', error.message);
      // The error.message here should be the human-readable one set in mutationFn.
      // The component consuming this hook will use this error.message for UI display.
    },
  });

  return mutation;
} 