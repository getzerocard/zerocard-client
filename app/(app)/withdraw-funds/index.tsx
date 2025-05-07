import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import WithdrawForm from '../../../components/features/withdraw/WithdrawForm';

export default function WithdrawScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.contentContainer}>
          <WithdrawForm />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1f1f1f', // Match layout background
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1, // Ensure content can grow to fill scrollview
    justifyContent: 'flex-start', // Changed from space-between
    paddingTop: 80, // Adjust as needed (replaces absolute top: 90px)
    paddingBottom: 20, // Add some padding at the bottom
  },
  contentContainer: {
    flex: 1, // Allow inner container to take available space
    justifyContent: 'flex-start', // Align form to top
    gap: 20, // Add some gap between elements if needed
  },
});
