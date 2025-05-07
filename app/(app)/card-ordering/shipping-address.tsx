import React from 'react';
import { SafeAreaView, StyleSheet, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import ShippingAddress from '../../../components/forms/ShippingAddress';

export default function ShippingAddressScreen() {
  const isAndroid = Platform.OS === 'android';
  const params = useLocalSearchParams();
  const identity = params.identity as string;

  const handleClose = () => {
    router.back();
  };

  const handleBack = () => {
    router.back();
  };

  const handleContinue = (addressData: any) => {
    // Use absolute path instead of relative path for more reliable navigation
    router.push('/(app)/card-ordering/identity-verification');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ShippingAddress 
        onClose={handleClose} 
        onBack={handleBack} 
        onContinue={handleContinue} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    paddingTop: 20,
  },
}); 