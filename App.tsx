import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DepositModalProvider } from './hooks/useDepositModal';
import { UsernameModalProvider } from './hooks/useUsernameModal';

// Import the Expo Router entry point
import { RootSiblingParent } from 'react-native-root-siblings';
import { Slot } from 'expo-router';

export default function App() {
  // Example wallet ID - this would come from your authentication system
  const walletId = '0xf235c72e61d7339c76f6b36d8d8c0b6h92F';

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />

      {/* Global modal providers that work across the entire app */}
      <DepositModalProvider walletId={walletId}>
        <UsernameModalProvider>
          <RootSiblingParent>
            <Slot />
          </RootSiblingParent>
        </UsernameModalProvider>
      </DepositModalProvider>
    </SafeAreaProvider>
  );
}
