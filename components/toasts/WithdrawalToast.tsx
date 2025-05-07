import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, useWindowDimensions, Platform, Animated } from 'react-native';
import { SvgXml } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

// SVG icon for withdrawal (36x36 background with cash-out icon)
const withdrawIconSvg = `<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="36" height="36" rx="18" fill="#D4D4D4"/>
  <path d="M10.1047 15.8534C9.89368 18.5127 10.0541 21.1764 10.6226 23.7813C10.9863 25.4614 12.1421 26.8096 13.6426 27.3018C15.0771 27.7651 16.543 28 18 28C19.457 28 20.9229 27.7651 22.3613 27.3003C23.8579 26.8096 25.0137 25.4614 25.3769 23.7832C25.7905 21.8916 26 19.9458 26 18C26 17.2828 25.9618 16.5634 25.905 15.8482C27.1667 15.2033 28 13.9576 28 12.5801V12.02C28 11.0981 27.6313 10.2061 26.9473 9.49316C26.2749 8.8208 25.3779 8.40234 24.4292 8.31494C20.228 7.89697 15.771 7.89697 11.5718 8.31494C9.53564 8.51562 8 10.1084 8 12.02V12.5801C8 13.502 8.36865 14.394 9.0625 15.1167C9.37158 15.4173 9.72626 15.6608 10.1047 15.8534ZM23.4224 23.3584C23.2085 24.3472 22.563 25.1294 21.7422 25.3984C19.2715 26.1973 16.7246 26.1958 14.2617 25.3999C13.437 25.1294 12.7915 24.3472 12.5771 23.3564C12 20.7124 11.8545 18.0039 12.144 15.3071C12.2275 14.5308 12.3467 13.7607 12.5015 13H23.4985C23.6518 13.752 23.772 14.5264 23.8559 15.3071C23.9517 16.1958 24 17.1016 24 18C24 19.8023 23.8057 21.6045 23.4224 23.3584ZM10 12.02C10 11.1416 10.7603 10.4048 11.769 10.3052C13.8042 10.1025 15.9004 10 18 10C20.0996 10 22.1958 10.1025 24.2388 10.3057C24.731 10.3511 25.1904 10.5645 25.5186 10.8926C25.7383 11.1216 26 11.5029 26 12.02V12.5801C26 12.9395 25.8667 13.2827 25.6367 13.5679C25.562 13.1148 25.4761 12.6689 25.3809 12.2358C25.3413 12.0366 25.2886 11.8511 25.2227 11.665C25.0811 11.2666 24.7036 11 24.2803 11H11.7197C11.2964 11 10.9189 11.2666 10.7773 11.665C10.7114 11.8511 10.6587 12.0366 10.6235 12.2153C10.5254 12.6606 10.4385 13.1138 10.3628 13.5723C10.1773 13.3398 10 13.0059 10 12.5801V12.02Z" fill="#000000"/>
</svg>`;

interface Props {
  amount: string;
  address: string;
  onHide?: () => void;
}

export default function WithdrawalToast({ amount, address, onHide }: Props) {
  const { width } = useWindowDimensions();
  const slideAnim = useRef(new Animated.Value(-200)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Haptic success feedback on mount
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Slide and fade in animation
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true })
    ]).start();

    // Auto-hide after 3 seconds with slide out
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: -200, duration: 300, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true })
      ]).start(({ finished }) => {
        if (finished) {
          onHide?.();
        }
      });
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const truncateAddress = (addr: string) =>
    addr ? `${addr.substring(0, 6)}..${addr.substring(addr.length - 4)}` : '';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity,
          width: width - 40,
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.iconWrapper}>
          <SvgXml xml={withdrawIconSvg} width={36} height={36} />
        </View>
        <View style={styles.textWrapper}>
          <Text style={styles.title}>Withdrawal completed</Text>
          <Text style={styles.message}>
            You successfully sent {amount} USDC to{"\n"}
            {truncateAddress(address)}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignSelf: 'center',
    top: 68,
    zIndex: 999,
  },
  content: {
    backgroundColor: '#ECECEC',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    gap: 8,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#D4D4D4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textWrapper: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 8,
  },
  title: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 19.2,
    color: '#252525',
  },
  message: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 16.8,
    color: '#484848',
  },
}); 