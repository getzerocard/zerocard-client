import { Stack } from 'expo-router';
import React from 'react';

export default function AddMoneyLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{
          title: 'Add Money',
          // You can add other header options here, for example:
          // headerStyle: { backgroundColor: '#f4511e' },
          // headerTintColor: '#fff',
          // headerTitleStyle: {
          //   fontWeight: 'bold',
          // },
        }}
      />
    </Stack>
  );
} 