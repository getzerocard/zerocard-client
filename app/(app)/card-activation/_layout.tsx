import { Stack } from 'expo-router';

export default function CardActivationLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#FAFAFA' },
      }}
    />
  );
}
