import { useEffect } from 'react';
import { useHeadlessDelegatedActions } from '@privy-io/expo';
import { useUserWalletAddress } from '../hooks/useUserWalletAddress';

interface User {
  wallet?: {
    address: string;
  };
  id?: string;
  [key: string]: any;
}

const useWalletDelegation = (user: User | null, setDelegationAttempted: (value: boolean) => void) => {
  const { delegateWallet } = useHeadlessDelegatedActions();
  const walletAddress = useUserWalletAddress();

  useEffect(() => {
    if (user) {
      console.log('Full user object:', JSON.stringify(user, null, 2));
      console.log('User ID:', user.id || 'Not available');
    }

    if (user && !walletAddress) {
      console.log('No wallet address found for delegation');
      setDelegationAttempted(true);
      return;
    }

    if (user && walletAddress) {
      delegateWallet({ address: walletAddress, chainType: 'ethereum' })
        .then(() => {
          console.log(`Successfully delegated wallet: ${walletAddress} on ethereum (Base)`);
          if (user) {
            console.log('User details after delegation:');
            console.log('User ID:', user.id || 'Not available');
            console.log('Full user object after delegation:', JSON.stringify(user, null, 2));
          }
          setDelegationAttempted(true);
        })
        .catch((error) => {
          console.error(`Failed to delegate wallet: ${walletAddress}`, error);
          setDelegationAttempted(true);
        });
    }
  }, [user, walletAddress, delegateWallet, setDelegationAttempted]);
};

export default useWalletDelegation; 