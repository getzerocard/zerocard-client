import { useQuery } from '@tanstack/react-query';

interface UseGetTokenRateParams {
  token: string; // e.g., 'USDC'
  fiat: string;  // e.g., 'NGN'
}

interface RateApiResponse {
  message: string;
  status: string;
  data: string; // The exchange rate, e.g., "1500"
}

interface RateApiError {
  message: string;
  status?: string; // Optional, depending on error structure
}

export interface TokenRateData {
  rawRate: string;
  effectiveRate: string;
  deductionPercentageApplied: number;
}

const fetchTokenRate = async (params: UseGetTokenRateParams): Promise<TokenRateData> => {
  const { token, fiat } = params;
  const baseRateUrl = process.env.EXPO_PUBLIC_RATE_ORACLE;

  if (!baseRateUrl) {
    console.error('[useGetTokenRate] EXPO_PUBLIC_RATE_ORACLE is not defined in environment variables.');
    throw new Error('Rate service URL is not configured.');
  }

  const amountForRateFetch = '1';
  const endpoint = `${baseRateUrl}/rates/${token}/${amountForRateFetch}/${fiat}`;

  console.log('[useGetTokenRate] Fetching raw rate from:', endpoint);
  const response = await fetch(endpoint);

  if (!response.ok) {
    let errorData: RateApiError = { message: `Request failed with status ${response.status}` };
    try {
      const parsedError = await response.json();
      errorData = { ...errorData, ...parsedError };
    } catch (e) {
      // Ignore if response is not JSON
    }
    console.error('[useGetTokenRate] Fetching raw rate failed:', errorData);
    throw new Error(errorData.message || 'Failed to fetch token rate.');
  }

  const result: RateApiResponse = await response.json();

  if (result.status !== 'success' || typeof result.data !== 'string') {
    console.error('[useGetTokenRate] Invalid rate API response structure:', result);
    throw new Error('Invalid rate data received from API.');
  }
  
  const rawRateValue = parseFloat(result.data);
  if (isNaN(rawRateValue)) {
    console.error('[useGetTokenRate] Raw rate from API is not a valid number:', result.data);
    throw new Error('Invalid numeric rate data received from API.');
  }
  console.log('[useGetTokenRate] Raw rate fetched (numeric):', rawRateValue);

  const deductionPercentageString = process.env.EXPO_PUBLIC_RATE_CALCULATOR || '0';
  let deductionPercentage = parseFloat(deductionPercentageString);

  if (isNaN(deductionPercentage)) {
    console.warn('[useGetTokenRate] Invalid EXPO_PUBLIC_RATE_CALCULATOR value:', deductionPercentageString, '. Defaulting to 0% deduction.');
    deductionPercentage = 0;
  }

  const effectiveRateValue = rawRateValue * (1 - deductionPercentage / 100);
  console.log(`[useGetTokenRate] Deduction: ${deductionPercentage}%, Effective rate calculated:`, effectiveRateValue);

  return {
    rawRate: rawRateValue.toString(),
    effectiveRate: effectiveRateValue.toString(),
    deductionPercentageApplied: deductionPercentage,
  };
};

export function useGetTokenRate(params: UseGetTokenRateParams, options: { enabled?: boolean } = {}) {
  const queryKey = ['tokenRate', params.token, params.fiat];

  return useQuery<TokenRateData, Error>({
    queryKey: queryKey,
    queryFn: () => fetchTokenRate(params),
    enabled: options.enabled,
    staleTime: 1000 * 60 * 5, // Cache rate for 5 minutes
    refetchOnWindowFocus: false,
  });
} 