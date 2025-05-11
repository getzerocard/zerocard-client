import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiService } from '../../common/hooks/useApiService';

interface OrderCardVariables {
  userId: string;
  symbol: string;
  chainType: string;
  blockchainNetwork: string;
}

// Define a more specific type if the structure of 'data' from POST response is known
// For now, using 'any'. 
type OrderCardData = any; 

interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export const useOrderCard = () => {
  const apiService = useApiService();
  const queryClient = useQueryClient();

  return useMutation<
    OrderCardData,
    Error,
    OrderCardVariables
  >({
    mutationFn: async (variables: OrderCardVariables) => {
      const { userId, symbol, chainType, blockchainNetwork } = variables;
      const queryParams = new URLSearchParams({
        userId,
        symbol,
        chainType,
        blockchainNetwork,
      }).toString();
      
      // Assuming apiService handles the /api/v1 prefix
      const response = await apiService.post(
        `/cards/order?${queryParams}`,
        {} // Empty body for this POST request
      );
      const jsonResponse: ApiResponse<OrderCardData> = await response.json();

      if (!jsonResponse.success || response.status >= 400) {
        throw new Error(jsonResponse.message || `HTTP error! status: ${response.status}`);
      }
      return jsonResponse.data;
    },
    onSuccess: () => {
      // Invalidate and refetch the user query to reflect potential changes in card status
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    mutationKey: ['orderCard'],
  });
}; 