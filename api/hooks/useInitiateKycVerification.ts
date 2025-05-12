import { useMutation } from '@tanstack/react-query';
import { useApiService } from '../../common/hooks/useApiService';

// Variables needed for the API call body
interface InitiateKycVerificationBody {
  identityType: string;
  number: string;
}

// Expected structure of the 'data' field in the API response
interface InitiateKycVerificationData {
  verificationId: string;
  verificationNumber: string;
}

interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export const useInitiateKycVerification = () => {
  const apiService = useApiService();

  return useMutation<
    InitiateKycVerificationData, // Type of data returned on success
    Error,                       // Type of error
    InitiateKycVerificationBody  // Type of variables passed to mutate function
  >({
    mutationFn: async (body: InitiateKycVerificationBody) => {
      // userId is no longer in variables for URL, API infers from token with /me
      const response = await apiService.post(
        `/kyc/initiate-verification?userId=me`, // Updated endpoint with query parameter
        body
      );
      const jsonResponse: ApiResponse<InitiateKycVerificationData> = await response.json();
      
      if (!jsonResponse.success || response.status >= 400) {
        // Custom error for 400-500 range
        if (response.status >= 400 && response.status < 600) {
          throw new Error('Service unavailable');
        }
        // Original error logic for other cases
        throw new Error(jsonResponse.message || `HTTP error! status: ${response.status}`);
      }
      return jsonResponse.data; // Return the nested data object
    },
    mutationKey: ['initiateKycVerification'],
  });
}; 