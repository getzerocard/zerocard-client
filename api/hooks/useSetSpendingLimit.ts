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
  payload: SetSpendingLimitPayload;
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
      const { userId, payload } = variables;
      // Assuming apiService handles the /api/v1 prefix
      const response = await apiService.post(
        `/spending-limits/set-limit/${encodeURIComponent(userId)}`,
        payload
      );
      const jsonResponse: ApiResponse<SetSpendingLimitData> = await response.json();

      if (!jsonResponse.success || response.status >= 400) {
        throw new Error(jsonResponse.message || `HTTP error! status: ${response.status}`);
      }
      return jsonResponse.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch the user query to reflect the updated spending limit
      queryClient.invalidateQueries({ queryKey: ['user'] });
      // You might also have a specific query for spending limits to invalidate
      // queryClient.invalidateQueries({ queryKey: ['spendingLimit', variables.userId] });
    },
    mutationKey: ['setSpendingLimit'],
  });
}; 