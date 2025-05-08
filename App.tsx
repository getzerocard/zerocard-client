import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DepositModalProvider } from './common/hooks/useDepositModal';
import { UsernameModalProvider } from './common/hooks/useUsernameModal';
import { usePrivy } from '@privy-io/expo';
import { Redirect } from 'expo-router';

// Import the Expo Router entry point
import { RootSiblingParent } from 'react-native-root-siblings';
import { Slot } from 'expo-router';

// AuthGuard component to wrap the entire app
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isReady, user } = usePrivy();

  // Show loading state while Privy initializes
  if (!isReady) {
    return <Redirect href="/" />;
  }

  // If user is not authenticated, redirect to splash screen
  if (!user) {
    return <Redirect href="/" />;
  }

  return <>{children}</>;
}

export default function App() {
  // Example wallet ID - this would come from your authentication system
  const walletId = '0xf235c72e61d7339c76f6b36d8d8c0b6h92F';

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <AuthGuard>
        {/* Global modal providers that work across the entire app */}
        <DepositModalProvider walletId={walletId}>
          <UsernameModalProvider>
            <RootSiblingParent>
              <Slot />
            </RootSiblingParent>
          </UsernameModalProvider>
        </DepositModalProvider>
      </AuthGuard>
    </SafeAreaProvider>
  );
}
