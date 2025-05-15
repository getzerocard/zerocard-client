import React from 'react';
import { SafeAreaView, StyleSheet, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import OrderConfirmation from '../../../components/features/card/OrderConfirmation';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function OrderConfirmationScreen() {
  console.log('ORDERCONFIRMATIONSCREEN: RENDERING');
  const isAndroid = Platform.OS === 'android';
  const params = useLocalSearchParams();
  const identity = params.identity as string;

  const handleBackToHome = async () => {
    console.log('ORDERCONFIRMATIONSCREEN: HANDLE BACK TO HOME CALLED');
    try {
      // Save that the card has been ordered and username verified
      console.log('ORDERCONFIRMATIONSCREEN: ATTEMPTING TO SET user_verified AND card_ordered IN ASYNCSTORAGE');
      await AsyncStorage.setItem('user_verified', 'true');
      await AsyncStorage.setItem('card_ordered', 'true');

      // If we have identity information, save it
      if (identity) {
        console.log('ORDERCONFIRMATIONSCREEN: ATTEMPTING TO SET identity_type IN ASYNCSTORAGE, IDENTITY:', identity);
        await AsyncStorage.setItem('identity_type', identity);
      }

      // Navigate back to home
      console.log('ORDERCONFIRMATIONSCREEN: NAVIGATING TO HOME');
      router.replace('/(tab)/home');
    } catch (error) {
      console.error('ORDERCONFIRMATIONSCREEN: ERROR SAVING USER VERIFICATION STATE:', error);
      // Still navigate even if saving fails
      console.log('ORDERCONFIRMATIONSCREEN: NAVIGATING TO HOME DESPITE ERROR');
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