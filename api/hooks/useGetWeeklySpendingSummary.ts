import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useApiService } from '../api';
import {
  WeeklySpendingSummaryApiResponseSchema,
  WeeklySpendingSummaryData,
} from '../../types/transactions';
import { TRANSACTION_QUERY_KEYS } from '../../constants/queryKeys';

const fetchWeeklySpendingSummary = async (
  apiService: ReturnType<typeof useApiService>
): Promise<WeeklySpendingSummaryData> => {
  const response = await apiService.get('/transactions/me/spending-summary/weekly');
  const jsonData = await response.json();
  const validationResult = WeeklySpendingSummaryApiResponseSchema.safeParse(jsonData);

  if (!validationResult.success) {
    console.error('API response validation failed for weekly spending summary:', validationResult.error.format());
    throw new Error('Failed to validate weekly spending summary data from API.');
  }

  if (!validationResult.data.success) {
    console.error('API returned an error for weekly spending summary:', validationResult.data.message);
    throw new Error(validationResult.data.message || 'API returned an unsuccessful response for weekly spending summary.');
  }
  return validationResult.data.data;
};

export interface UseGetWeeklySpendingSummaryOptions {
    enabled?: boolean;
    // Add other react-query options if needed, like onSuccess, onError, etc.
}

export function useGetWeeklySpendingSummary(
  options?: Omit<
    UseQueryOptions<
      WeeklySpendingSummaryData, 
      Error, 
      WeeklySpendingSummaryData, 
      ReturnType<typeof TRANSACTION_QUERY_KEYS.weeklySummary>
    >,
    'queryKey' | 'queryFn' // Exclude queryKey and queryFn as they are provided by the hook
  >
) {
  const apiService = useApiService();

  return useQuery({
    queryKey: TRANSACTION_QUERY_KEYS.weeklySummary(),
    queryFn: () => fetchWeeklySpendingSummary(apiService),
    ...options, // Spread the provided options
  });
} 