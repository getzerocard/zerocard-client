import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  interpolate,
  Extrapolate,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { Button } from '../../../components/ui/Button';
import { activationSecureIconSvg } from '../../../constants/icons';
import { useUserContext } from '../../../providers/UserProvider';

// SVG content for confirmation-card.svg
const confirmationCardSvg = `
<svg width="107" height="107" viewBox="0 0 107 107" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M48.3959 7.29572C50.8756 3.75126 56.1244 3.75126 58.6041 7.29571L63.8062 14.7315C65.3084 16.8788 67.9939 17.8562 70.5249 17.1769L79.2896 14.8246C83.4675 13.7033 87.4883 17.0772 87.1095 21.3863L86.3149 30.4263C86.0854 33.0368 87.5144 35.5118 89.8899 36.6183L98.116 40.4502C102.037 42.2767 102.949 47.4457 99.8887 50.5033L93.4692 56.9175C91.6154 58.7698 91.1191 61.5842 92.2276 63.9588L96.0661 72.1819C97.8959 76.1016 95.2715 80.6472 90.962 81.0224L81.9214 81.8097C79.3107 82.037 77.1215 83.874 76.4442 86.4056L74.0991 95.1721C72.9812 99.3509 68.049 101.146 64.5065 98.6635L57.075 93.4554C54.9289 91.9514 52.0711 91.9514 49.925 93.4554L42.4935 98.6635C38.951 101.146 34.0188 99.3509 32.9009 95.1721L30.5558 86.4056C29.8785 83.874 27.6893 82.037 25.0786 81.8097L16.038 81.0224C11.7285 80.6472 9.10413 76.1016 10.9339 72.1819L14.7724 63.9589C15.8809 61.5842 15.3846 58.7698 13.5308 56.9175L7.11135 50.5033C4.05134 47.4457 4.96277 42.2767 8.88397 40.4502L17.1101 36.6183C19.4856 35.5118 20.9146 33.0368 20.6851 30.4263L19.8905 21.3863C19.5117 17.0772 23.5325 13.7033 27.7104 14.8246L36.4751 17.1769C39.0061 17.8562 41.6916 16.8788 43.1938 14.7315L48.3959 7.29572Z" fill="#367C68"/>
<path d="M56.4071 30.2345C43.7772 28.4434 32.0258 37.2758 30.2347 49.9056C28.4436 62.5355 37.276 74.2869 49.9058 76.078C62.5357 77.8691 74.2871 69.0368 76.0782 56.4069C77.8693 43.777 69.037 32.0256 56.4071 30.2345ZM64.8607 49.4381L50.021 60.5916C49.6546 60.867 49.193 60.9886 48.7346 60.9236C48.2762 60.8586 47.8667 60.6134 47.5913 60.247L42.0243 52.8402C41.4539 52.0812 41.6099 50.981 42.3689 50.4105C43.1279 49.8401 44.2282 49.9961 44.7986 50.7551L49.323 56.7748L62.7756 46.6638C63.5346 46.0933 64.6348 46.2494 65.2053 47.0084C65.7758 47.7674 65.623 48.8447 64.8607 49.4381Z" fill="#5BCBAB"/>
</svg>
`;

const AnimatedButton = Animated.createAnimatedComponent(Button);
const screenHeight = Dimensions.get('window').height;

export default function CardActivatedScreen() {
  const { refetchCreateUserMutation } = useUserContext();

  const iconScale = useSharedValue(0.5);
  const iconOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const pinInfoBoxTranslateY = useSharedValue(screenHeight * 0.2); // Start off-screen (bottom)
  const buttonTranslateY = useSharedValue(screenHeight * 0.2); // Start off-screen (bottom)
  const iconRotation = useSharedValue(0); // For spinning animation

  useEffect(() => {
    iconScale.value = withDelay(100, withTiming(1, { duration: 500, easing: Easing.out(Easing.exp) }));
    iconOpacity.value = withDelay(100, withTiming(1, { duration: 500 }));
    textOpacity.value = withDelay(300, withTiming(1, { duration: 600 }));
    pinInfoBoxTranslateY.value = withDelay(500, withTiming(0, { duration: 700, easing: Easing.out(Easing.cubic) }));
    buttonTranslateY.value = withDelay(700, withTiming(0, { duration: 700, easing: Easing.out(Easing.cubic) }));

    // Stylish spinning animation: a slight overshoot and back, then continuous rotation
    iconRotation.value = withDelay(600, // Start after initial scale/fade
      withSequence(
        withTiming(380, { duration: 700, easing: Easing.out(Easing.quad) }), // Spin a bit more than 360
        withTiming(350, { duration: 400, easing: Easing.inOut(Easing.quad) }), // Settle back slightly
        // Loop the main rotation
        withRepeat(
          withTiming(360 + 350, { duration: 2500, easing: Easing.linear }),
          -1, // Infinite repeats
          false // Do not reverse
        )
      )
    );
  }, []);

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    opacity: iconOpacity.value,
    transform: [
      { scale: iconScale.value },
      { rotateZ: `${iconRotation.value}deg` },
    ],
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const pinInfoBoxAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: pinInfoBoxTranslateY.value }],
    opacity: interpolate(
      pinInfoBoxTranslateY.value,
      [screenHeight * 0.2, 0],
      [0, 1],
      Extrapolate.CLAMP
    ),
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: buttonTranslateY.value }],
    opacity: interpolate(
      buttonTranslateY.value,
      [screenHeight * 0.2, 0],
      [0, 1],
      Extrapolate.CLAMP
    ),
  }));

  const handleBackHome = async () => {
    if (refetchCreateUserMutation) {
      try {
        console.log('[CardActivatedScreen] Refetching user data before navigating home...');
        await refetchCreateUserMutation();
        console.log('[CardActivatedScreen] User data refetched successfully.');
      } catch (error) {
        console.error("[CardActivatedScreen] Error refetching user data:", error);
      }
    }
    router.replace({ pathname: '/(tab)/home/' } as any);
  };

  return (
    <SafeAreaView style={styles.mainContainer} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContentContainer}>
        <View style={styles.topContentArea}>
          <Animated.View style={[styles.iconAndTextContainer, textAnimatedStyle]}>
            <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
              <SvgXml xml={confirmationCardSvg} width={107} height={107} />
            </Animated.View>
            <Animated.Text style={[styles.titleText, textAnimatedStyle]}>Yayyy🎉, you have successfully activated your Zerocard</Animated.Text>
            <Animated.Text style={[styles.subtitleText, textAnimatedStyle]}>We've come a long way, thank you for trusting us with your crypto.</Animated.Text>
          </Animated.View>

          <Animated.View style={[styles.pinInfoBox, pinInfoBoxAnimatedStyle]}>
            <SvgXml xml={activationSecureIconSvg} width={24} height={24} />
            <Text style={styles.pinInfoText}>
              A PIN has been sent to your Phone Number, it is a default PIN. Please find the nearest ATM Machine to change your PIN
            </Text>
          </Animated.View>
        </View>

        <Animated.View style={[styles.buttonArea, buttonAnimatedStyle]}>
          <AnimatedButton
            title="Back home"
            variant="primary"
            onPress={handleBackHome}
          />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#1F1F1F',
  },
  scrollContentContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40, // Adjusted from original top: 108px
    paddingBottom: 40,
    justifyContent: 'space-between', // Pushes button to bottom if content is short
  },
  topContentArea: {
    gap: 35,
    alignItems: 'flex-start',
  },
  iconAndTextContainer: {
    gap: 24, // Combined gaps from Frame 1707480114 (48px) and 1707480006 (12px) for simplicity, adjusted
    alignItems: 'flex-start',
    alignSelf: 'stretch',
  },
  iconContainer: {
    // The SVG itself has dimensions, container can just align
    alignItems: 'flex-start', // Or 'center' if preferred
  },
  titleText: {
    fontFamily: 'SF Pro Text',
    fontWeight: '600',
    fontSize: 24,
    lineHeight: 29, // 24 * 1.2
    color: '#C0C0C0',
    alignSelf: 'stretch',
  },
  subtitleText: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 17, // 14 * 1.2
    color: '#A4A4A4',
    alignSelf: 'stretch',
  },
  pinInfoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    gap: 8,
    backgroundColor: '#343434',
    borderRadius: 20,
    alignSelf: 'stretch',
  },
  pinInfoText: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 17, // 14 * 1.2
    color: '#989898',
    flex: 1, // To allow text to wrap
  },
  buttonArea: {
    // Container for the button, gap is handled by ScrollView's justifyContent
    alignSelf: 'stretch',
  },
}); 