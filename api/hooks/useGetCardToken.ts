import { useQuery } from '@tanstack/react-query';
import { useApiService } from '../../common/hooks/useApiService';

// Define the structure for the data part of the API response
interface CardTokenData {
  userId: string;
  token: string;
}

// Define the overall API response structure
interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export const useGetCardToken = () => {
  const apiService = useApiService();

  return useQuery<
    CardTokenData, // This is the type of data that will be returned by the queryFn
    Error // This is the type of error that can be thrown
  >({
    queryKey: ['cardToken'], // Unique key for this query
    queryFn: async () => {
      const response = await apiService.get('/cards/me/token-info');
      const jsonResponse: ApiResponse<CardTokenData> = await response.json();

      if (!jsonResponse.success || response.status >= 400) {
        throw new Error(jsonResponse.message || `HTTP error! status: ${response.status}`);
      }
      return jsonResponse.data;
    },
    // Add any other options like staleTime, cacheTime, enabled, etc. as needed
    // For example, to make it refetch on window focus:
    // refetchOnWindowFocus: true,
  });
}; 