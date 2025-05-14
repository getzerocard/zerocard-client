
import { useQuery, type UseQueryResult, type UseQueryOptions } from '@tanstack/react-query';
import { useApiService } from '../api'; // Corrected import path
import {
  CardTokenData,
  CardTokenApiResponseSchema,
} from '../../types/cardToken';

// Helper function to fetch the card token
const fetchCardToken = async (
  apiService: ReturnType<typeof useApiService>
  // identityToken: string // No longer needed here, apiService handles it
): Promise<CardTokenData> => {
  const logStyle = "font-weight: bold; font-size: 1.1em; color: purple;";
  const detailStyle = "color: darkblue; font-style: italic;";
  const tokenStyle = "color: green; font-weight: bold;";
  const errorStyle = "color: red; font-weight: bold;";

  console.log(`%c===========GET TOKEN==========`, logStyle);
  console.log(`%c[fetchCardToken] Attempting to fetch card token.`, detailStyle);
  // The x-identity-token is now handled by the global apiService
  // console.log(`%c[fetchCardToken] x-identity-token will be applied by apiService.`, detailStyle);

  try {
    // apiService.get from your api.ts returns a Response object
    // It also automatically handles x-identity-token and Authorization headers
    const response = await apiService.get('/cards/me/token-info'); 
    // No need to pass headers here, useApiService handles it.
    // The fetchWithTokens in your api.ts defaults useIdentityTokenFlag to true.

    const responseData = await response.json(); // Parse JSON from the response

    console.log('%c[fetchCardToken] Raw Parsed API Response:', detailStyle, responseData);

    const validationResult = CardTokenApiResponseSchema.safeParse(responseData);

    if (!validationResult.success) {
      console.error(
        `%c[fetchCardToken] Zod validation failed:`, errorStyle,
        validationResult.error.issues
      );
      console.error('%c[fetchCardToken] Data that failed validation:', errorStyle, responseData);
      throw new Error('Card token API response validation failed');
    }
    
    const tokenData = validationResult.data.data; 

    console.log(
      `%c[fetchCardToken] Successfully fetched and validated. Token: %c${tokenData.token}`,
      detailStyle,
      tokenStyle
    );
    console.log(`%c============END GET TOKEN=============`, logStyle);
    return tokenData;

  } catch (error) {
    console.error(`%c[fetchCardToken] Error during token fetch or processing:`, errorStyle, error);
    console.log(`%c============END GET TOKEN (WITH ERROR)=============`, logStyle);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while fetching card token.');
  }
};

interface UseGetCardTokenHookOptions {
  // identityToken is still useful for the `enabled` flag and query key, 
  // even if not passed directly to fetchCardToken, as apiService uses a context provider for it.
  identityToken: string | null | undefined; 
  enabled?: boolean; 
  onSuccess?: (data: CardTokenData) => void; 
  onError?: (error: Error) => void;         
}

type CardTokenQueryKey = readonly [string, string | null | undefined];

export const useGetCardToken = ({
  identityToken, // Used for queryKey and enabled logic
  enabled = true,
}: UseGetCardTokenHookOptions): UseQueryResult<CardTokenData, Error> => {
  const apiService = useApiService();

  const queryOptions: Omit<UseQueryOptions<CardTokenData, Error, CardTokenData, CardTokenQueryKey>, 'initialData'> = {
    queryKey: ['cardToken', identityToken], // identityToken helps ensure query refetches if it changes
    queryFn: () => fetchCardToken(apiService), // identityToken no longer passed here
    enabled: !!identityToken && enabled, // Query only runs if identityToken from context is expected to be ready
    staleTime: 1000 * 60 * 4, 
    gcTime: 1000 * 60 * 5, 
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  };

  return useQuery(queryOptions);
=======
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