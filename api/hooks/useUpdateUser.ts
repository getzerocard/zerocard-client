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

// Variables now only include the payload, userId is inferred by the /me endpoint
interface UpdateUserVariables {
  payload: UpdateUserPayload;
}

// Define a more specific type if the structure of 'data' from PATCH response is known
// For now, using 'any'. Ideally, this would be the updated User object type.
type UpdateUserData = any; 

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
      const { payload } = variables;
      // Changed endpoint to /users/me
      const response = await apiService.post(
        `/users/me`,
        payload,
        { method: 'PATCH' }
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
      // Since we used /me, invalidating the general ['user'] key is appropriate.
    },
    mutationKey: ['updateUser'],
  });
}; 