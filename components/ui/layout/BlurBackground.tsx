import { BlurView } from 'expo-blur';
import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';

interface BlurBackgroundProps {
  visible: boolean;
  style?: ViewStyle;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
}

/**
 * A component that provides a blurred background for modals
 * Can be used as a direct replacement for the rgba overlay
 */
const BlurBackground: React.FC<BlurBackgroundProps> = ({
  visible,
  style,
  intensity = 50,
  tint = 'dark',
}) => {
  if (!visible) return null;

  return <BlurView intensity={intensity} tint={tint} style={[StyleSheet.absoluteFill, style]} />;
};

export default BlurBackground;
