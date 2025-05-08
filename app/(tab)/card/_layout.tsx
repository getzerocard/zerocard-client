import { Stack } from 'expo-router';
import React from 'react';

export default function CardLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      {/* Add other screens within the card tab here if needed */}
    </Stack>
  );
} 