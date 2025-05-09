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
      getIdentityToken
    } as TokenGetters;
  }, [isReady, user, getAccessTokenFn, getIdentityToken]);

  // State to track if apiService is configured
  const [isApiConfigured, setIsApiConfigured] = useState(false);

  useEffect(() => {
    console.log('[ApiInitializer] Effect triggered. Privy ready:', isReady, 'getIdentityToken available:', typeof getIdentityToken === 'function');
    
    // Prevent reconfiguration if already done
    if (isApiConfigured) {
      console.log('[ApiInitializer] ApiService already configured, skipping...');
      return;
    }

    // Add a delay to ensure everything is initialized
    const timer = setTimeout(async () => {
      if (tokenAccessors && apiService && user) {
        console.log('[ApiInitializer] Configuring ApiService with token accessors after delay...');
        console.log('[ApiInitializer] apiService imported:', !!apiService);
        // Fetch tokens to ensure they are available before configuration
        let identityToken = null;
        let accessToken = null;
        if (tokenAccessors.getIdentityToken) {
          identityToken = await tokenAccessors.getIdentityToken();
        }
        if (tokenAccessors.getAccessToken) {
          accessToken = await tokenAccessors.getAccessToken();
        }
        if (identityToken && accessToken) {
          apiService.setTokenAccessors(tokenAccessors);
          console.log('[ApiInitializer] ApiService token accessors configured successfully with both tokens available.');
          setIsApiConfigured(true);
        } else {
          console.log('[ApiInitializer] Tokens not yet available. Identity Token:', identityToken ? 'Available' : 'Not available', 'Access Token:', accessToken ? 'Available' : 'Not available');
          // Retry if tokens are not available
          setApiInitAttempts(prev => prev + 1);
        }
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
        setApiInitAttempts(prev => prev + 1);
      }
    }, 1000); // Delay of 1 second to ensure initialization
    
    return () => clearTimeout(timer);
  }, [tokenAccessors, isReady, user, getIdentityToken, apiInitAttempts, isApiConfigured]);

  return isApiConfigured;
}

export default function RootLayout() {
  // Get Privy app ID and client ID directly from environment variables
  // Ensure these are defined in your .env file and prefixed correctly (e.g., EXPO_PUBLIC_)
  const privyAppId = process.env.EXPO_PUBLIC_PRIVY_APP_ID || '';
  const privyClientId = process.env.EXPO_PUBLIC_PRIVY_CLIENT_ID || '';

  const [isPrivyReady, setIsPrivyReady] = useState(false);
  const [privyUser, setPrivyUser] = useState<any>(null);

  useEffect(() => {
    // Log API base URL for debugging
    console.log('=== API Configuration Debug ===');
    console.log('API Base URL from ENV:', process.env.EXPO_PUBLIC_API_BASE_URL);
    console.log('=== End API Configuration Debug ===');
    
    console.log('=== Privy Configuration Debug ===');
    console.log('Privy App ID from ENV:', privyAppId);
    console.log('Privy Client ID from ENV:', privyClientId);
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

  const PrivyStatusChecker = () => {
    const privy = usePrivy();
    useEffect(() => {
      if (privy) {
        setIsPrivyReady(privy.isReady);
        setPrivyUser(privy.user);
        console.log('[PrivyStatusChecker] Privy is ready:', privy.isReady, 'User:', privy.user ? 'Available' : 'Not available');
      }
    }, [privy, privy?.isReady, privy?.user]);
    return null;
  };

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
      <PrivyStatusChecker />
      {/* Initialize API service with Privy token provider only when Privy is ready */}
      {isPrivyReady && privyUser && <ApiInitializer /> && (
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
      )}
      <PrivyElements />
    </PrivyProvider>
  );
}
