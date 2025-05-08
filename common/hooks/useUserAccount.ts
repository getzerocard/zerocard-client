import { useState, useCallback } from 'react';
import apiService from '../../api/api';
import { usePrivy, useHeadlessDelegatedActions } from '@privy-io/expo';
import { useUserWallets } from './useUserWalletAddress';

/**
 * Response type from user creation/sync endpoint
 */
interface UserResponse {
  userId: string;
  userType: string;
  timeCreated: string;
  timeUpdated: string;
  walletAddresses: {
    ethereum?: string;
    solana?: string;
    bitcoin?: string;
    tron?: string;
  };
  email: string;
  isNewUser: boolean;
}

/**
 * Authentication process stages
 */
export type AuthStage = 'initializing' | 'creating_user' | 'delegating_wallets' | 'completed' | 'error';

/**
 * Hook for managing user account operations and wallet delegation
 */
export function useUserAccount() {
  const privy = usePrivy();
  const { delegateWallet } = useHeadlessDelegatedActions();
  const wallets = useUserWallets();
  
  // State for tracking the overall process
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [userData, setUserData] = useState<UserResponse | null>(null);
  const [authStage, setAuthStage] = useState<AuthStage>('initializing');
  const [statusMessage, setStatusMessage] = useState('Initializing your account...');
  const [delegatedChains, setDelegatedChains] = useState<string[]>([]);

  const privyReady = privy.isReady;
  const privyUserId = privy.user?.id;

  /**
   * Log detailed user information for debugging
   */
  const logUserDetails = useCallback(() => {
    const user = privy.user;
    if (user) {
      console.log('=== USER DETAILS AFTER DELEGATION ===');
      console.log('User ID:', user.id || 'Not available');
      
      // Log full user object
      console.log('Full user object:', user);
      console.log('=== END USER DETAILS ===');
    } else {
      console.log('No user object available after delegation');
    }
  }, [privy.user]);

  /**
   * Create or sync user account with backend
   * This uses the authenticated user's identity to create or update the user record
   */
  const createOrSyncUser = useCallback(async (): Promise<UserResponse | null> => {
    if (!privyReady) {
      const err = new Error('Authentication not ready. Please log in first.');
      setError(err);
      setAuthStage('error');
      return null;
    }

    if (authStage === 'creating_user' && isLoading) {
        console.log('createOrSyncUser: Already in progress, skipping.');
        return null;
    }

    setIsLoading(true);
    setError(null);
    setAuthStage('creating_user');
    setStatusMessage('Creating your account...');
    
    console.log('=== User Account Creation Process Started ===');
    console.log('Privy Authentication Status: Authenticated');
    console.log('Privy User ID:', privyUserId);
    
    try {
      const response = await apiService.createOrSyncUser();
      setUserData(response);
      
      console.log('=== User Account Creation Result ===');
      console.log('Status: SUCCESS ✅');
      console.log('User Type:', response.userType);
      console.log('User ID:', response.userId);
      console.log('Email:', response.email);
      console.log('Account Status:', response.isNewUser ? 'NEWLY CREATED' : 'EXISTING ACCOUNT SYNCED');
      console.log('Time Created:', response.timeCreated);
      console.log('Time Updated:', response.timeUpdated);
      console.log('Wallet Addresses:');
      Object.entries(response.walletAddresses || {}).forEach(([chain, address]) => {
        console.log(`  - ${chain}: ${address}`);
      });
      
      return response;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to create or sync user');
      console.log('=== User Account Creation Error ===');
      console.log('Status: ERROR ❌');
      console.log('Error Message:', err.message);
      
      setError(err);
      setAuthStage('error');
      return null;
    } finally {
      console.log('=== End User Account Creation Process ===');
    }
  }, [privyReady, privyUserId, authStage, isLoading]);

  /**
   * Delegate wallets for the authenticated user
   * Attempts to delegate both Ethereum and Solana wallets if available
   */
  const delegateUserWallets = useCallback(async (): Promise<boolean> => {
    if (!privy.user) {
      const err = new Error('No authenticated user found');
      setError(err);
      setAuthStage('error');
      return false;
    }

    setIsLoading(true);
    setAuthStage('delegating_wallets');
    setStatusMessage('Setting up your wallets...');
    
    const delegationPromises = [];
    let hasWallets = false;

    // Only attempt to delegate Ethereum wallet if we have an Ethereum wallet address
    if (wallets.ethereum && !delegatedChains.includes('ethereum')) {
      hasWallets = true;
      delegationPromises.push(
        delegateWallet({ address: wallets.ethereum, chainType: 'ethereum' })
          .then(() => {
            console.log(`Successfully delegated Ethereum wallet: ${wallets.ethereum}`);
            setDelegatedChains(prev => [...prev, 'ethereum']);
            return 'ethereum';
          })
          .catch((error) => {
            console.error(`Failed to delegate wallet on Ethereum: ${wallets.ethereum}`, error);
            return Promise.reject('ethereum');
          })
      );
    }

    // Only attempt to delegate Solana wallet if we have a Solana wallet address
    if (wallets.solana && !delegatedChains.includes('solana')) {
      hasWallets = true;
      delegationPromises.push(
        delegateWallet({ address: wallets.solana, chainType: 'solana' })
          .then(() => {
            console.log(`Successfully delegated Solana wallet: ${wallets.solana}`);
            setDelegatedChains(prev => [...prev, 'solana']);
            return 'solana';
          })
          .catch((error) => {
            console.error(`Failed to delegate wallet on Solana: ${wallets.solana}`, error);
            return Promise.reject('solana');
          })
      );
    }

    try {
      if (delegationPromises.length > 0) {
        // Run all available delegations concurrently
        const results = await Promise.allSettled(delegationPromises);
        
        const successes = results.filter(r => r.status === 'fulfilled');
        if (successes.length > 0) {
          console.log('Successfully delegated wallets:', 
            successes.map(r => (r as PromiseFulfilledResult<string>).value).join(', '));
          
          setAuthStage('completed');
          setStatusMessage('Account ready!');
          logUserDetails();
          return true;
        } else {
          console.log('No wallet delegations succeeded');
          setAuthStage('error');
          setError(new Error('Failed to delegate wallets'));
          return false;
        }
      } else if (hasWallets) {
        // All wallets already delegated
        console.log('Wallets already delegated');
        setAuthStage('completed');
        setStatusMessage('Account ready!');
        logUserDetails();
        return true;
      } else {
        // No wallets available to delegate
        console.log('No wallet addresses found for delegation');
        setAuthStage('completed');
        setStatusMessage('Account ready!');
        return true;
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to delegate wallets');
      setError(err);
      setAuthStage('error');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [privy.user, wallets, delegateWallet, delegatedChains, logUserDetails]);

  /**
   * Complete authentication flow:
   * 1. Create/sync user
   * 2. Delegate wallets
   * 
   * This is the main function that components should call
   * to handle the full authentication process
   */
  const completeAuthentication = useCallback(async (): Promise<boolean> => {
    // Guard: Prevent re-entry if already processing or definitively finished
    if (isLoading || authStage === 'completed' || (authStage === 'error' && error !== null)) {
      console.log(`Skipping completeAuthentication. Current stage: ${authStage}, isLoading: ${isLoading}, error: ${error !== null}`);
      return authStage === 'completed' && !error; // Return true if already successfully completed
    }
    
    setIsLoading(true);
    setError(null);
    setAuthStage('initializing');
    setStatusMessage('Initializing your account...');
    
    try {
      const userResult = await createOrSyncUser();
      if (!userResult) {
        setIsLoading(false); 
        return false;
      }
      
      const delegationSuccessful = await delegateUserWallets();
      
      if (delegationSuccessful) {
        setAuthStage('completed'); 
        setStatusMessage('Account ready!');
        logUserDetails();
        setIsLoading(false);
        return true;
      } else {
        if (authStage !== 'error') {
            console.warn('Delegation reported failure but stage was not error. Setting to error.', authStage);
            setAuthStage('error');
            setError(new Error('Wallet delegation failed.'));
            setStatusMessage('Wallet delegation failed.');
        }
        setIsLoading(false);
        return false;
      }
    } catch (err) { 
      const e = err instanceof Error ? err : new Error('Overall authentication process failed.');
      console.error('Critical error in completeAuthentication:', e);
      setError(e);
      setAuthStage('error');
      setStatusMessage(`Error: ${e.message}`);
      setIsLoading(false);
      return false;
    }
  }, [
    createOrSyncUser,
    delegateUserWallets, 
    isLoading, 
    authStage, 
    error, 
    logUserDetails,
  ]);

  return {
    // Status
    authStage,
    isLoading,
    error,
    statusMessage,
    delegatedChains,
    userData,
    
    // Actions
    createOrSyncUser,
    delegateUserWallets,
    completeAuthentication,
    
    // Auth state
    isAuthenticated: !!privy?.user
  };
} 