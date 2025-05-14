import React from 'react';
import { SafeAreaView, StyleSheet, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import IdentityVerification from '../../../components/forms/IdentityVerification';

export default function IdentityVerificationScreen() {
  const isAndroid = Platform.OS === 'android';
  const params = useLocalSearchParams();
  // This param seems unused now, consider removing if not needed elsewhere
  // const identity = params.identity as string; 

  const handleClose = () => {
    router.back();
  };

  // handleVerify is now removed as navigation is internal to the component
  // const handleVerify = (idType: string, idNumber: string) => {
  //   console.log('Identity verified:', idType, idNumber);
  //   router.push('/(app)/card-ordering/order-confirmation');
  // };

  return (
    <SafeAreaView style={styles.container}>
      {/* Remove the onVerify prop */}
      <IdentityVerification onClose={handleClose} /> 
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