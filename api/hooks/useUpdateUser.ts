import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiService } from '../../common/hooks/useApiService';

interface ShippingAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

interface UpdateUserPayload {
  username?: string;
  timeZone?: string;
  shippingAddress?: ShippingAddress;
}

interface UpdateUserVariables {
  userId: string;
  payload: UpdateUserPayload;
}

// Define a more specific type if the structure of 'data' from PATCH response is known
// For now, using 'any'. Ideally, this would be the updated User object type.	ype UpdateUserData = any; 

interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export const useUpdateUser = () => {
  const apiService = useApiService();
  const queryClient = useQueryClient();

  return useMutation<
    UpdateUserData,
    Error,
    UpdateUserVariables
  >({
    mutationFn: async (variables: UpdateUserVariables) => {
      const { userId, payload } = variables;
      // The endpoint in the cURL example is /api/v1/users/{userId}
      // Assuming apiService handles the /api/v1 prefix, so we use /users/{userId}
      const response = await apiService.patch(
        `/users/${encodeURIComponent(userId)}`,
        payload
      );
      const jsonResponse: ApiResponse<UpdateUserData> = await response.json();

      if (!jsonResponse.success || response.status >= 400) {
        throw new Error(jsonResponse.message || `HTTP error! status: ${response.status}`);
      }
      return jsonResponse.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch the user query to reflect the updated data
      queryClient.invalidateQueries({ queryKey: ['user'] });
      // Optionally, if you have a query specific to the user ID, you can invalidate that too
      // queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
    },
    mutationKey: ['updateUser'],
  });
}; 