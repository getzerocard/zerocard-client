import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ImageSourcePropType } from 'react-native';
import { router } from 'expo-router';

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

  // Get current time to determine greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Handle profile navigation
  const handleProfilePress = () => {
    if (onProfilePress) {
      onProfilePress();
    } else {
      router.push('/(tab)/profile/index');
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
