import '../global.css';
import { Slot, useNavigationContainerRef } from 'expo-router';
import { PrivyProvider, PrivyElements } from '@privy-io/expo';
import { useEffect } from 'react';
import NetworkStatus from '../components/toasts/NetworkStatus';
import { CryptoDepositProvider } from '../components/context/CryptoDepositContext';
import AuthGuard from '../components/AuthGuard';
import { IdentityTokenProvider } from './(app)/context/identityTokenContexts';
import { AccessTokenProvider } from './(app)/context/accessTokenContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DepositModalProvider } from '../common/hooks/useDepositModal';
import { RootSiblingParent } from 'react-native-root-siblings';
import { StatusBar } from 'expo-status-bar';
import { UserProvider } from '../providers/UserProvider';
import { useUsernameModal } from '../components/modals/username/hooks/useUsernameModal';
import * as Sentry from '@sentry/react-native';
import { isRunningInExpoGo } from 'expo'; // Assuming 'expo' is the correct package, adjust if it's from 'expo-constants' or similar

const queryClient = new QueryClient();

// Construct a new integration instance. This is needed to communicate between the integration and React
const navigationIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: !isRunningInExpoGo(),
});

Sentry.init({
  dsn: 'https://c6c72c53c6e039ade7110d872476bcfa@o4509333824143360.ingest.us.sentry.io/4509333826109440',
  debug: process.env.NODE_ENV === 'development', // Enable debug logging in development
  tracesSampleRate: 1.0, // Capture 100% of transactions for tracing. Adjust in production.
  integrations: [navigationIntegration],
  enableNativeFramesTracking: !isRunningInExpoGo(), // Tracks slow and frozen frames
});

// New Wrapper component for modals that need context
const GlobalModals = () => {
  const { ModalComponent, modalProps } = useUsernameModal(); // Called within context
  if (!ModalComponent || !modalProps) {
    return null; // Or some placeholder/loading if preferred during init
  }
  return <ModalComponent {...modalProps} />;
};

function RootLayoutInternal() {
  // Get Privy app ID and client ID directly from environment variables
  // Ensure these are defined in your .env file and prefixed correctly (e.g., EXPO_PUBLIC_)
  const privyAppId = process.env.EXPO_PUBLIC_PRIVY_APP_ID || '';
  const privyClientId = process.env.EXPO_PUBLIC_PRIVY_CLIENT_ID || '';

  // Capture the NavigationContainer ref and register it with the integration.
  const ref = useNavigationContainerRef();

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

    if (ref) {
      // Check if ref is not null/undefined before accessing current
      navigationIntegration.registerNavigationContainer(ref);
    }
  }, [privyAppId, privyClientId, ref]);

  // Ensure PrivyProvider receives valid strings
  if (!privyAppId || !privyClientId) {
    // Optionally render a loading state or error message if IDs are missing
    console.error('Privy IDs are missing from environment variables!');
    // Return null or an error component to prevent app crash
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <QueryClientProvider client={queryClient}>
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
          }}>
          <AccessTokenProvider>
            <IdentityTokenProvider>
              <UserProvider>
                <CryptoDepositProvider>
                  {/* Network status toast notification */}
                  <NetworkStatus />

                  <DepositModalProvider walletId="">
                    <RootSiblingParent>
                      <AuthGuard />
                      <Slot />
                      {/* Render the Username Modal globally via wrapper component */}
                      <GlobalModals />
                    </RootSiblingParent>
                  </DepositModalProvider>
                </CryptoDepositProvider>
                <PrivyElements />
              </UserProvider>
            </IdentityTokenProvider>
          </AccessTokenProvider>
        </PrivyProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

export default Sentry.wrap(RootLayoutInternal);
