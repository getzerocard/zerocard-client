import { LinearGradient } from 'expo-linear-gradient';
import * as React from 'react';
import { View, StyleSheet, ViewStyle, DimensionValue } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

export interface SkeletonLoaderProps {
  /**
   * Width of the skeleton
   * @default '100%'
   */
  width?: DimensionValue;

  /**
   * Height of the skeleton
   * @default 20
   */
  height?: DimensionValue;

  /**
   * Border radius of the skeleton
   * @default 4
   */
  borderRadius?: number;

  /**
   * Background color of the skeleton
   * @default '#E1E9EE'
   */
  backgroundColor?: string;

  /**
   * Animation duration in milliseconds
   * @default 1500
   */
  duration?: number;

  /**
   * Additional style for the skeleton container
   */
  style?: ViewStyle;
}

/**
 * A skeleton loader component with shimmer animation
 * Used to indicate loading state for content
 */
export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  backgroundColor = '#E1E9EE',
  duration = 1500,
  style,
}) => {
  // Animation value for shimmer effect
  const loadingAnimation = useSharedValue(0);

  // Start the loading animation when component mounts
  React.useEffect(() => {
    loadingAnimation.value = withRepeat(
      withTiming(1, { duration, easing: Easing.ease }),
      -1, // Infinite repetitions
      true // Reverse animation
    );

    // Clean up animation when component unmounts
    return () => {
      // Cancel animation (not directly possible with Reanimated 2, but good practice for future)
      loadingAnimation.value = 0;
    };
  }, [duration, loadingAnimation]);

  // Animated style for the shimmer gradient
  const animatedGradientStyle = useAnimatedStyle(() => {
    const containerWidth = typeof width === 'number' ? width : 300;
    return {
      transform: [{ translateX: loadingAnimation.value * containerWidth * 2 - containerWidth }],
    };
  });

  return (
    <View
      style={[
        styles.container,
        { borderRadius, backgroundColor },
        style,
        // Apply width and height as inline styles to avoid type issues
        width !== undefined && { width },
        height !== undefined && { height },
      ]}>
      <Animated.View style={[styles.shimmer, animatedGradientStyle]}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.5)', 'rgba(255, 255, 255, 0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '200%',
    height: '100%',
  },
  gradient: {
    flex: 1,
  },
});
