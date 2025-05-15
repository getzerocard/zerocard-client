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
    ApiErrorResponse,
    SetSpendingLimitParams
  >({
    mutationFn: async (params: SetSpendingLimitParams) => {
      const finalMessage = "Service unavailable, you can't spend your card at this time.";
      try {
        console.log('Attempting to set spending limit with params:', params);
        // TODO: Remove the hardcoded value for blockchainNetworkValue
        const blockchainNetworkValue = 'Base'; // Using the hardcoded value
        const queryParams = `usdAmount=${params.usdAmount}&chainType=${params.chainType}&tokenSymbol=${params.tokenSymbol}&blockchainNetwork=${encodeURIComponent(blockchainNetworkValue)}`;
        const endpoint = `/spending-limits/set-limit/me?${queryParams}`;
        
        console.log('[HOOK_useSetSpendingLimit_AMOUNT_LOG]', 'USD Amount being set:', params.usdAmount);
        console.log('[HOOK_useSetSpendingLimit_ENDPOINT_LOG]', 'Constructed endpoint for API call:', endpoint);

        // Send an empty object as the body, params are in the URL
        const response = await post(endpoint, {}, {}); 

        if (!response.ok) {
          let errorDataFromResponse: any;
          try {
            errorDataFromResponse = await response.json();
          } catch (e) {
            errorDataFromResponse = { 
              message: `Request failed with status ${response.status} and could not parse error body.` 
            };
          }
          console.error('[HOOK_useSetSpendingLimit_mutationFn_not_ok]', 'Set spending limit failed (original error data):', errorDataFromResponse);
          // Throw an object that will be caught by the outer try/catch, carrying original details
          throw {
            originalErrorData: errorDataFromResponse,
            statusCode: response.status,
            isOurNotOkError: true // Marker to identify this specific throw
          };
        }

        const result: SetSpendingLimitSuccessResponse = await response.json();
        console.log('Set spending limit successful:', result);
        return result;

      } catch (error: any) {
        // This catch block handles errors thrown by post() or by our explicit throw above.
        console.error('[HOOK_useSetSpendingLimit_mutationFn_CATCH_BLOCK]', 'Error caught in mutationFn:', error);

        let statusCode = 0;
        let originalMessageDetail = null;

        if (error.isOurNotOkError) { // Error from our `if (!response.ok)` block
          statusCode = error.statusCode;
          originalMessageDetail = error.originalErrorData?.message || JSON.stringify(error.originalErrorData);
        } else if (error.message && typeof error.message === 'string') { // Error likely from apiService.post()
          originalMessageDetail = error.message; // This might be "API request failed with status XXX: {JSON...}"
          const statusMatch = error.message.match(/status (\d+)/);
          if (statusMatch && statusMatch[1]) {
            statusCode = parseInt(statusMatch[1], 10);
          }
        } else if (error.statusCode) { // If error is already an object with statusCode
            statusCode = error.statusCode;
            originalMessageDetail = error.message || JSON.stringify(error);
        }
        
        // Log the original details for debugging before overriding the message for the UI
        console.error('[HOOK_useSetSpendingLimit_CATCH_ORIGINAL_ERROR_DETAIL]', 'Original error detail:', originalMessageDetail, 'Status Code:', statusCode);

        const errorToThrow: ApiErrorResponse = {
          message: finalMessage, // Use our generic user-facing message
          statusCode: statusCode,
          success: false,
        };
        throw errorToThrow; // This is what React Query's onError will receive
      }
    },
    onSuccess: (data) => {
      console.log('Spending limit set successfully, updating Zustand store.');
      setLimitDetails(data.data);
    },
    onError: (error: ApiErrorResponse) => {
      console.error('[HOOK_useSetSpendingLimit_onError]', 'Error setting spending limit (hook onError):', error.message);
    },
  });

  return mutation;
} 