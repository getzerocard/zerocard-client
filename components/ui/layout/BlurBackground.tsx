import { BlurView } from 'expo-blur';
import React from 'react';
import { StyleSheet, ViewStyle, StatusBar, Platform } from 'react-native';

interface BlurBackgroundProps {
  visible: boolean;
  style?: ViewStyle;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
}

/**
 * A component that provides a blurred background for modals
 * Can be used as a direct replacement for the rgba overlay
 * Properly covers the status bar on Android
 */
const BlurBackground: React.FC<BlurBackgroundProps> = ({
  visible,
  style,
  intensity = 50,
  tint = 'dark',
}) => {
  if (!visible) return null;

  // Create a style that ensures the blur covers the status bar
  const fullScreenStyle = {
    ...StyleSheet.absoluteFillObject,
    // On Android, ensure we start from the very top of the screen including status bar
    top: Platform.OS === 'android' ? -(StatusBar.currentHeight || 0) : 0,
    // Lower zIndex to ensure it doesn't block modal content
    zIndex: 1,
    // This is crucial to keep it as a background only
    elevation: 1,
  };

  return (
    <BlurView 
      intensity={intensity} 
      tint={tint} 
      style={[fullScreenStyle, style]} 
    />
  );
};

export default BlurBackground;
