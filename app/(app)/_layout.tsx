import { Stack, Redirect } from 'expo-router';
import { ActivityIndicator, View, Text, StyleSheet, StatusBar } from 'react-native';
import { AuthBoundary } from '@privy-io/expo';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import React from 'react';

// Loading component for AuthBoundary
function FullScreenLoader() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#40ff00" />
    </View>
  );
}

// Error component for AuthBoundary
function ErrorScreen({ error }: { error: Error }) {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Error</Text>
      <Text style={styles.errorMessage}>{error.message}</Text>
    </View>
  );
}

export default function AppLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <AuthBoundary
        loading={<FullScreenLoader />}
        error={(error) => <ErrorScreen error={error} />}
        unauthenticated={<Redirect href="/" />}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#f7f7f7', paddingHorizontal: 16 },
          }}>
          <Stack.Screen
            name="add-money/index"
            options={{
              title: 'Add Money',
            }}
          />
          <Stack.Screen
            name="post-auth"
            options={{
              title: 'Authentication',
            }}
          />
          <Stack.Screen
            name="spending-limit"
            options={{
              title: 'Spending Limit',
              contentStyle: {
                backgroundColor: '#1f1f1f',
                paddingHorizontal: 16,
              },
            }}
          />
          <Stack.Screen
            name="card-activation"
            options={{
              title: 'Card Activation',
              contentStyle: {
                backgroundColor: '#FAFAFA',
                paddingHorizontal: 0,
              },
            }}
          />
          <Stack.Screen
            name="card-ordering"
            options={{
              title: 'Card Ordering',
              contentStyle: { backgroundColor: '#1f1f1f', paddingHorizontal: 0 },
            }}
          />
          <Stack.Screen
            name="withdraw-funds"
            options={{
              title: 'Withdraw Funds',
              contentStyle: { backgroundColor: '#1f1f1f', paddingHorizontal: 0 },
            }}
          />
        </Stack>
      </AuthBoundary>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
});
