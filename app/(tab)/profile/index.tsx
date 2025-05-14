import React from 'react';
import { View, StyleSheet, ScrollView, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
// import { useFocusEffect } from '@react-navigation/native'; // Removed as it's not used
import ProfileHeader from '../../../components/features/profile/ProfileHeader';
import BasenameDialog from '../../../components/modals/basename/BasenameDialog';
import ProfileSettings from '../../../components/features/profile/ProfileSettings';
import { useGetUser } from '../../../api/hooks/useGetUser';

export default function ProfileScreen() {
  console.log('[ProfileScreen] Component rendering');
  const insets = useSafeAreaInsets();
  const { data: userResponse, isLoading, error } = useGetUser(); // Renamed user to userResponse for clarity

  const profileData = React.useMemo(() => {
    const actualUserData = userResponse?.data;

    if (!actualUserData) {
      return {
        fullName: 'Not set',
        email: 'Not set',
        phone: 'Not set',
        username: 'User',
        spendingLimitDisplay: 'Not set', // Default display when no data
        rawData: null,
        showSpendingLimit: true, // Default to true if no specific card data
      };
    }

    const { firstName, lastName, email, phoneNumber, username, cardOrderStatus, cardId } = actualUserData;
    const fullName = ((firstName || '') + ' ' + (lastName || '')).trim() || 'Not set';
    const showSpendingLimit = !(cardOrderStatus === "not_ordered" && cardId === null);

    return {
      fullName,
      email: email || 'Not set',
      phone: phoneNumber || 'Not set',
      username: username || 'User',
      spendingLimitDisplay: '500 USDC Limit', // Maintained as per existing behavior
      rawData: actualUserData,
      showSpendingLimit,
    };
  }, [userResponse]);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]} edges={['right', 'left']}>
        <ActivityIndicator size="large" />
        <Text>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    // Log the full error object for better debugging
    console.error("[ProfileScreen] Error loading profile:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    return (
      <SafeAreaView style={[styles.container, styles.centered]} edges={['right', 'left']}>
        <Text>Error loading profile. Please try again.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingTop: Math.max(24, insets.top),
          paddingBottom: Math.max(40, insets.bottom + 20),
        }}
        showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <ProfileHeader 
            username={profileData.username}
          />
          <BasenameDialog />
          <View style={styles.settingsContainer}>
            <ProfileSettings 
              fullName={profileData.fullName} 
              email={profileData.email} 
              phone={profileData.phone}
              spendingLimitDisplay={profileData.spendingLimitDisplay}
              showSpendingLimit={profileData.showSpendingLimit}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    paddingBottom: 100,
    paddingTop: 24,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  settingsContainer: {
    marginTop: 8,
    width: '100%',
  },
});
