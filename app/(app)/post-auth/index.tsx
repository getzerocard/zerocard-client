import * as React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useHeadlessDelegatedActions, usePrivy } from '@privy-io/expo';
import { useUserWallets } from '../../../common/hooks/useUserWalletAddress';
import { useFonts } from 'expo-font';
import { useSyncUser } from '../../../common/hooks/useSyncUser';

export default function PostAuthScreen() {
  const router = useRouter();
  const { delegateWallet } = useHeadlessDelegatedActions();
  const wallets = useUserWallets();
  const privyContext = usePrivy() as any;
  const { user } = privyContext;
  const { syncUser, isLoading: isSyncing, error: syncError } = useSyncUser();

  // Load the RockSalt font
  const [fontsLoaded] = useFonts({
    'RockSalt': require('../../../assets/fonts/RockSalt-Regular.ttf'),
  });

  // Function to log detailed user information
  const logUserDetails = () => {
    if (user) {
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
    } else {
      console.log('No user object available after delegation');
    }
  };

  // Auto-navigate to home screen after authentication and delegation
  useEffect(() => {
    async function postAuthFlow() {
      console.log('[PostAuth] Starting post-auth workflow');
      // Step 1: sync or create user on backend
      console.log('[PostAuth] Syncing user with backend');
      const parsed = await syncUser();
      if (parsed) {
        console.log('[PostAuth] User sync successful:', parsed);
      } else {
        console.warn('[PostAuth] User sync failed:', syncError);
      }
      // Step 2: delegate wallets
      console.log('[PostAuth] Starting wallet delegation');
      const delegationPromises: Promise<string>[] = [];

      // Only attempt to delegate Ethereum wallet if we have an Ethereum wallet address
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

      // Only attempt to delegate Solana wallet if we have a Solana wallet address
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

      if (delegationPromises.length > 0) {
        // Run all available delegations concurrently
        Promise.allSettled(delegationPromises)
          .then((results) => {
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
        // If no wallet addresses are available, delay briefly then continue
        const timer = setTimeout(() => {
          console.log('No wallet addresses found for delegation, proceeding to home');
          router.push('/(tab)/home');
        }, 2000); // 2 seconds delay if no wallet address

        return () => clearTimeout(timer);
      }
    }
    postAuthFlow();
  }, [router, wallets, delegateWallet, user, syncUser]);

  // If fonts are still loading, show a basic loading indicator
  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2D2D2D" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Show syncing state if user sync is in progress
  if (isSyncing) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2D2D2D" />
        <Text style={styles.signingInText}>Syncing user...</Text>
      </View>
    );
  }
  // Show delegation/loading state
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
    marginTop: 10, // Added margin for spacing from spinner
    color: '#1f1f1f',
  },
}); 