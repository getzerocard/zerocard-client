import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import OrderCardFlow from '../../../components/features/card/OrderCardFlow';

export default function OrderCardPage() {
  const params = useLocalSearchParams();
  const isAndroid = Platform.OS === 'android';

  const handleClose = () => {
    router.back();
  };

  const handleGetStarted = () => {
    // Use absolute path instead of relative path for more reliable navigation
    router.push('/(app)/card-ordering/shipping-address');
  };

  return (
    <SafeAreaView style={styles.container}>
      <OrderCardFlow onClose={handleClose} onGetStarted={handleGetStarted} />
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