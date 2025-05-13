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
          // If we can't parse the error response, create a generic one
          errorData = {
            statusCode: response.status as WithdrawalErrorResponse['statusCode'],
            success: false,
            message: `Request failed with status ${response.status}`,
          };
        }

        console.error('Withdrawal processing failed:', errorData);

        // Map specific error cases
        switch (errorData.statusCode) {
          case 400:
            throw {
              ...errorData,
              message: errorData.message || 'Invalid input provided for withdrawal',
            };
          case 401:
            throw {
              ...errorData,
              message: errorData.message || 'Sub-users are not allowed to make withdrawals',
            };
          case 404:
            throw {
              ...errorData,
              message: errorData.message || 'User not found',
            };
          case 500:
            throw {
              ...errorData,
              message: errorData.message || 'Internal server error during withdrawal process',
            };
          default:
            throw errorData;
        }
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
      console.error('Error processing withdrawal:', error.message);
      // Error handling is done in the component using the error.message
    },
  });

  return mutation;
} 