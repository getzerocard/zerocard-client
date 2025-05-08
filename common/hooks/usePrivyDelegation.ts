import {
  usePrivy,
  getAllUserEmbeddedEthereumWallets,
  User,
} from '@privy-io/expo';
import React, { useState, useCallback } from 'react';

// Locally defined interface based on usage in Privy docs and expected properties
interface EmbeddedWallet {
  address: string;
  wallet_index?: number; // As seen in find predicate
  delegated?: boolean;   // Key property for delegation check
}

// Custom interface for delegated actions
interface DelegatedWalletActions {
  delegateWallet: (params: { address: string; chainType: string }) => Promise<void>;
}

interface UsePrivyDelegationReturn {
  initiateDelegation: (currentUser: User) => Promise<void>;
  isDelegating: boolean;
  delegationError: Error | null;
}

export function usePrivyDelegation(): UsePrivyDelegationReturn {
  const privy = usePrivy();
  const [isDelegating, setIsDelegating] = useState(false);
  const [delegationError, setDelegationError] = useState<Error | null>(null);

  const initiateDelegation = useCallback(async (currentUser: User) => {
    if (!currentUser) {
      console.log('No user provided for delegation.');
      return;
    }

    const wallets: EmbeddedWallet[] = getAllUserEmbeddedEthereumWallets(currentUser as any) as EmbeddedWallet[];
    
    if (!wallets || wallets.length === 0) {
      console.log('No embedded Ethereum wallets found for the user.');
      return;
    }

    const walletToDelegate = wallets.find((wallet) => wallet.wallet_index === 0) || wallets[0];

    if (!walletToDelegate) {
      console.log('Could not find a suitable wallet to delegate.');
      return;
    }

    if (walletToDelegate.delegated) {
      console.log(`Wallet ${walletToDelegate.address} is already delegated.`);
      return;
    }

    console.log(`Attempting to delegate wallet: ${walletToDelegate.address}`);
    setIsDelegating(true);
    setDelegationError(null);

    try {
      // Access delegateWallet from the privy object using casting
      const privyExt = privy as any;
      
      // Try to get the delegateWallet function from various possible locations
      const delegateWallet = 
        privyExt.delegateWallet || 
        (privyExt.delegatedActions && privyExt.delegatedActions.delegateWallet);
      
      if (!delegateWallet) {
        throw new Error('delegateWallet function not available in Privy SDK');
      }
      
      await delegateWallet({ 
        address: walletToDelegate.address, 
        chainType: 'ethereum' 
      });
      console.log(`Wallet ${walletToDelegate.address} delegation successful.`);
    } catch (error: any) {
      console.error('Delegation failed:', error);
      setDelegationError(error);
    } finally {
      setIsDelegating(false);
    }
  }, [privy]);

  return { initiateDelegation, isDelegating, delegationError };
} 