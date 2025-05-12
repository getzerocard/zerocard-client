import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiService } from '../../common/hooks/useApiService';

interface MapCardVariables {
  userId: string;
  status: string;        // e.g., "active"
  expirationDate: string; // e.g., "2025-12-31"
  number: string;        // Card number
}

// Define a more specific type if the structure of 'data' from POST response is known
type MapCardData = any; 

interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export const useMapCard = () => {
  const apiService = useApiService();
  const queryClient = useQueryClient();

  return useMutation<
    MapCardData,
    Error,
    MapCardVariables
  >({
    mutationFn: async (variables: MapCardVariables) => {
      const { userId, status, expirationDate, number } = variables;
      const queryParams = new URLSearchParams({
        userId,
        status,
        expirationDate,
        number,
      }).toString();
      
      // Assuming apiService handles the /api/v1 prefix
      const response = await apiService.post(
        `/cards/map?${queryParams}`,
        {} // Empty body for this POST request
      );
      const jsonResponse: ApiResponse<MapCardData> = await response.json();

      if (!jsonResponse.success || response.status >= 400) {
        throw new Error(jsonResponse.message || `HTTP error! status: ${response.status}`);
      }
      return jsonResponse.data;
    },
    onSuccess: () => {
      // Invalidate and refetch the user query to reflect potential changes
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    mutationKey: ['mapCard'],
  });
}; 