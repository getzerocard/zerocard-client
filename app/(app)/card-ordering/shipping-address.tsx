import React from 'react';
import { SafeAreaView, StyleSheet, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import ShippingAddress from '../../../components/forms/ShippingAddress';

export default function ShippingAddressScreen() {
  console.log('SHIPPINGADDRESSSCREEN: RENDERING');
  const isAndroid = Platform.OS === 'android';
  const params = useLocalSearchParams();
  const identity = params.identity as string;

  const handleClose = () => {
    console.log('SHIPPINGADDRESSSCREEN: HANDLE CLOSE CALLED');
    router.back();
  };

  const handleBack = () => {
    console.log('SHIPPINGADDRESSSCREEN: HANDLE BACK CALLED');
    router.back();
  };

  const handleContinue = (addressData: any) => {
    console.log('SHIPPINGADDRESSSCREEN: HANDLE CONTINUE CALLED, ADDRESSDATA:', JSON.stringify(addressData));
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