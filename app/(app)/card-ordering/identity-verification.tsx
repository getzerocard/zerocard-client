import React from 'react';
import { SafeAreaView, StyleSheet, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import IdentityVerification from '../../../components/forms/IdentityVerification';

export default function IdentityVerificationScreen() {
  const isAndroid = Platform.OS === 'android';
  const params = useLocalSearchParams();
  const identity = params.identity as string;

  const handleClose = () => {
    router.back();
  };

  const handleVerify = (idType: string, idNumber: string) => {
    // Use absolute path instead of relative path for more reliable navigation
    console.log('Identity verified:', idType, idNumber);
    router.push('/(app)/card-ordering/order-confirmation');
  };

  return (
    <SafeAreaView style={styles.container}>
      <IdentityVerification onClose={handleClose} onVerify={handleVerify} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F1F1F',
    paddingTop: 20,
  },
}); 