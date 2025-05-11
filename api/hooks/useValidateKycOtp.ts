import { useMutation } from '@tanstack/react-query';
import { useApiService } from '../../common/hooks/useApiService';

interface ValidateKycOtpVariables {
  userId: string;
  identityType: string;
  identityId: string;
  otp: string;
  number: string;
}

// This can be 'any' or a more specific type if the structure of 'data' is known for this endpoint
type ValidateKycOtpData = any;

interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export const useValidateKycOtp = () => {
  const apiService = useApiService();

  return useMutation<
    ValidateKycOtpData,
    Error,
    ValidateKycOtpVariables
  >({
    mutationFn: async (variables: ValidateKycOtpVariables) => {
      const { userId, ...body } = variables;
      const response = await apiService.post(
        `/kyc/validate-otp?userId=${encodeURIComponent(userId)}`,
        body
      );
      const jsonResponse: ApiResponse<ValidateKycOtpData> = await response.json();

      if (!jsonResponse.success || response.status >= 400) {
        throw new Error(jsonResponse.message || `HTTP error! status: ${response.status}`);
      }
      return jsonResponse.data;
    },
    mutationKey: ['validateKycOtp'],
  });
}; 