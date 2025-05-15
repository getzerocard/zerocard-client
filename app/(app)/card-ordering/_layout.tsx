import React from 'react';
import { Stack } from 'expo-router';

export default function CardOrderingLayout() {
  console.log('CARDORDERINGLAYOUT: RENDERING');
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
    />
  );
} 