import React from 'react';
import { SafeAreaView, StyleSheet, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import OrderConfirmation from '../../../components/features/card/OrderConfirmation';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function OrderConfirmationScreen() {
  const isAndroid = Platform.OS === 'android';
  const params = useLocalSearchParams();
  const identity = params.identity as string;

  const handleBackToHome = async () => {
    try {
      // Save that the card has been ordered and username verified
      await AsyncStorage.setItem('user_verified', 'true');
      await AsyncStorage.setItem('card_ordered', 'true');

      // If we have identity information, save it
      if (identity) {
        await AsyncStorage.setItem('identity_type', identity);
      }

      // Navigate back to home
      router.replace('/(tab)/home');
    } catch (error) {
      console.error('Error saving user verification state:', error);
      // Still navigate even if saving fails
      router.replace('/(tab)/home');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <OrderConfirmation onBackHome={handleBackToHome} />
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