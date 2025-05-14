import * as React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useUserContext } from '../../../providers/UserProvider';

export default function PostAuthScreen() {
  const router = useRouter();
  const { isLoadingUserCreation } = useUserContext();

  // Auto-navigate to home screen after user creation is complete
  useEffect(() => {
    let timer: NodeJS.Timeout;
    // Only proceed if user creation is done
    if (!isLoadingUserCreation) {
      console.log('[PostAuthScreen] User creation complete. Proceeding to home after delay.');
      timer = setTimeout(() => {
        console.log('[PostAuthScreen] Navigating to home.');
        router.push('/(tab)/home');
      }, 3000); // 3 seconds delay
    } else {
      // This else block can be simplified or removed if no specific logging is needed for the loading state here
      console.log('[PostAuthScreen] Waiting for user creation to complete...');
    }

    return () => {
      // console.log('[PostAuthScreen] useEffect cleanup: Clearing timer.'); // Optional: less verbose logging
      clearTimeout(timer);
    };
  }, [isLoadingUserCreation, router]);

  // Show loading state
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#2D2D2D" />
      <Text style={styles.signingInText}>Creating user</Text>
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
  signingInText: {
    fontFamily: 'System',
    fontWeight: '500',
    fontSize: 16,
    marginTop: 10, // Added margin for spacing from spinner
    color: '#1f1f1f',
  },
}); 