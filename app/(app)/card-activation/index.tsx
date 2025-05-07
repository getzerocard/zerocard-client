import { useEffect } from 'react';
import { useRouter, Redirect } from 'expo-router';

export default function CardActivationIndex() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to QR scanner when this route is accessed directly
    router.replace('/(app)/card-activation/qr-scanner');
  }, [router]);

  // Use Redirect as a fallback if the useEffect doesn't trigger
  return <Redirect href="/(app)/card-activation/qr-scanner" />;
}
