import * as React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useUserContext } from '../../../providers/UserProvider';

export default function PostAuthScreen() {
  const router = useRouter();
  const { isLoadingUserCreation } = useUserContext();

  // Auto-navigate to home screen after user creation is complete with an additional delay
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!isLoadingUserCreation) {
      timer = setTimeout(() => {
        console.log('Proceeding to home after post-auth');
        router.push('/(tab)/home');
      }, 3000); // 3 seconds delay (2s base + 1s additional) after user creation is complete
    }

    return () => clearTimeout(timer);
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