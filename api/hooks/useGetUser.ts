import { useQuery, UseQueryResult, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApiService } from '../../common/hooks/useApiService';

const STORAGE_KEY = 'user_profile';

// Type for the actual user profile data
export type UserProfile = {
  username: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  cardOrderStatus?: string;
  cardId?: string | null;
  // Add any other fields that are part of the user object from /users/me
};

// Type for the overall API response structure
export type UserApiResponse = {
  data: UserProfile; // The actual user data is nested here
  message?: string;
  success?: boolean;
  statusCode?: number;
};

const fetchUser = async (apiService: ReturnType<typeof useApiService>): Promise<UserApiResponse> => {
  console.log('[useGetUser - fetchUser] Starting to fetch user...');
  try {
  const response = await apiService.get('/users/me?sync=true');
    console.log('[useGetUser - fetchUser] Received response from apiService. Status:', response.status);

    const apiResponseData: UserApiResponse = await response.json();

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(apiResponseData));
    console.log('[useGetUser - fetchUser] AsyncStorage item set successfully for key:', STORAGE_KEY);
    return apiResponseData;
  } catch (error) {
    console.error('[useGetUser - fetchUser] Error during fetchUser:', error);
    throw error; 
  }
};

export const useGetUser = (): UseQueryResult<UserApiResponse | undefined, Error> => {
  const apiService = useApiService();
  const queryClient = useQueryClient();
  console.log('[useGetUser] Hook called, apiService instantiated.');

  const queryKey = ['user', 'me'] as const;

  return useQuery<UserApiResponse, Error, UserApiResponse | undefined, typeof queryKey>({
    queryKey: queryKey,
    queryFn: () => fetchUser(apiService),
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 1,
    initialData: () => {
      const cachedData = queryClient.getQueryData<UserApiResponse>(queryKey);
      if (cachedData) {
        console.log('[useGetUser - initialData] Found data in React Query cache for key:', queryKey);
        return cachedData;
      }
      console.log('[useGetUser - initialData] No data found in React Query cache for key:', queryKey);
      return undefined;
    },
  });
}; 