import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ProfileHeader from '../../../components/features/profile/ProfileHeader';
import BasenameDialog from '../../../components/modals/basename/BasenameDialog';
import ProfileSettings from '../../../components/features/profile/ProfileSettings';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();

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
          <ProfileHeader />
          <BasenameDialog />
          <View style={styles.settingsContainer}>
            <ProfileSettings />
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
