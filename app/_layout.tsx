import '../global.css';
import { Stack } from 'expo-router';
import {
  PrivyProvider,
  PrivyElements,
  usePrivy,
  useIdentityToken,
} from '@privy-io/expo';
import { useEffect, useMemo, useState } from 'react';
import NetworkStatus from '../components/toasts/NetworkStatus';
import { CryptoDepositProvider } from '../components/context/CryptoDepositContext';
import { apiService } from '../api';
import { TokenGetters } from '../common/utils/handleToken';

// Import apiService directly for initialization check
import '../api/api';

// Initialize API configuration and set up
function ApiInitializer() {
  const privy = usePrivy();
  const { getIdentityToken } = useIdentityToken();
  const [apiInitAttempts, setApiInitAttempts] = useState(0);

  // Check if apiService is initialized
  useEffect(() => {
    console.log('[ApiInitializer] Initializing apiService check, attempt:', apiInitAttempts);
    
    if (!apiService) {
      console.error('[ApiInitializer] apiService is undefined on initialization check.');
      // Try again after a delay, up to 5 attempts
      if (apiInitAttempts < 5) {
        const timer = setTimeout(() => {
          setApiInitAttempts(prev => prev + 1);
        }, 1000);
        return () => clearTimeout(timer);
      }
    } else {
      console.log('[ApiInitializer] apiService is defined and ready for configuration.');
    }
  }, [apiInitAttempts]);

  // Memoize values to prevent re-renders
  const isReady = useMemo(() => privy?.isReady, [privy?.isReady]);
  const user = useMemo(() => privy?.user, [privy?.user]);
  const getAccessTokenFn = useMemo(() => 
    typeof privy?.getAccessToken === 'function' ? privy.getAccessToken : null, 
    [privy]
  );

  // Memoize the token accessors to create a stable reference
  const tokenAccessors = useMemo(() => {
    // Only create the accessors when all dependencies are available
    if (!isReady || !user || !getAccessTokenFn || typeof getIdentityToken !== 'function') {
      return null;
    }

    return {
      getAccessToken: async () => {
        try {
          console.log('[ApiInitializer] Calling privy.getAccessToken()...');
          const token = await getAccessTokenFn();
          console.log('[ApiInitializer] Access token from privy.getAccessToken():', token ? 'Retrieved' : 'null');
          return token;
        } catch (error) {
          console.error('[ApiInitializer] Error in privy.getAccessToken() wrapper:', error);
          return null;
        }
      },
      getIdentityToken,
      // Add the session token getter
      getSessionToken: async () => {
        try {
          // In Privy, we need to find the right method for session tokens
          // First check if privy has any session or auth token method
          if (privy) {
            // Use type assertion and optional chaining for safety
            const privyAny = privy as any;
            if (typeof privyAny?.getSessionToken === 'function') {
              console.log('[ApiInitializer] Calling privy.getSessionToken()...');
              return await privyAny.getSessionToken();
            } else if (typeof privyAny?.getAuthToken === 'function') {
              console.log('[ApiInitializer] Calling privy.getAuthToken()...');
              return await privyAny.getAuthToken();
            } else if (typeof privyAny?.getSession === 'function') {
              console.log('[ApiInitializer] Calling privy.getSession()...');
              const session = await privyAny.getSession();
              // Return token from session if available
              return session?.token || null;
            }
          }
          
          console.log('[ApiInitializer] No session token method available, falling back to identity token...');
          return null;
        } catch (error) {
          console.error('[ApiInitializer] Error getting session token:', error);
          return null;
        }
      }
    } as TokenGetters;
  }, [isReady, user, getAccessTokenFn, getIdentityToken]);

  useEffect(() => {
    console.log('[ApiInitializer] Effect triggered. Privy ready:', isReady, 'getIdentityToken available:', typeof getIdentityToken === 'function');
    
    // Add a delay to ensure everything is initialized
    const timer = setTimeout(() => {
      if (tokenAccessors && apiService) {
        console.log('[ApiInitializer] Configuring ApiService with token accessors after delay...');
        console.log('[ApiInitializer] apiService imported:', !!apiService);
        apiService.setTokenAccessors(tokenAccessors);
        console.log('[ApiInitializer] ApiService token accessors configured successfully.');
      } else if (!apiService) {
        console.error('[ApiInitializer] Error: apiService is still undefined after delay. Cannot configure token accessors.');
        // Attempt to reinitialize by triggering a state update
        setApiInitAttempts(prev => prev + 1);
      } else {
        let logReason = '[ApiInitializer] Conditions not met for ApiService configuration after delay:';
        if (!isReady) logReason += ' Privy not ready;';
        if (!user) logReason += ' No Privy user;';
        if (!getAccessTokenFn) logReason += ' getAccessToken not available;';
        if (typeof getIdentityToken !== 'function') logReason += ' getIdentityToken not a function;';
        console.log(logReason);
      }
    }, 1000); // Delay of 1 second to ensure initialization
    
    return () => clearTimeout(timer);
  }, [tokenAccessors, isReady, user, getIdentityToken, apiInitAttempts]);

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
