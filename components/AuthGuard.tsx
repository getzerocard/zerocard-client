import { useRouter } from 'expo-router';
import { usePrivy } from '@privy-io/expo';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

function AuthGuard() {
  const { isReady, user } = usePrivy();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Set a flag to indicate component is mounted, delaying navigation check
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && isReady && !user) {
      router.replace('/');
    }
    // Navigation for authenticated users is handled by UserProvider
  }, [isMounted, isReady, user, router]);

  return null;
}

export default AuthGuard; 