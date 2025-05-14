import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiService } from '../../common/hooks/useApiService';

interface SetSpendingLimitPayload {
  usdAmount: number;
  chainType: string;
  tokenSymbol: string;
  blockchainNetwork: string;
}

interface SetSpendingLimitVariables {
  userId: string;
  usdAmount: number;
  chainType: string;
  tokenSymbol: string;
}

// Define a more specific type if the structure of 'data' from POST response is known
type SetSpendingLimitData = any; 

interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export const useSetSpendingLimit = () => {
  const apiService = useApiService();
  const queryClient = useQueryClient();

  return useMutation<
    SetSpendingLimitData,
    Error,
    SetSpendingLimitVariables
  >({
    mutationFn: async (variables: SetSpendingLimitVariables) => {
      const { userId, usdAmount, chainType, tokenSymbol } = variables;
      
      const blockchainNetwork = process.env.EXPO_PUBLIC_BLOCKCHAIN_NETWORK || 'Base Sepolia';

      const payload: SetSpendingLimitPayload = {
        usdAmount,
        chainType,
        tokenSymbol,
        blockchainNetwork,
      };

      console.log('[useSetSpendingLimit] Attempting to set spending limit for user:', userId, 'with payload:', payload);
      
      // Assuming apiService handles the /api/v1 prefix
      const response = await apiService.post(
        `/spending-limits/set-limit/${encodeURIComponent(userId)}`,
        payload
      );
      const jsonResponse: ApiResponse<SetSpendingLimitData> = await response.json();

      if (!jsonResponse.success || response.status >= 400) {
        console.error('[useSetSpendingLimit] API Error:', jsonResponse.message || `HTTP error! status: ${response.status}`);
        throw new Error("Service unavailable, you can't spend your card at this moment");
      }
      return jsonResponse.data;
    },
    onSuccess: (data, variables) => {
      console.log('[useSetSpendingLimit] Spending limit set successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      // queryClient.invalidateQueries({ queryKey: ['spendingLimit', variables.userId] });
    },
    onError: (error) => {
      // The error here will already have the custom message from the mutationFn
      console.error('[useSetSpendingLimit] Error setting spending limit (hook onError):', error.message);
    },
    mutationKey: ['setSpendingLimit'],
  });
}; 