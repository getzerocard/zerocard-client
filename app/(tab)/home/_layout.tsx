import React from 'react';
import { Stack } from 'expo-router';
import { Text, Platform } from 'react-native';

export default function HomeLayout() {
  console.log('Rendering HomeLayout');

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen
        name="index"
        options={
          {
            // Index is the default screen
          }
        }
      />
    </Stack>
  );
}
