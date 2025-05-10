import { useMutation } from '@tanstack/react-query';
import { useApiService } from '../../common/hooks/useApiService';

type CreateUserResponse = {
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
  isNewUser: boolean;
};

export const useCreateUser = () => {
  const apiService = useApiService();

  return useMutation<CreateUserResponse, Error>({
    mutationFn: async () => {
      const response = await apiService.post('/users/me', {});
      return response.json();
    },
    mutationKey: ['createUser'],
  });
};
