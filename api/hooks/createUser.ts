import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiService } from '../../common/hooks/useApiService';

// This type should ideally match the full user profile structure 
// returned by the backend after creating/fetching a user, 
// especially including the username field.
export interface UserProfileResponse { // Renamed for clarity, assuming it's a fuller profile
  userId: string;
  userType: string;
  timeCreated: string;
  timeUpdated: string;
  walletAddresses: {
    ethereum: string;
    solana: string;
    bitcoin: string;
    tron: string;
  };
  email: string;
  isNewUser?: boolean; // This might still be useful or can be derived client-side
  username: string | null; // CRITICAL: Username must be part of this response
  // Add any other fields that come from GET /api/v1/users/me that are useful
  accountNumber?: string;
  accountName?: string;
  profilePicture?: string;
  EVMWalletAddress?: string;
  SolanaWalletAddress?: string;
  BitcoinWalletAddress?: string;
  TronWalletAddress?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string; // Or Date
  phoneNumber?: string;
  // Potentially nested objects like shippingAddress, identification etc.
  verificationStatus?: string;
  cardOrderStatus: string;
  customerId?: string;
  timeZone?: string;
  accountId?: string;
  cardId?: string;
  isMainUser?: boolean;
  createdAt?: string; // Or Date
  updatedAt?: string; // Or Date
  isIdentityVerified?: boolean;
  // ... other fields from your GET /users/me example response
}

export const useCreateUser = () => {
  const apiService = useApiService();
  const queryClient = useQueryClient();

  // The mutation should now expect UserProfileResponse
  return useMutation<UserProfileResponse, Error>({ 
    mutationFn: async () => {
      // This POST /users/me endpoint *must* now return the UserProfileResponse structure
      const response = await apiService.post('/users/me', {}); 
      const responseData = await response.json();
      if (responseData.success && responseData.data) {
        // Assuming responseData.data is now UserProfileResponse
        return responseData.data as UserProfileResponse; 
      } else {
        throw new Error(responseData.message || 'Failed to create/fetch user or received invalid data structure');
      }
    },
    mutationKey: ['createUser'], // This key might be better as ['user', 'profile'] or similar if it fetches profile
    onSuccess: (data) => {
      // When this mutation (often used as a fetch/ensure profile mechanism) succeeds,
      // invalidate the standard query for getting the user profile.
      // This ensures useGetUser hook will refetch and update its cache and AsyncStorage.
      console.log('[useCreateUser] onSuccess: Invalidating [\'user\', \'me\'] query key.');
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    },
  });
};
