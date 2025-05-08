import '../global.css';
import { Stack } from 'expo-router';
import { PrivyProvider, PrivyElements, usePrivy, useIdentityToken } from '@privy-io/expo';
import { useEffect } from 'react';
import NetworkStatus from '../components/toasts/NetworkStatus';
import { CryptoDepositProvider } from '../components/context/CryptoDepositContext';
import { apiService } from '../api';

// Initialize API configuration and set up
function ApiInitializer() {
  const privy = usePrivy();
  const { getIdentityToken } = useIdentityToken();
  
  useEffect(() => {
    // Only initialize once privy is ready and not null
    if (privy && privy.isReady) {
      // Check if the token provider has the expected methods
      const hasAccessToken = typeof privy.getAccessToken === 'function';
      
      console.log('=== Privy Token Provider Initialization ===');
      console.log('Privy Ready:', privy.isReady);
      console.log('User Authenticated:', !!privy.user);
      console.log('Has getAccessToken method:', hasAccessToken);
      console.log('Has getIdentityToken hook:', !!getIdentityToken);
      console.log('=== End Privy Token Provider Initialization ===');

      // Test the tokens functionality
      async function testTokens() {
        try {
          if (hasAccessToken) {
            const accessToken = await privy.getAccessToken();
            console.log('Access Token Test Result:', accessToken ? 'Success' : 'Failed (null returned)');
          }

          if (getIdentityToken) {
            const identityToken = await getIdentityToken();
            console.log('Identity Token Test Result:', identityToken ? 'Success' : 'Failed (null returned)');
          }
        } catch (error) {
          console.error('Error testing tokens:', error);
        }
      }

      if (privy.user) {
        testTokens();
      }

      // Create an enhanced provider that includes both the Privy instance and the getIdentityToken function
      const enhancedProvider = {
        ...privy,
        getIdentityToken: getIdentityToken
      };

      // Initialize the API service with the enhanced token provider
      apiService.setTokenProvider(enhancedProvider);
      console.log('API service initialized with enhanced Privy token provider');
    }
  }, [privy, privy?.isReady, privy?.user, getIdentityToken]);

  return null;
}

export default function RootLayout() {
  // Get Privy app ID and client ID directly from environment variables
  // Ensure these are defined in your .env file and prefixed correctly (e.g., EXPO_PUBLIC_)
  const privyAppId = process.env.EXPO_PUBLIC_PRIVY_APP_ID || '';
  const privyClientId = process.env.EXPO_PUBLIC_PRIVY_CLIENT_ID || '';

  useEffect(() => {
    // Log API base URL for debugging
    console.log('=== API Configuration Debug ===');
    console.log('API Base URL from ENV:', process.env.EXPO_PUBLIC_API_BASE_URL);
    console.log('=== End API Configuration Debug ===');
    
    console.log('=== Privy Configuration Debug ===');
    console.log('Privy App ID from ENV:', privyAppId);
    console.log('Privy Client ID from ENV:', privyClientId);
    // Removed logging Expo Constants as it's not relevant for Privy IDs anymore
    console.log('=== End Privy Configuration Debug ===');

    // Optional: Add a check to ensure the environment variables are loaded
    if (!privyAppId || !privyClientId) {
      console.warn(
        'Privy App ID or Client ID not found in environment variables. ' +
          'Ensure EXPO_PUBLIC_PRIVY_APP_ID and EXPO_PUBLIC_PRIVY_CLIENT_ID are set in your .env file.'
      );
    }
  }, [privyAppId, privyClientId]);

  // Ensure PrivyProvider receives valid strings
  if (!privyAppId || !privyClientId) {
    // Optionally render a loading state or error message if IDs are missing
    console.error('Privy IDs are missing from environment variables!');
    // Return null or an error component to prevent app crash
    return null;
  }

  return (
    <PrivyProvider 
      appId={privyAppId} 
      clientId={privyClientId}
      config={{
        embedded: {
          solana: {
            createOnLogin: 'users-without-wallets', // Create wallets automatically for users who don't have one
          },
          ethereum: {
            createOnLogin: 'users-without-wallets', // Create wallets automatically for users who don't have one
          },
        },
      }}
    >
      {/* Initialize API service with Privy token provider */}
      <ApiInitializer />
      
      <CryptoDepositProvider>
        {/* Network status toast notification */}
        <NetworkStatus />

        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#f7f7f7' },
          }}
        >
          <Stack.Screen name="(tab)" options={{ headerShown: false }} />
        </Stack>
      </CryptoDepositProvider>
      <PrivyElements />
    </PrivyProvider>
  );
}
