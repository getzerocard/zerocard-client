import { useQuery } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApiService } from '../../common/hooks/useApiService';

const STORAGE_KEY = 'user_profile';

const fetchUser = async (apiService: ReturnType<typeof useApiService>) => {
  const response = await apiService.get('/users/me?sync=true');
  const data = await response.json();
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
};

export const useGetUser = () => {
  const apiService = useApiService();

  return useQuery({
    queryKey: ['user'],
    queryFn: () => fetchUser(apiService),
    staleTime: 1000 * 60 * 2,
    refetchOnMount: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 1,
    refetchInterval: 2000,
    initialData: async () => {
      const cached = await AsyncStorage.getItem(STORAGE_KEY);
      return cached ? JSON.parse(cached) : undefined;
    },
  });
}; 