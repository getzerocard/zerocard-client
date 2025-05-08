import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import { useUserAccount } from '../../common/hooks';

/**
 * Button component that handles user account creation/sync with the backend
 */
export function AccountSyncButton() {
  const { createOrSyncUser, isLoading, error, userData } = useUserAccount();

  const handleSync = async () => {
    const result = await createOrSyncUser();
    if (result) {
      console.log('User sync completed:', result);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleSync}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.buttonText}>
            {userData ? 'Sync Account' : 'Create Account'}
          </Text>
        )}
      </TouchableOpacity>

      {error && (
        <Text style={styles.errorText}>{error.message}</Text>
      )}

      {userData && (
        <View style={styles.userInfo}>
          <Text style={styles.userInfoLabel}>Account Status:</Text>
          <Text style={styles.userInfoText}>
            {userData.isNewUser ? 'New account created' : 'Existing account synced'}
          </Text>
          <Text style={styles.userInfoLabel}>User ID:</Text>
          <Text style={styles.userInfoText}>{userData.userId}</Text>
          <Text style={styles.userInfoLabel}>Email:</Text>
          <Text style={styles.userInfoText}>{userData.email}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  button: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#7f8c8d',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  errorText: {
    color: '#e74c3c',
    marginTop: 8,
    fontSize: 14,
  },
  userInfo: {
    marginTop: 16,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  userInfoLabel: {
    fontWeight: '600',
    marginTop: 4,
  },
  userInfoText: {
    marginBottom: 8,
  },
}); 