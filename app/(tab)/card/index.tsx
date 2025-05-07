import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Platform,
  Alert,
  Clipboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SpendingHabit from '../../../components/features/spending/SpendingHabit';
import CardControls from '../../../components/features/card/CardControls';
import CardDetails from '../../../components/features/card/CardDetails';  
import CardModule from '../../../components/features/card/CardModule';
import * as LocalAuthentication from 'expo-local-authentication';

export default function CardScreen() {
  const insets = useSafeAreaInsets();

  const handleLoadCard = () => console.log('Load Card pressed');
  const handleWithdraw = () => console.log('Withdraw pressed');
  const handleFreezeCard = () => console.log('Freeze Card pressed');
  
  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Your zerocard</Text>
        </View>

        {/* Replace old Card Display with CardModule */}
        <View style={styles.cardModuleWrapper}> 
          <CardModule />
        </View>

        {/* Card Controls */}
        <View style={styles.newControlsContainer}>
          <Text style={styles.newControlsTitle}>Card control</Text>
          <CardControls 
            onLoadCard={handleLoadCard} 
            onFreezeCard={handleFreezeCard}
          />
        </View>

        {/* Spending Habit */}
        <SpendingHabit />
        
        {/* Card Details - Using the new component */}
        <CardDetails cardData={{
          cardHolder: 'Temidayo Folajin',
          cardNumber: '1234 5678 9101 1213',
          expiry: '13/25',
          cvv: '452',
        }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: 16,
    paddingBottom: 200, // Extra padding for bottom navigation
  },
  header: {
    marginVertical: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  
  cardModuleWrapper: {
    marginBottom: 24, // Keep the margin from the old card container
    alignItems: 'center', // Center the CardModule if needed
  },
  newControlsContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 24,
  },
  newControlsTitle: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 19,
    color: '#121212',
    alignSelf: 'stretch',
  },
});
