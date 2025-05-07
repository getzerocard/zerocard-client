import { Stack } from 'expo-router';
import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function WithdrawLayout() {
  return (
    <View style={styles.container}>
      <Stack
        screenOptions={{
          headerShown: false, // Hide the default header
          contentStyle: styles.content, // Apply background color here
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1f1f1f', // Apply background to the root container
  },
  content: {
    flex: 1,
    backgroundColor: '#1f1f1f', // Ensure stack content also has the background
    paddingHorizontal: 24,
  },
});
