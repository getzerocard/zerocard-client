import { useMutation } from '@tanstack/react-query';
import { useApiService } from '../../common/hooks/useApiService';

// Variables passed into the mutate function
interface ValidateKycOtpVariables {
  // userId is removed, inferred by /me endpoint
  identityType: string;     // e.g., "BVN"
  otp: string;              // User-entered OTP
  storedVerificationId: string; // From the initiate step response (store)
  storedIdentityNumber: string; // From the initiate step response (store)
}

// Expected structure of the 'data' field in the API response for successful OTP validation
interface ValidateKycOtpData {
  status: string; // e.g., "SUCCESS"
  verified: boolean;
  userId: string;
  firstName: string;
  lastName: string;
  dob: string; // Date of birth, e.g., "1990-01-01"
  identity: {
    type: string; // e.g., "BVN"
    number: string;
  };
}

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
      const { 
        // userId is removed
        identityType, 
        otp, 
        storedVerificationId, 
        storedIdentityNumber 
      } = variables;
      
      const body = {
        identityType: identityType,
        verification_id: storedVerificationId, 
        otp: otp,
        identity_number: storedIdentityNumber,
      };

      // Changed endpoint to /kyc/validate-otp/me - NOW UPDATING to query param
      const response = await apiService.post(
        `/kyc/validate-otp?userId=me`,
        body
      );
      // Always attempt to parse JSON, even on HTTP error status
      let jsonResponse: ApiResponse<ValidateKycOtpData | null>; 
      try {
        jsonResponse = await response.json();
      } catch (e) {
        // If JSON parsing fails on an error response, throw a generic HTTP error
        if (!response.ok) { // Use response.ok (true if status is 200-299)
           throw new Error(`HTTP error! status: ${response.status}`);
        }
        // If JSON parsing fails on a success response, rethrow the parsing error
        throw e; 
      }

      // Check for business logic errors (success: false) or HTTP errors
      if (!response.ok || !jsonResponse.success) {
        // Use the message from the JSON if available, otherwise a generic HTTP error
        throw new Error(jsonResponse?.message || `HTTP error! status: ${response.status}`);
      }

      // Check for non-null data on success (add type safety)
      if (!jsonResponse.data) {
          throw new Error('Successful response but missing data.');
      }
      
      // Removed the specific check for data.verified/status here, 
      // as success:false is handled above and component handles logical failures in onSuccess

      return jsonResponse.data;
    },
    mutationKey: ['validateKycOtp'],
  });
}; 