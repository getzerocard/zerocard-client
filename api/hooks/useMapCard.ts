import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { useApiService } from '../api';
import {
  MapCardRequestParams,
  MapCardApiResponseSchema,
  MappedCardData, // This is the type we expect to return from the mutation function
  MapCardErrorResponseSchema, // Ensure this is imported
  MapCardErrorResponse // You might want a generic API error type later
} from '../../types/card';
import { CARD_QUERY_KEYS } from '../../constants/queryKeys';
// Import other relevant query keys if this mutation should invalidate them e.g. user details, card list
// import { USER_QUERY_KEYS } from '../../constants/queryKeys'; 

const mapCardToUser = async (
  params: MapCardRequestParams,
  apiService: ReturnType<typeof useApiService>
): Promise<MappedCardData> => {
  // Construct query string
  const queryParams = new URLSearchParams({
    userId: params.userId,
    status: params.status,
    expirationDate: params.expirationDate,
    number: params.number,
  }).toString();
  
  const endpoint = `/cards/map?${queryParams}`;

  // The cURL example uses -d '' which means an empty body.
  // apiService.post will JSON.stringify the body. Sending an empty object `{}` which becomes "{}".
  // This is usually fine for APIs expecting data primarily via query params.
  const response = await apiService.post(endpoint, {}); 
  const jsonData = await response.json();

  const validationResult = MapCardApiResponseSchema.safeParse(jsonData);

  if (!validationResult.success) {
    // Log the validation error for debugging
    console.error('API response validation failed for map card:', validationResult.error.format());
    // Attempt to parse as a known error response, or throw a generic error
    const errorParseResult = MapCardErrorResponseSchema.safeParse(jsonData);
    if(errorParseResult.success) {
        throw new Error(errorParseResult.data.message || 'Card mapping API response validation failed.');
    }
    throw new Error('Card mapping API response validation failed and error structure is unknown.');
  }

  if (!validationResult.data.success) {
    // Handle cases where the API itself indicates an operation failure (e.g., success: false in response body)
    console.error('API returned an error for map card:', validationResult.data.message);
    throw new Error(validationResult.data.message || 'Card mapping operation failed as indicated by API.');
  }

  // Return the nested card data upon successful mapping
  return validationResult.data.data.data; 
};

export function useMapCard(
  options?: UseMutationOptions<MappedCardData, Error, MapCardRequestParams>
) {
  const apiService = useApiService();
  const queryClient = useQueryClient();

  return useMutation<MappedCardData, Error, MapCardRequestParams>(
    {
      mutationKey: CARD_QUERY_KEYS.mapCard(), // Optional: if you need to identify this mutation by key
      mutationFn: (params: MapCardRequestParams) => mapCardToUser(params, apiService),
      onSuccess: (data, variables, context) => {
        // Invalidate queries that should be refetched after a successful card mapping
        // For example, if you have a query for user details that might include card info:
        // queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.detail(variables.userId) });
        // Or a list of user cards:
        // queryClient.invalidateQueries({ queryKey: CARD_QUERY_KEYS.details() });
        
        console.log('Card mapped successfully:', data);
        if (options?.onSuccess) {
          options.onSuccess(data, variables, context);
        }
      },
      onError: (error, variables, context) => {
        console.error('Error mapping card:', error.message);
        if (options?.onError) {
          options.onError(error, variables, context);
        }
      },
      // You can spread other options here if needed
      ...options,
    }
  );
} 