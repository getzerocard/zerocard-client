import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
  Keyboard,
  ScrollView,
  StatusBar,
  Modal,
  Platform,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { SvgXml } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import BlurBackground from '../../../components/ui/layout/BlurBackground';
import {
  backIconSvg,
  pinActivationIconSvg,
  activationSecureIconSvg,
  closeCircleIconSvg,
  lockCircleIconSvg,
  warningIconSvg,
} from '../../../constants/icons'; // Import icons

// --- Helper function to check for weak PINs ---
const isPinWeak = (pin: string): boolean => {
  if (pin.length !== 4) return false; // Only check 4-digit PINs

  // Common patterns
  const repeating = /^(\d)\1{3}$/;
  const sequentialUp = /^(0123|1234|2345|3456|4567|5678|6789)$/;
  const sequentialDown = /^(9876|8765|7654|6543|5432|4321|3210)$/;
  // Add more patterns as needed (e.g., common dates, keyboard patterns)

  return repeating.test(pin) || sequentialUp.test(pin) || sequentialDown.test(pin);
};
// -----------------------------------------------

export default function SetPinScreen() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const pinInputRef = useRef<TextInput>(null);

  // PIN setup modal state
  const [showPinSetupModal, setShowPinSetupModal] = useState(false);
  const [personalPin, setPersonalPin] = useState('');
  const [isPinWeakWarning, setIsPinWeakWarning] = useState(false);
  const [pinWarningMsg, setPinWarningMsg] = useState('');
  const modalAnimation = useRef(new Animated.Value(0)).current;
  const keyboardOffset = useRef(new Animated.Value(0)).current;
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const modalShakeAnimation = useRef(new Animated.Value(0)).current;
  const { height } = Dimensions.get('window');

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handlePinChange = (text: string) => {
    // Only allow numbers and limit to 6 digits (formatted as XXX-XXX)
    const numericText = text.replace(/[^0-9]/g, '');

    if (numericText.length <= 6) {
      // Format as XXX-XXX
      if (numericText.length > 3) {
        const firstPart = numericText.substring(0, 3);
        const secondPart = numericText.substring(3);
        setPin(`${firstPart}-${secondPart}`);
      } else {
        setPin(numericText);
      }

      // Clear error when user is typing
      if (error) {
        setError(false);
        setErrorMsg('');
      }
    }
  };

  const handleActivate = () => {
    // Remove hyphen for validation
    const plainPin = pin.replace('-', '');

    if (plainPin.length !== 6) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(true);
      setErrorMsg('Please enter a 6-digit Code');
      triggerShake();
      return;
    }

    // For demonstration, we're just checking if PIN is "123456"
    // In a real app, you would validate against an API
    if (plainPin !== '123456') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(true);
      setErrorMsg('Activation Code is incorrect');
      triggerShake();
      return;
    }

    // Success feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Show PIN setup modal
    showPinSetupModalWithAnimation();
  };

  const triggerShake = () => {
    shakeAnimation.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const showPinSetupModalWithAnimation = () => {
    setShowPinSetupModal(true);
    // Slower spring animation from bottom
    Animated.spring(modalAnimation, {
      toValue: 1,
      useNativeDriver: true,
      tension: 40,
      friction: 7,
    }).start();
  };

  const hidePinSetupModal = () => {
    // Animate modal out
    Animated.timing(modalAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowPinSetupModal(false);
    });
  };

  const handlePersonalPinChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, '');
    if (numericText.length <= 4) {
      setPersonalPin(numericText);

      // Check for weak PIN when length is 4
      if (numericText.length === 4) {
        if (isPinWeak(numericText)) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          setIsPinWeakWarning(true);
          setPinWarningMsg('This PIN is easily guessable.');
        } else {
          setIsPinWeakWarning(false);
          setPinWarningMsg('');
        }
      } else {
        // Clear warning if length drops below 4
        setIsPinWeakWarning(false);
        setPinWarningMsg('');
      }
    }
  };

  const proceedWithPinSetup = () => {
    hidePinSetupModal();

    // Here you would normally save the PIN to backend
    // For this demo, just show success and navigate
    Alert.alert('PIN Set Successfully', 'Your card is now activated and ready to use.', [
      {
        text: 'OK',
        onPress: () => router.replace('/(tab)/home'),
      },
    ]);
  };

  const handleSetPin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Validate Personal PIN length
    if (personalPin.length !== 4) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      triggerModalShake();
      return;
    }

    // Check if PIN is weak (already validated in handlePersonalPinChange,
    // but we need to check the state here for the confirmation alert)
    if (isPinWeakWarning) {
      // Ask for confirmation (no need for haptics again)
      Alert.alert(
        'Weak PIN Detected',
        'This PIN might be easy to guess. Are you sure you want to use it?',
        [
          {
            text: 'No, choose another',
            style: 'cancel',
            onPress: () => {
              setIsPinWeakWarning(false);
              setPinWarningMsg('');
            },
          },
          { text: 'Yes, use this PIN', onPress: proceedWithPinSetup },
        ]
      );
      return; // Stop here until user confirms or cancels
    }

    // If PIN is not weak, proceed directly
    proceedWithPinSetup();
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    hidePinSetupModal();

    // Navigate to home screen
    router.replace('/(tab)/home');
  };

  // Format PIN for display
  const formatPinForDisplay = () => {
    // Handle empty pin explicitly
    if (!pin) {
      return {
        firstPart: '',            // Empty
        firstPlaceholder: 'XXX',   // Placeholder has content
        secondPart: '',           // Empty
        secondPlaceholder: 'XXX',  // Placeholder has content
      };
    }

    // If PIN contains a hyphen, split it
    if (pin.includes('-')) {
      const [first, second] = pin.split('-');
      return {
        firstPart: first,
        firstPlaceholder: 'X'.repeat(Math.max(0, 3 - first.length)),
        secondPart: second,
        secondPlaceholder: 'X'.repeat(Math.max(0, 3 - second.length)),
      };
    }

    // If PIN is 3 or less characters
    if (pin.length <= 3) {
      return {
        firstPart: pin,
        firstPlaceholder: 'X'.repeat(Math.max(0, 3 - pin.length)),
        secondPart: '',
        secondPlaceholder: 'XXX',
      };
    }

    // If PIN is more than 3 characters
    const firstPart = pin.substring(0, 3);
    const secondPart = pin.substring(3);
    return {
      firstPart: firstPart,
      firstPlaceholder: '', // No placeholder needed if first part is full
      secondPart: secondPart,
      secondPlaceholder: 'X'.repeat(Math.max(0, 3 - secondPart.length)),
    };
  };

  const { firstPart, firstPlaceholder, secondPart, secondPlaceholder } = formatPinForDisplay();

  // Calculate the modal translation based on animation value
  const modalTranslateY = modalAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [height, -40], // End -40px from the bottom (effectively paddingBottom: 40)
  });

  // Listen for keyboard events to adjust modal position
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
      // Animate modal up by a fixed amount (adjust as needed)
      Animated.timing(keyboardOffset, {
        toValue: -150, // Move up by 150px
        duration: 250,
        useNativeDriver: true,
      }).start();
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      // Animate modal back down
      Animated.timing(keyboardOffset, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });

    // Cleanup listeners on unmount
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Function to trigger the shake animation for the modal input
  const triggerModalShake = () => {
    modalShakeAnimation.setValue(0); // Reset value
    Animated.sequence([
      Animated.timing(modalShakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(modalShakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(modalShakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(modalShakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1F1F1F" />
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <Stack.Screen options={{ headerShown: false }} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <SvgXml xml={backIconSvg} width={24} height={24} />
          </TouchableOpacity>
          <View style={styles.emptySpace} />
        </View>

        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            {/* Top section with title and input */}
            <View style={styles.mainContent}>
              {/* Header Section */}
              <View style={styles.headerContainer}>
                <SvgXml xml={pinActivationIconSvg} width={32} height={32} />
                <View style={styles.headerTextContainer}>
                  <Text style={styles.headerTitle}>
                    Enter Activation Code{'\n'}for your Zerocard
                  </Text>
                  <Text style={styles.headerSubtitle}>Trust me our eyes are shut 🫣</Text>
                </View>
              </View>

              {/* PIN Input Section - TouchableOpacity already handles taps here */}
              <Animated.View style={{ transform: [{ translateX: shakeAnimation }] }}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={error ? styles.inputContainerError : styles.inputContainer}
                  onPress={() => pinInputRef.current?.focus()}>
                  {/* Restructure PIN display with conditional rendering */}
                  <View style={styles.pinDisplayContainer}>
                    {/* Render white text only if firstPart has digits */}
                    {firstPart && (
                      <Text style={error ? styles.pinTextError : styles.pinTextActive}>
                        {firstPart}
                      </Text>
                    )}
                    {/* Always render grey placeholder Xs */}
                    <Text style={error ? styles.pinTextError : styles.pinText}>
                      {firstPlaceholder}
                    </Text>
                    
                    <Text style={styles.pinSeparator}>-</Text>
                    
                    {/* Render white text only if secondPart has digits */}
                    {secondPart && (
                      <Text style={error ? styles.pinTextError : styles.pinTextActive}>
                        {secondPart}
                      </Text>
                    )}
                    {/* Always render grey placeholder Xs */}
                    <Text style={error ? styles.pinTextError : styles.pinText}>
                      {secondPlaceholder}
                    </Text>
                  </View>

                  {/* Hidden input field for PIN entry */}
                  <TextInput
                    ref={pinInputRef}
                    style={styles.hiddenInput}
                    value={pin}
                    onChangeText={handlePinChange}
                    keyboardType="number-pad"
                    maxLength={7} // 6 digits + 1 hyphen
                    secureTextEntry={false} // Show the PIN as it's an activation code
                  />
                </TouchableOpacity>
              </Animated.View>

              {/* Error message */}
              {error && (
                <View style={styles.errorContainer}>
                  <SvgXml xml={closeCircleIconSvg} width={16} height={16} />
                  <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
              )}
            </View>

            {/* Bottom section with info box and button grouped together */}
            <View style={styles.bottomGroup}>
              {/* Info Box */}
              <View style={styles.infoBox}>
                <SvgXml xml={activationSecureIconSvg} width={24} height={24} />
                <Text style={styles.infoText}>
                  <Text>An </Text>
                  <Text style={styles.infoTextHighlight}>Activation Code</Text>
                  <Text> has been sent to your </Text>
                  <Text style={styles.infoTextHighlight}>email</Text>
                  <Text>
                    . Use it here to activate your card. You can set or update your separate
                    transaction PIN later.
                  </Text>
                </Text>
              </View>

              {/* Button */}
              <TouchableOpacity style={styles.activateButton} onPress={handleActivate}>
                <Text style={styles.activateButtonText}>Activate card</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>

        {/* PIN Setup Modal */}
        <Modal
          visible={showPinSetupModal}
          transparent={true}
          animationType="none"
          onRequestClose={hidePinSetupModal}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={styles.modalOverlay}>
              {Platform.OS === 'ios' ? (
                <BlurBackground
                  visible={true}
                  tint="dark" // Ensure dark tint
                  intensity={85} // Increase intensity for a darker effect
                />
              ) : (
                <View style={styles.androidOverlay} />
              )}

              <Animated.View
                style={[
                  styles.modalContainer,
                  {
                    // Apply both entry animation and keyboard offset
                    transform: [{ translateY: modalTranslateY }, { translateY: keyboardOffset }],
                  },
                ]}>
                <View style={styles.modalContent}>
                  {/* Wrap header, input, and warning together */}
                  <View style={styles.modalTopContent}>
                    {/* Header */}
                    <View style={styles.modalHeader}>
                      <SvgXml xml={lockCircleIconSvg} width={32} height={32} />
                      <Text style={styles.modalTitle}>Setup your PIN{'\n'}for your Zerocard</Text>
                      <Text style={styles.modalSubtitle}>
                        Be rest assured it's your personal identification number, zero knows
                        nothing!
                      </Text>
                    </View>

                    {/* PIN Input - Needs to stop propagation if tapped */}
                    <TouchableWithoutFeedback
                      onPress={(e) => e.stopPropagation()}
                      accessible={false}>
                      <Animated.View style={{ transform: [{ translateX: modalShakeAnimation }] }}>
                        <TextInput
                          style={styles.modalInput}
                          placeholder="XXXX"
                          placeholderTextColor="#9A9A9A"
                          value={personalPin}
                          onChangeText={handlePersonalPinChange}
                          keyboardType="number-pad"
                          maxLength={4}
                          secureTextEntry={false} // Show the PIN
                        />
                      </Animated.View>
                    </TouchableWithoutFeedback>

                    {/* Weak PIN Warning Message - Moved here */}
                    {isPinWeakWarning && (
                      <View style={styles.warningContainer}>
                        <SvgXml xml={warningIconSvg} width={16} height={16} />
                        <Text style={styles.warningText}>{pinWarningMsg}</Text>
                      </View>
                    )}
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.modalActions}>
                    <TouchableOpacity style={styles.setPinButton} onPress={handleSetPin}>
                      <Text style={styles.setPinButtonText}>Set PIN</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleSkip}>
                      <Text style={styles.skipText}>Skip</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Animated.View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F1F1F',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  emptySpace: {
    width: 40,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 42,
  },
  mainContent: {
    gap: 0, // Remove the default gap since we'll control spacing individually
  },
  headerContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 24, // 48px between title container and PIN input
  },
  headerTextContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
  },
  headerTitle: {
    fontFamily: 'SF Pro Text',
    fontWeight: '600',
    fontSize: 24,
    lineHeight: 29,
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 17,
    color: '#A4A4A4',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 16, // Add spacing after input
    minHeight: 54, // Ensure input has enough height to be tappable
  },
  inputContainerError: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 0, // Add spacing after input
    minHeight: 54, // Ensure input has enough height to be tappable
  },
  pinDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  pinText: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 18,
    lineHeight: 22,
    color: '#A2A2A2', // Color for placeholder Xs
  },
  pinTextActive: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 18,
    lineHeight: 22,
    color: '#FFFFFF',
  },
  pinTextError: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 18,
    lineHeight: 22,
    color: '#FF4E57',
  },
  pinSeparator: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 19,
    color: '#525252',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: '100%',
    width: '100%',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
  },
  errorText: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 17,
    color: '#787878',
  },
  infoBox: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
    backgroundColor: '#343434',
    borderRadius: 20,
    marginTop: 16, // 16px between info box and previous element
    marginBottom: 0, // 16px below the info box
  },
  infoText: {
    flex: 1,
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 17,
    color: '#989898', // Base color for the text
  },
  infoTextHighlight: {
    color: '#FFFFFF', // White color for highlighted words
    fontWeight: '600', // Optional: make highlighted text slightly bolder
  },
  bottomGroup: {
    gap: 16, // 16px gap between dialog and button
  },
  activateButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#40FF00',
    borderRadius: 100000,
    marginTop: 16, // Ensure spacing above button
  },
  activateButtonText: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 17,
    textAlign: 'center',
    color: '#000000',
  },

  // Modal Styles
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  androidOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContainer: {
    backgroundColor: '#272727',
    borderRadius: 30,
    marginHorizontal: 24,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  modalContent: {
    padding: 32,
    paddingHorizontal: 24,
    gap: 24, // Restore gap to manage space between top content and buttons
    alignItems: 'stretch',
  },
  modalTopContent: {
    // New style for header + input + warning group
    gap: 24, // Keep internal gap between header and input
  },
  modalHeader: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 12,
  },
  modalTitle: {
    fontFamily: 'SF Pro Text',
    fontWeight: '600',
    fontSize: 24,
    lineHeight: 29,
    color: '#FFFFFF',
    marginTop: 12,
  },
  modalSubtitle: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 17,
    color: '#A4A4A4',
  },
  modalInput: {
    height: 51,
    backgroundColor: '#3C3C3C',
    borderRadius: 16,
    paddingHorizontal: 16,
    color: '#FFFFFF',
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 16,
  },
  modalActions: {
    gap: 24,
    alignItems: 'center',
    marginTop: 24,
  },
  setPinButton: {
    width: '100%',
    backgroundColor: '#40FF00',
    borderRadius: 100000,
    paddingVertical: 16,
    alignItems: 'center',
  },
  setPinButtonText: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 17,
    color: '#000000',
  },
  skipText: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 19,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  // Add styles for warning message
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: -12, // Set 12px space below input before warning
  },
  warningText: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 17,
    color: '#A4A4A4', // Gray color for warning text
  },
});
