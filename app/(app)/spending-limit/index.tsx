import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { SvgXml } from 'react-native-svg';
import SpendingLimitInput from '../../../components/features/spending/SpendingLimitInput'; // Import the new component

// Import back arrow icon SVG from DOBInput
const backArrowIconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M15 19.9201L8.47997 13.4001C7.70997 12.6301 7.70997 11.3701 8.47997 10.6001L15 4.08008" stroke="#A4A4A4" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

export default function SpendingLimitScreen() {
  const router = useRouter();
  const [currentLimit, setCurrentLimit] = useState(1000); // Mock current limit
  const [userBalance, setUserBalance] = useState(2500); // Mock user balance

  const handleBack = () => {
    router.back();
  };

  const handleSetNewLimit = (newLimit: number) => {
    console.log(`New spending limit set: ${newLimit}`);
    // Here you would typically call an API to update the limit
    // For now, we'll just navigate back
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <SvgXml xml={backArrowIconSvg} width={24} height={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Set spending limit</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Replace the previous content with the SpendingLimitInput component */}
      <SpendingLimitInput 
        initialLimit={currentLimit}
        balance={userBalance}
        onSetLimit={handleSetNewLimit}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1f1f1f',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1f1f1f',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },
  placeholder: {
    width: 40, // Same width as back button for centering
  },
  // Removed old content styles, as they are now in SpendingLimitInput
}); 