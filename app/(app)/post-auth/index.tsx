import * as React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useHeadlessDelegatedActions, usePrivy } from '@privy-io/expo';
import { useUserWallets } from '../../../common/hooks/useUserWalletAddress';
import { useFonts } from 'expo-font';
import { useSyncUser } from '../../../api/createSyncUser';

export default function PostAuthScreen() {
  const router = useRouter();
  const { delegateWallet } = useHeadlessDelegatedActions();
  const wallets = useUserWallets();
  const { user } = usePrivy() as any;
  const { syncUser, isLoading: isSyncing, error: syncError } = useSyncUser();

  // Load the RockSalt font
  const [fontsLoaded] = useFonts({
    'RockSalt': require('../../../assets/fonts/RockSalt-Regular.ttf'),
  });

  // Function to log detailed user information
  const logUserDetails = () => {
    if (!user) {
      console.log('No user object available after delegation');
      return;
    }

    console.log('=== USER DETAILS AFTER DELEGATION ===');
    console.log('User ID:', user.id || 'Not available');
    
    // Log wallet information
    if (user.wallet) {
      console.log('Wallet address:', user.wallet.address);
      console.log('Wallet delegated:', user.wallet.delegated ? 'Yes' : 'No');
    }
    
    // Log linked accounts if available
    if (user.linkedAccounts) {
      console.log('Linked accounts count:', user.linkedAccounts.length);
      user.linkedAccounts.forEach((account: any, index: number) => {
        console.log(`Account ${index + 1}:`, account);
      });
    }
    
    // Log any embedded wallets
    if (user.embeddedWallets) {
      console.log('Embedded wallets count:', user.embeddedWallets.length);
      user.embeddedWallets.forEach((wallet: any, index: number) => {
        console.log(`Wallet ${index + 1}:`, wallet);
      });
    }
    
    console.log('Full user object:', JSON.stringify(user, null, 2));
    console.log('=== END USER DETAILS ===');
  };

  // Handle wallet delegation for Ethereum and Solana
  const delegateWallets = async () => {
    const delegationPromises: Promise<string>[] = [];

    // Delegate Ethereum wallet if available
    if (wallets.ethereum) {
      delegationPromises.push(
        delegateWallet({ address: wallets.ethereum, chainType: 'ethereum' })
          .then(() => {
            console.log(`Successfully delegated Ethereum wallet: ${wallets.ethereum}`);
            return 'ethereum';
          })
          .catch((error) => {
            console.error(`Failed to delegate wallet on Ethereum: ${wallets.ethereum}`, error);
            return Promise.reject('ethereum');
          })
      );
    }

    // Delegate Solana wallet if available
    if (wallets.solana) {
      delegationPromises.push(
        delegateWallet({ address: wallets.solana, chainType: 'solana' })
          .then(() => {
            console.log(`Successfully delegated Solana wallet: ${wallets.solana}`);
            return 'solana';
          })
          .catch((error) => {
            console.error(`Failed to delegate wallet on Solana: ${wallets.solana}`, error);
            return Promise.reject('solana');
          })
      );
    }

    return delegationPromises;
  };

  // Handle navigation after delegation
  const handleNavigation = (delegationPromises: Promise<string>[]) => {
    if (delegationPromises.length > 0) {
      Promise.allSettled(delegationPromises).then((results) => {
        logUserDetails();
        const successes = results.filter(r => r.status === 'fulfilled');
        if (successes.length > 0) {
          console.log('Successfully delegated wallets:', 
            successes.map(r => (r as PromiseFulfilledResult<string>).value).join(', '));
        } else {
          console.log('No wallet delegations succeeded');
        }
        router.push('/(tab)/home');
      });
    } else {
      const timer = setTimeout(() => {
        console.log('No wallet addresses found for delegation, proceeding to home');
        router.push('/(tab)/home');
      }, 2000);
      return () => clearTimeout(timer);
    }
  };

  // Auto-navigate to home screen after authentication and delegation
  useEffect(() => {
    async function postAuthFlow() {
      console.log('[PostAuth] Starting post-auth workflow');
      // Step 1: Sync or create user on backend
      console.log('[PostAuth] Syncing user with backend');
      const parsed = await syncUser();
      if (parsed) {
        console.log('[PostAuth] User sync successful:', parsed);
      } else {
        console.warn('[PostAuth] User sync failed:', syncError);
      }
      // Step 2: Delegate wallets
      console.log('[PostAuth] Starting wallet delegation');
      const delegationPromises = await delegateWallets();
      // Step 3: Navigate based on delegation results
      handleNavigation(delegationPromises);
    }
    postAuthFlow();
  }, [router, wallets, delegateWallet, user, syncUser, syncError]);

  // Render loading state if fonts are not loaded
  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2D2D2D" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Render syncing state if user sync is in progress
  if (isSyncing) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2D2D2D" />
        <Text style={styles.signingInText}>Syncing user...</Text>
      </View>
    );
  }

  // Render delegation/loading state
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#2D2D2D" />
      <Text style={styles.signingInText}>Signing in</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  loadingText: {
    fontFamily: 'System',
    fontSize: 16,
    marginTop: 10,
    color: '#2D2D2D',
  },
  signingInText: {
    fontFamily: 'System',
    fontWeight: '500',
    fontSize: 16,
    marginTop: 10,
    color: '#1f1f1f',
  },
}); 