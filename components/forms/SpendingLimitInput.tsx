import * as Haptics from 'expo-haptics';
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  UIManager,
  Platform,
  Animated,
  Pressable,
  Easing,
} from 'react-native';
import { SvgXml } from 'react-native-svg';

import { Button } from '../ui/Button';

// Enable layout animations on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// USDC icon SVG
const usdcIconSvg = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8.50041 16.4288C12.7978 16.4288 16.2546 12.8942 16.2546 8.50001C16.2546 4.10586 12.7978 0.571198 8.50041 0.571198C4.20303 0.571198 0.746216 4.10586 0.746216 8.50001C0.746216 12.8942 4.20303 16.4288 8.50041 16.4288Z" fill="#2775CA"/>
<path d="M10.6328 9.75514C10.6328 8.59912 9.95434 8.20268 8.59736 8.03697C7.62808 7.90455 7.43423 7.64053 7.43423 7.17828C7.43423 6.71603 7.75758 6.41869 8.4035 6.41869C8.98507 6.41869 9.30842 6.61691 9.4697 7.11247C9.50227 7.21158 9.5992 7.27739 9.69613 7.27739H10.2133C10.3428 7.27739 10.4398 7.17828 10.4398 7.04586V7.01256C10.3103 6.28549 9.72869 5.72413 8.98584 5.65832V4.86544C8.98584 4.73303 8.88892 4.63392 8.72763 4.60141H8.24299C8.1135 4.60141 8.01657 4.70052 7.98478 4.86544V5.62502C7.0155 5.75743 6.40137 6.4179 6.40137 7.24408C6.40137 8.3343 7.04729 8.76404 8.40428 8.92896C9.30919 9.09388 9.59997 9.2921 9.59997 9.82095C9.59997 10.3498 9.14791 10.7129 8.53377 10.7129C7.69399 10.7129 7.40321 10.3498 7.30628 9.85425C7.27372 9.72184 7.17679 9.65603 7.07986 9.65603H6.53087C6.40137 9.65603 6.30444 9.75514 6.30444 9.88755V9.92085C6.43394 10.747 6.95037 11.3417 8.01657 11.5066V12.2995C8.01657 12.4319 8.1135 12.531 8.27478 12.5635H8.75942C8.88892 12.5635 8.98584 12.4644 9.01764 12.2995V11.5066C9.98613 11.3409 10.6328 10.6471 10.6328 9.75514Z" fill="white"/>
<path d="M6.85257 13.224C4.33245 12.2987 3.03983 9.42451 3.97731 6.88095C4.46195 5.49341 5.52815 4.4365 6.85257 3.94094C6.98206 3.87514 7.04642 3.77603 7.04642 3.61031V3.14806C7.04642 3.01565 6.98206 2.91654 6.85257 2.88403C6.82 2.88403 6.75564 2.88403 6.72307 2.91733C3.65396 3.90844 1.97363 7.24488 2.9429 10.3839C3.52447 12.2337 4.91402 13.6545 6.72307 14.2492C6.85257 14.315 6.98129 14.2492 7.01385 14.1168C7.04642 14.0835 7.04642 14.051 7.04642 13.9844V13.5221C7.04642 13.4222 6.94949 13.2906 6.85257 13.224ZM10.2768 2.91654C10.1473 2.85073 10.0186 2.91654 9.98603 3.04895C9.95347 3.08225 9.95347 3.11476 9.95347 3.18136V3.64361C9.95347 3.77602 10.0504 3.90764 10.1473 3.97425C12.6674 4.89954 13.9601 7.77374 13.0226 10.3173C12.5379 11.7048 11.4717 12.7618 10.1473 13.2573C10.0178 13.3231 9.95347 13.4222 9.95347 13.5879V14.0502C9.95347 14.1826 10.0178 14.2817 10.1473 14.3142C10.1799 14.3142 10.2442 14.3142 10.2768 14.2809C13.3459 13.2898 15.0263 9.95337 14.057 6.81435C13.4754 4.93205 12.0541 3.5112 10.2768 2.91654Z" fill="white"/>
</svg>`;

// New backspace icon with filled stroke
const backArrowIconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M15 19.9201L8.47997 13.4001C7.70997 12.6301 7.70997 11.3701 8.47997 10.6001L15 4.08008" stroke="#FFFFFF" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

interface SpendingLimitInputProps {
  initialLimit?: number;
  balance: number;
  onSetLimit: (limit: number) => void;
}

interface AnimatedDigit {
  value: string;
  key: string;
  animValue: Animated.Value;
  isNew: boolean;
  opacity: Animated.Value;
  translateY: Animated.Value;
  translateX: Animated.Value;
}

// Animated digit component with slide-in/out animations
const AnimatedDigit = ({
  digit,
  isStatic = false,
}: {
  digit: AnimatedDigit;
  isStatic?: boolean;
}) => {
  // If static (commas, decimals), just show the value without animation
  if (isStatic) {
    return <Text style={styles.amountDisplay}>{digit.value}</Text>;
  }

  return (
    <Animated.View
      style={[
        styles.digitWrapper,
        {
          opacity: digit.opacity,
          transform: [{ translateY: digit.translateY }, { translateX: digit.translateX }],
        },
      ]}>
      <Text style={styles.amountDisplay}>{digit.value}</Text>
    </Animated.View>
  );
};

export default function SpendingLimitInput({
  initialLimit = 0,
  balance,
  onSetLimit,
}: SpendingLimitInputProps) {
  const [amountString, setAmountString] = useState('0');
  const [isExceedingBalance, setIsExceedingBalance] = useState(false);
  const [animatedDigits, setAnimatedDigits] = useState<AnimatedDigit[]>([]);
  const prevAmountRef = useRef(amountString);
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const isRemovingDigit = useRef(false);

  // Format with commas but preserve decimal
  const formattedDisplay = formatWithCommas(amountString);

  // Define naira conversion rate (1 USDC = X Naira)
  const nairaConversionRate = 1450; // Example rate, should be updated with actual rate

  // Calculate naira equivalent
  const nairaEquivalent = parseFloat(amountString) * nairaConversionRate;
  const formattedNaira = isNaN(nairaEquivalent)
    ? '~ ₦0.00'
    : `~ ₦${nairaEquivalent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  function formatWithCommas(value: string): string {
    // Handle zero case specifically
    if (value === '0') return '0';

    // If it has a decimal
    if (value.includes('.')) {
      const [intPart, decimalPart] = value.split('.');
      // Format the integer part with commas, but only if it's big enough to need them
      if (intPart.length > 3) {
        const formattedIntPart = Number(intPart).toLocaleString('en-US');
        return `${formattedIntPart}.${decimalPart}`;
      }
      return `${intPart}.${decimalPart}`;
    }

    // No decimal - only use commas for numbers with more than 3 digits
    if (value.length > 3) {
      return Number(value).toLocaleString('en-US');
    }
    return value;
  }

  // Update animated digits when formatted display changes
  useEffect(() => {
    const oldDigits = [...animatedDigits];
    const newFormattedDigits = formattedDisplay.split('');
    const newAnimatedDigits: AnimatedDigit[] = [];

    // Start with one animated digit for "0" if we have none
    if (oldDigits.length === 0) {
      newAnimatedDigits.push({
        value: '0',
        key: `initial-0-${Date.now()}`,
        animValue: new Animated.Value(0),
        opacity: new Animated.Value(1),
        translateY: new Animated.Value(0),
        translateX: new Animated.Value(0),
        isNew: false,
      });
      setAnimatedDigits(newAnimatedDigits);
      return;
    }

    // If going from 0 to something else, or from something to 0
    if (
      (prevAmountRef.current === '0' && amountString !== '0') ||
      (prevAmountRef.current !== '0' && amountString === '0')
    ) {
      // If we're transitioning to zero
      if (amountString === '0') {
        // Animate all current digits out to the left
        oldDigits.forEach((digit) => {
          Animated.parallel([
            Animated.spring(digit.translateX, {
              toValue: -50,
              friction: 8,
              tension: 10,
              useNativeDriver: true,
            }),
            Animated.timing(digit.opacity, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start();
        });

        // Create new zero digit with slide-in animation
        const opacity = new Animated.Value(0);
        const translateY = new Animated.Value(30);
        const translateX = new Animated.Value(0);

        const zeroDigit = {
          value: '0',
          key: `0-${Date.now()}`,
          animValue: new Animated.Value(0),
          opacity,
          translateY,
          translateX,
          isNew: true,
        };

        // Animate the new zero in from bottom
        Animated.parallel([
          Animated.spring(translateY, {
            toValue: 0,
            friction: 8,
            tension: 10,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();

        setTimeout(() => {
          setAnimatedDigits([zeroDigit]);
        }, 100);

        prevAmountRef.current = amountString;
        return;
      }

      // If we're transitioning from zero to another number
      // Animate zero out to the left
      if (oldDigits.length > 0) {
        const zeroDigit = oldDigits[0];
        Animated.parallel([
          Animated.spring(zeroDigit.translateX, {
            toValue: -50,
            friction: 8,
            tension: 10,
            useNativeDriver: true,
          }),
          Animated.timing(zeroDigit.opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }

      // Create new digits with slide-in animation
      const freshDigits = newFormattedDigits.map((char, index) => {
        const isStatic = char === '.' || char === ',';
        const opacity = new Animated.Value(isStatic ? 1 : 0);
        const translateY = new Animated.Value(isStatic ? 0 : 30);
        const translateX = new Animated.Value(0);

        // Only animate non-static characters
        if (!isStatic) {
          // Animate in from bottom with delay based on position
          Animated.parallel([
            Animated.spring(translateY, {
              toValue: 0,
              friction: 8,
              tension: 10,
              useNativeDriver: true,
              delay: index * 50, // Stagger the animations
            }),
            Animated.timing(opacity, {
              toValue: 1,
              duration: 300,
              delay: index * 50,
              useNativeDriver: true,
            }),
          ]).start();
        }

        return {
          value: char,
          key: `digit-${index}-${char}-${Date.now()}`,
          animValue: new Animated.Value(0),
          opacity,
          translateY,
          translateX,
          isNew: true,
        };
      });

      setTimeout(() => {
        setAnimatedDigits(freshDigits);
      }, 100);

      prevAmountRef.current = amountString;
      return;
    }

    // Handle digit removal (backspace)
    if (isRemovingDigit.current) {
      isRemovingDigit.current = false;

      if (newFormattedDigits.length < oldDigits.length) {
        // Keep track of which oldDigit indexes we've used
        const usedOldIndexes = new Set<number>();

        // First, add all digits that remain unchanged
        newFormattedDigits.forEach((char, index) => {
          // Find matching old digit (preferably at the same index)
          const oldIndex = index;

          // If this is a static character or the value matches, use the old digit
          if (
            index < oldDigits.length &&
            (char === oldDigits[index].value || char === '.' || char === ',')
          ) {
            newAnimatedDigits.push(oldDigits[index]);
            usedOldIndexes.add(index);
          } else {
            // This is a new or changed digit
            const opacity = new Animated.Value(1);
            const translateY = new Animated.Value(0);
            const translateX = new Animated.Value(0);

            newAnimatedDigits.push({
              value: char,
              key: `digit-${index}-${char}-${Date.now()}`,
              animValue: new Animated.Value(0),
              opacity,
              translateY,
              translateX,
              isNew: false,
            });
          }
        });

        // Now animate out the digits that were removed
        for (let i = 0; i < oldDigits.length; i++) {
          if (!usedOldIndexes.has(i) && i >= newFormattedDigits.length) {
            const removedDigit = oldDigits[i];

            // Animate out to the left
            Animated.parallel([
              Animated.spring(removedDigit.translateX, {
                toValue: -50,
                friction: 8,
                tension: 10,
                useNativeDriver: true,
              }),
              Animated.timing(removedDigit.opacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
              }),
            ]).start();
          }
        }

        setAnimatedDigits(newAnimatedDigits);
        prevAmountRef.current = amountString;
        return;
      }
    }

    // Handle normal case where we're adding digits
    if (newFormattedDigits.length >= oldDigits.length) {
      // Adding digits or same length but different values
      newFormattedDigits.forEach((char, index) => {
        const isStatic = char === '.' || char === ',';

        // If we have an existing digit at this position
        if (index < oldDigits.length) {
          // If the digit is the same, keep it
          if (oldDigits[index].value === char) {
            newAnimatedDigits.push(oldDigits[index]);
          } else {
            // Create a new animated digit with immediately visible values
            const opacity = new Animated.Value(1);
            const translateY = new Animated.Value(0);
            const translateX = new Animated.Value(0);

            newAnimatedDigits.push({
              value: char,
              key: `digit-${index}-${char}-${Date.now()}`,
              animValue: new Animated.Value(0),
              opacity,
              translateY,
              translateX,
              isNew: false,
            });
          }
        } else {
          // This is a completely new digit - animate it in from bottom
          const opacity = new Animated.Value(isStatic ? 1 : 0);
          const translateY = new Animated.Value(isStatic ? 0 : 30);
          const translateX = new Animated.Value(0);

          // Only animate if it's not a static character
          if (!isStatic) {
            Animated.parallel([
              Animated.spring(translateY, {
                toValue: 0,
                friction: 8,
                tension: 10,
                useNativeDriver: true,
              }),
              Animated.timing(opacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
              }),
            ]).start();
          }

          newAnimatedDigits.push({
            value: char,
            key: `digit-${index}-${char}-${Date.now()}`,
            animValue: new Animated.Value(0),
            opacity,
            translateY,
            translateX,
            isNew: true,
          });
        }
      });

      setAnimatedDigits(newAnimatedDigits);
    }

    prevAmountRef.current = amountString;
  }, [formattedDisplay]);

  useEffect(() => {
    const numValue = parseFloat(amountString) || 0;
    setIsExceedingBalance(numValue > balance);
  }, [amountString, balance]);

  // Function to create shake animation
  const shakeDisplay = () => {
    // Reset the animation value
    shakeAnimation.setValue(0);

    // Create a sequence of small, quick movements
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 5,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleKeyPress = (key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    let newAmountString;

    if (key === '.' && amountString.includes('.')) return; // Allow only one decimal point
    if (key === '.' && amountString === '0') {
      newAmountString = '0.';
    } else if (key === '.') {
      newAmountString = amountString + key;
    } else {
      newAmountString = amountString === '0' ? key : amountString + key;
    }

    // Check for decimal places
    if (newAmountString.includes('.')) {
      const parts = newAmountString.split('.');
      if (parts[1].length > 2) {
        // Limit to 2 decimal places
        newAmountString = `${parts[0]}.${parts[1].substring(0, 2)}`;
      }
    }

    const numValue = parseFloat(newAmountString) || 0;
    if (numValue > balance) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      // Shake the amount display when exceeding balance
      shakeDisplay();
    }

    setAmountString(newAmountString);
  };

  const handleBackspace = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // If amount is just '0', nothing to do
    if (amountString === '0') return;

    // Set flag to indicate we're removing a digit
    isRemovingDigit.current = true;

    // Simple backspace functionality
    if (amountString.length > 1) {
      setAmountString((prev) => prev.slice(0, -1));
    } else {
      setAmountString('0');
    }
  };

  // Long-press handler for backspace to clear all
  const handleLongPressBackspace = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    if (amountString === '0') return;

    // Clear all digits
    setAmountString('0');
  };

  const handleSetPercentage = (percentage: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const calculatedAmount = balance * (percentage / 100);
    setAmountString(calculatedAmount.toFixed(2)); // Keep 2 decimal places
  };

  const handleSetMax = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setAmountString(balance.toFixed(2)); // Use the full balance
  };

  const handleSetLimit = () => {
    if (isExceedingBalance) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      // Shake the amount display when trying to set a limit that exceeds balance
      shakeDisplay();
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const limitValue = parseFloat(amountString) || 0;
    if (limitValue > 0) {
      onSetLimit(limitValue);
    }
  };

  const displayAmount = parseFloat(amountString) || 0;
  const isZero = displayAmount === 0;

  // Button animation
  const createKeyAnimation = () => {
    const scale = new Animated.Value(1);

    const onPressIn = () => {
      Animated.spring(scale, {
        toValue: 1.2,
        friction: 4,
        tension: 100,
        useNativeDriver: true,
      }).start();
    };

    const onPressOut = () => {
      Animated.spring(scale, {
        toValue: 1,
        friction: 4,
        tension: 100,
        useNativeDriver: true,
      }).start();
    };

    return { scale, onPressIn, onPressOut };
  };

  return (
    <View style={styles.outerContainer}>
      <View style={styles.balanceWrapper}>
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Balance</Text>
          <View style={styles.balanceValueContainer}>
            <SvgXml xml={usdcIconSvg} width={16} height={16} />
            <Text style={styles.balanceAmount}>{balance.toFixed(2)} USDC</Text>
          </View>
        </View>
      </View>

      <Animated.View
        style={[styles.amountDisplayContainer, { transform: [{ translateX: shakeAnimation }] }]}>
        <View style={styles.digitContainer}>
          {animatedDigits.map((digit, index) => (
            <AnimatedDigit
              key={digit.key}
              digit={digit}
              isStatic={digit.value === '.' || digit.value === ','}
            />
          ))}
          {animatedDigits.length === 0 && (
            <Text style={[styles.amountDisplay, isZero ? styles.amountDisplayEmpty : null]}>0</Text>
          )}
        </View>
        <Text style={styles.nairaEquivalent}>{formattedNaira}</Text>
      </Animated.View>

      <View style={styles.percentageButtonsContainer}>
        <TouchableOpacity style={styles.percentageButton} onPress={() => handleSetPercentage(20)}>
          <Text style={styles.percentageButtonText}>20%</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.percentageButton} onPress={() => handleSetPercentage(50)}>
          <Text style={styles.percentageButtonText}>50%</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.percentageButton} onPress={handleSetMax}>
          <Text style={styles.percentageButtonText}>Max</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.keyboardContainer}>
        {[
          ['1', '2', '3'],
          ['4', '5', '6'],
          ['7', '8', '9'],
          ['.', '0', 'back'],
        ].map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keyboardRow}>
            {row.map((key) => {
              const keyAnim = createKeyAnimation();

              return (
                <Pressable
                  key={key}
                  style={[styles.keyboardButton, key === 'back' ? styles.backspaceButton : null]}
                  onPressIn={keyAnim.onPressIn}
                  onPressOut={keyAnim.onPressOut}
                  onPress={() => (key === 'back' ? handleBackspace() : handleKeyPress(key))}
                  onLongPress={key === 'back' ? handleLongPressBackspace : undefined}
                  delayLongPress={500}>
                  <Animated.View style={{ transform: [{ scale: keyAnim.scale }] }}>
                    {key === 'back' ? (
                      <SvgXml xml={backArrowIconSvg} width={24} height={24} />
                    ) : (
                      <Text style={styles.keyboardButtonText}>{key}</Text>
                    )}
                  </Animated.View>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>

      <Button
        title="Set Limit"
        onPress={handleSetLimit}
        style={styles.setLimitButton}
        disabled={isZero || isExceedingBalance}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 40,
    paddingHorizontal: 8,
  },
  balanceWrapper: {
    alignSelf: 'center',
    borderRadius: 1000,
    marginTop: 20,
  },
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    gap: 8,
    backgroundColor: '#2C2C2C',
    borderRadius: 1000,
    borderWidth: 1,
    borderColor: '#444',
  },
  balanceLabel: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 17, // 120%
    textAlign: 'center',
    letterSpacing: -0.42,
    color: '#FAFAFA',
  },
  balanceValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  balanceAmount: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 17, // 120%
    textAlign: 'center',
    letterSpacing: -0.42,
    color: '#FAFAFA',
  },
  amountDisplayContainer: {
    marginTop: 42,
    minHeight: 58,
    justifyContent: 'center',
    alignItems: 'center',
  },
  digitContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 58,
    overflow: 'hidden',
  },
  digitWrapper: {
    height: 58,
    overflow: 'hidden',
  },
  amountDisplay: {
    fontFamily: 'SF Pro Rounded',
    fontWeight: '700',
    fontSize: 48,
    lineHeight: 58, // 120%
    textAlign: 'center',
    color: '#FAFAFA',
    height: 58,
  },
  amountDisplayEmpty: {
    color: '#5D5D5D',
  },
  nairaEquivalent: {
    marginTop: 8,
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 16,
    textAlign: 'center',
    color: '#838383',
  },
  percentageButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    marginTop: 42, // Gap from amount display
  },
  percentageButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#2C2C2C',
    borderRadius: 1000,
    minWidth: 56, // Based on Figma (Max button)
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 1,
    elevation: 1,
  },
  percentageButtonText: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 19, // 120%
    textAlign: 'center',
    letterSpacing: -0.42,
    color: '#FFFFFF',
  },
  keyboardContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 36, // Gap from percentage buttons
    gap: 18, // Reduced vertical gap between keyboard rows
    alignSelf: 'stretch',
  },
  keyboardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%', // Adjust based on gap and button size
    alignSelf: 'center',
  },
  keyboardButton: {
    width: 60, // Give buttons a fixed width
    height: 60, // Give buttons a fixed height
    justifyContent: 'center',
    alignItems: 'center',
  },
  backspaceButton: {
    borderRadius: 30,
  },
  keyboardButtonText: {
    fontFamily: 'SF Pro Rounded',
    fontWeight: '500',
    fontSize: 24,
    lineHeight: 29, // 120%
    textAlign: 'center',
    color: '#FAFAFA',
  },
  setLimitButton: {
    marginTop: 36, // Push button to the bottom
    width: '100%', // Take full width
  },
});
