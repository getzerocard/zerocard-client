import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Button } from '../../ui/Button';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { router } from 'expo-router';

interface OrderConfirmationProps {
  onBackHome: () => void;
}

const OrderConfirmation: React.FC<OrderConfirmationProps> = ({
  onBackHome = () => router.back(),
}) => {
  // Animation values
  const translateY = useSharedValue(-200);
  const opacity = useSharedValue(0);

  // Set up animation when component mounts
  useEffect(() => {
    // Animate the card image with spring and fade in
    translateY.value = withSpring(0, {
      damping: 15,
      stiffness: 100,
    });
    opacity.value = withSpring(1);
  }, []);

  // Animated style for the card image
  const animatedImageStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    };
  });

  return (
    <View style={styles.container}>
      {/* Animated card image */}
      <Animated.View style={animatedImageStyle}>
        <Image
          source={require('../../../assets/card-image.png')}
          style={styles.cardImage}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Text container */}
      <View style={styles.textContainer}>
        <Text style={styles.titleText}>Your card has been ordered!</Text>
        <Text style={styles.descriptionText}>
          Time for financial freedom, your card should take{' '}
          <Text style={styles.blackText}>5-7 working days</Text> for delivery
        </Text>
      </View>

      {/* Back home button */}
      <View style={styles.buttonContainer}>
        <Button title="Back home" variant="primary" onPress={onBackHome} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F7F7',
    paddingHorizontal: 24,
  },
  cardImage: {
    width: 450,
    height: 286,
  },
  textContainer: {
    marginTop: 96, // 96px gap from the image
    width: 296,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  titleText: {
    width: 296,
    fontFamily: 'SF Pro Text',
    fontStyle: 'normal',
    fontWeight: '600',
    fontSize: 24,
    lineHeight: 29, // 120% of 24px
    textAlign: 'center',
    color: '#121212',
  },
  descriptionText: {
    width: 296,
    fontFamily: 'SF Pro Text',
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 19, // 120% of 16px
    textAlign: 'center',
    color: '#A4A4A4',
  },
  blackText: {
    color: '#000000',
    fontWeight: '500',
  },
  buttonContainer: {
    marginTop: 96, // 96px gap from the text container
    width: 354,
  },
});

export default OrderConfirmation;
