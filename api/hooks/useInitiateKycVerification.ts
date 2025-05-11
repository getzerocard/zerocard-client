import { useMutation } from '@tanstack/react-query';
import { useApiService } from '../../common/hooks/useApiService';

interface InitiateKycVerificationVariables {
  userId: string;
  identityType: string;
  number: string;
}

// This can be 'any' or a more specific type if the structure of 'data' is known for this endpoint
type InitiateKycVerificationData = any; 

interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export const useInitiateKycVerification = () => {
  const apiService = useApiService();

  return useMutation<
    InitiateKycVerificationData,
    Error,
    InitiateKycVerificationVariables
  >({
    mutationFn: async (variables: InitiateKycVerificationVariables) => {
      const { userId, ...body } = variables;
      const response = await apiService.post(
        `/kyc/initiate-verification?userId=${encodeURIComponent(userId)}`,
        body
      );
      const jsonResponse: ApiResponse<InitiateKycVerificationData> = await response.json();
      
      // Check for both application-level errors (via jsonResponse.success) 
      // and HTTP-level errors (via response.status)
      if (!jsonResponse.success || response.status >= 400) {
        throw new Error(jsonResponse.message || `HTTP error! status: ${response.status}`);
      }
      return jsonResponse.data;
    },
    mutationKey: ['initiateKycVerification'],
  });
}; 