import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiService } from '../../common/hooks/useApiService';

interface OrderCardVariables {
  symbol: string;
  chainType: string;
  // blockchainNetwork is now sourced from env, removed from variables
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
    // Update variable type here
    Omit<OrderCardVariables, 'blockchainNetwork'> 
  >({
    // Update function signature
    mutationFn: async (variables: Omit<OrderCardVariables, 'blockchainNetwork'>) => {
      // Destructure only needed variables
      const { symbol, chainType } = variables;
      // Get blockchainNetwork from environment variable
      const blockchainNetwork = process.env.EXPO_PUBLIC_BLOCKCHAIN_NETWORK || 'default_network'; // Added a fallback

      // Remove userId, use env var for blockchainNetwork
      const queryParams = new URLSearchParams({
        symbol,
        chainType,
        blockchainNetwork,
      }).toString();
      
      // Endpoint remains the same, userId is inferred by backend
      const response = await apiService.post(
        `/cards/me/order?${queryParams}`,
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
      // Maybe invalidate a cards query key too if one exists
      // queryClient.invalidateQueries({ queryKey: ['cards'] }); 
    },
    mutationKey: ['orderCard'],
  });
}; 