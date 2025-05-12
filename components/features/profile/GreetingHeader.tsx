import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ImageSourcePropType, Platform } from 'react-native';
import { router, useRouter } from 'expo-router';
import * as Localization from 'expo-localization';

import { useUserWalletAddress } from '../../../common/hooks/useUserWalletAddress';
import { Web3Avatar } from '../../ui/Avatar';

interface GreetingHeaderProps {
  username: string;
  profileImage?: ImageSourcePropType;
  initial?: string;
  onProfilePress?: () => void;
}

export default function GreetingHeader({
  username,
  profileImage,
  initial = 'U',
  onProfilePress,
}: GreetingHeaderProps) {
  // Get real wallet address using our hook
  const walletAddress = useUserWalletAddress();

  // Get current time to determine greeting based on user's timezone
  const getGreeting = () => {
    try {
      const calendars = Localization.getCalendars();
      const timeZone = calendars?.[0]?.timeZone || undefined;
      const now = new Date();

      const formatter = new Intl.DateTimeFormat(undefined, {
        hour: 'numeric',
        hour12: false,
        timeZone: timeZone,
      });

      const hourString = formatter.format(now);
      const hour = parseInt(hourString, 10);

      console.log(`[GreetingHeader] Detected Timezone: ${timeZone}, Current Hour: ${hour}`);

      if (isNaN(hour)) {
        console.warn('[GreetingHeader] Failed to parse hour from Intl.DateTimeFormat.');
        const fallbackHour = new Date().getHours();
        if (fallbackHour < 12) return 'Good morning';
        if (fallbackHour < 18) return 'Good afternoon';
        return 'Good evening';
      }

      if (hour < 12) return 'Good morning';
      if (hour < 18) return 'Good afternoon';
      return 'Good evening';
    } catch (error) {
      console.error('[GreetingHeader] Error getting localized greeting:', error);
      const fallbackHour = new Date().getHours();
      if (fallbackHour < 12) return 'Good morning';
      if (fallbackHour < 18) return 'Good afternoon';
      return 'Good evening';
    }
  };

  // Handle profile navigation
  const handleProfilePress = () => {
    if (onProfilePress) {
      onProfilePress();
    } else {
      router.push('/profile');
    }
  };

  // Fallback address in case wallet isn't loaded yet
  const fallbackAddress = '0x0000000000000000000000000000000000000000';

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.profileContainer}
        onPress={handleProfilePress}
        activeOpacity={0.7}>
        {/* Use real wallet address or fallback if not available */}
        <Web3Avatar address={walletAddress || fallbackAddress} size={48} />
      </TouchableOpacity>

      <View style={styles.textContainer}>
        <Text style={styles.greetingText}>{getGreeting()},</Text>
        <Text style={styles.usernameText}>{username}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#CFCFD0',
  },
  initialContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#40ff00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  textContainer: {
    flexDirection: 'column',
    flex: 1,
  },
  greetingText: {
    fontFamily: 'SF Pro Display',
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 19.2,
    color: '#838383',
  },
  usernameText: {
    fontFamily: 'SF Pro Display',
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 19.2,
    color: '#000',
  },
});
