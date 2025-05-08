import * as React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { usePrivy } from '@privy-io/expo';
import { useFonts } from 'expo-font';
import { useUserAccount } from '../../../common/hooks';

export default function PostAuthScreen() {
  const router = useRouter();
  const privyContext = usePrivy() as any;
  const { user } = privyContext;
  const { 
    completeAuthentication, 
    authStage, 
    isLoading, 
    error, 
    statusMessage, 
    delegatedChains 
  } = useUserAccount();

  // Load the RockSalt font
  const [fontsLoaded] = useFonts({
    'RockSalt': require('../../../assets/fonts/RockSalt-Regular.ttf'),
  });

  // Run the complete authentication flow when component mounts
  useEffect(() => {
    const runAuthentication = async () => {
      if (user) {
        // We need to capture the authStage *after* completeAuthentication has run
        // to make a navigation decision, so we can't rely on the authStage from the hook's outer scope here directly
        // as it might be stale if this effect doesn't re-run on authStage changes.
        // Instead, completeAuthentication should ideally signal completion robustly.
        const success = await completeAuthentication();
        
        // Re-fetch the latest authStage from the hook after the async operation
        // This isn't ideal, ideally the hook would return the final stage or success would be more definitive
        // For now, we assume completeAuthentication sets the stage correctly and we check it post-call.
        // A better fix might involve completeAuthentication returning the final stage or a more complex state object.
        if (success) { // We can check the hook's authStage here if needed, but success should be primary
          router.push('/(tab)/home');
        }
      }
    };
    
    runAuthentication();
  }, [user, completeAuthentication, router]); // Removed authStage

  // If fonts are still loading, show a basic loading indicator
  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2D2D2D" />
        <Text style={styles.loadingText}>Loading fonts...</Text>
      </View>
    );
  }

  // Render appropriate UI based on the current auth stage
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#40ff00" />
      
      {authStage === 'error' ? (
        <View style={styles.statusContainer}>
          <Text style={styles.errorText}>Error: {error?.message || 'Something went wrong'}</Text>
          <Text style={styles.subText}>Please try again later</Text>
        </View>
      ) : (
        <View style={styles.statusContainer}>
          <Text style={styles.signingInText}>
            {statusMessage}
          </Text>
          
          <Text style={styles.subText}>
            {authStage === 'creating_user' && 'This may take a moment'}
            {authStage === 'delegating_wallets' && 'Securing your wallets'}
            {authStage === 'completed' && 'Redirecting to dashboard'}
            {authStage === 'initializing' && 'Starting setup process'}
          </Text>
          
          {delegatedChains.length > 0 && authStage === 'delegating_wallets' && (
            <View style={styles.progressContainer}>
              {delegatedChains.includes('ethereum') && (
                <Text style={[styles.chainStatus, styles.chainComplete]}>
                  Ethereum: ✓
                </Text>
              )}
              
              {delegatedChains.includes('solana') && (
                <Text style={[styles.chainStatus, styles.chainComplete]}>
                  Solana: ✓
                </Text>
              )}
            </View>
          )}
        </View>
      )}
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
    fontSize: 18,
    color: '#1f1f1f',
    textAlign: 'center',
  },
  statusContainer: {
    marginTop: 20,
    alignItems: 'center',
    padding: 16,
  },
  subText: {
    fontFamily: 'System',
    fontSize: 14,
    marginTop: 8,
    color: '#757575',
    textAlign: 'center',
  },
  errorText: {
    fontFamily: 'System',
    fontWeight: '500',
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
  },
  progressContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  chainStatus: {
    fontFamily: 'System',
    fontSize: 14,
    marginTop: 4,
  },
  chainComplete: {
    color: '#2ecc71',
  },
  chainPending: {
    color: '#95a5a6',
  },
}); 