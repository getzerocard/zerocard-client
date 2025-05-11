import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Alert,
  Keyboard,
} from 'react-native';
import { SquircleView } from 'react-native-figma-squircle';
import * as Haptics from 'expo-haptics';

import { Button } from '../../ui/Button';
import { LoadingSpinner } from '../../ui/feedback/LoadingSpinner';
import { useCheckUsername } from './hooks/useCheckUsername';
import BlurBackground from '../../ui/layout/BlurBackground';

import { CommonModalProps } from './hooks/useUsernameModal';

type AndroidUsernameModalProps = CommonModalProps;

const AndroidUsernameModal: React.FC<CommonModalProps> = ({
  visible,
  onClose,
  onSubmit,
  initialUsername = '',
}) => {
  const [username, setUsername] = useState(initialUsername);
  const [loading, setLoading] = useState(false);
  const [hasSetUsername, setHasSetUsername] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  // const opacity = new Animated.Value(0); // Commented out
  // const translateY = new Animated.Value(100); // Commented out
  const modalPosition = new Animated.Value(0); // Keep for potential later re-introduction, but not used in style now
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  
  // Define a percentage for modal width, e.g., 90% of screen width
  const modalContentWidth = screenWidth * 0.9;
  const modalTopPosition = screenHeight * 0.5; // Changed from 0.3 to 0.35 (35% from the top)

  const { status, error } = useCheckUsername(username);

  // Reset hasSetUsername when modal becomes visible
  useEffect(() => {
    if (visible) {
      setHasSetUsername(false);
    }
    console.log('[AndroidUsernameModal] Visibility changed (useEffect). New visible state:', visible);
  }, [visible]);

  // Handle animation when visibility changes - COMMENTED OUT
  // useEffect(() => {
  //   if (visible) {
  //     Animated.parallel([
  //       Animated.timing(opacity, {
  //         toValue: 1,
  //         duration: 300,
  //         useNativeDriver: true,
  //         easing: Easing.out(Easing.ease),
  //       }),
  //       Animated.timing(translateY, {
  //         toValue: 0,
  //         duration: 300,
  //         useNativeDriver: true,
  //         easing: Easing.out(Easing.ease),
  //       }),
  //     ]).start();
  //   } else {
  //     Animated.parallel([
  //       Animated.timing(opacity, {
  //         toValue: 0,
  //         duration: 200,
  //         useNativeDriver: true,
  //         easing: Easing.in(Easing.ease),
  //       }),
  //       Animated.timing(translateY, {
  //         toValue: 100,
  //         duration: 200,
  //         useNativeDriver: true,
  //         easing: Easing.in(Easing.ease),
  //       }),
  //     ]).start();
  //   }
  // }, [visible]);

  // Handle keyboard show/hide
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener('keyboardWillShow', () => {
      console.log('[AndroidUsernameModal] keyboardWillShow event');
      setKeyboardVisible(true);
      // Animated.timing(modalPosition, { // Commented out for testing
      //   toValue: -150,
      //   duration: 300,
      //   useNativeDriver: true,
      //   easing: Easing.out(Easing.ease),
      // }).start();
    });

    const keyboardWillHideListener = Keyboard.addListener('keyboardWillHide', () => {
      console.log('[AndroidUsernameModal] keyboardWillHide event');
      setKeyboardVisible(false);
      // Animated.timing(modalPosition, { // Commented out for testing
      //   toValue: 0,
      //   duration: 300,
      //   useNativeDriver: true,
      //   easing: Easing.out(Easing.ease),
      // }).start();
    });

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  // Renamed and simplified button press handler
  const handlePressSetUsernameButton = async () => {
    console.log('[AndroidUsernameModal] "Set Username" button pressed. Current local username:', username);
    const trimmedUsername = username.trim();

    if (!trimmedUsername || trimmedUsername.length === 0) {
      console.log('[AndroidUsernameModal] Username is empty locally. Alerting user.');
      Alert.alert('Username Required', 'Please enter a username to continue.', [{ text: 'OK' }]);
      return;
    }

    setLoading(true);
    try {
      console.log('[AndroidUsernameModal] Calling onSubmit with username:', trimmedUsername);
      await onSubmit(trimmedUsername); // Calls handleSetUsername from useUsernameModal
      // setHasSetUsername(true); // This is now primarily managed by the onClose logic and if onSubmit succeeds
                                // The main handleClose from useUsernameModal will be called on success by onSubmit
      // onClose(); // Do not call onClose directly here; onSubmit will trigger it via useUsernameModal's handleClose
    } catch (e) {
      // Errors are primarily caught and handled within useUsernameModal's handleSetUsername.
      // That function might set a global error state or show an alert.
      // Avoid double alerting if the error is already handled by useUsernameModal.
      console.log('[AndroidUsernameModal] onSubmit (from useUsernameModal) threw an error. Error should be handled in useUsernameModal.', e);
      // If useUsernameModal doesn't show an alert for a specific error type caught here, you might add one.
      // Alert.alert('Error', 'An unexpected error occurred while setting username.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    console.log('[AndroidUsernameModal] handleClose called (local). hasSetUsername:', hasSetUsername);
    // The `hasSetUsername` logic here is tricky because `onSubmit` (from `useUsernameModal`)
    // now calls `handleClose` from `useUsernameModal` upon success, which in turn calls this `onClose` prop.
    // If `onSubmit` is successful, the modal should close unconditionally.
    // If the user tries to close the modal via overlay press or back button *before* submitting successfully,
    // then the `hasSetUsername` check is relevant.
    // For simplicity, we can assume that if onClose is called directly (e.g. overlay), and submission hasn't happened,
    // it might be okay to prompt. However, the main closing is after successful submission from useUsernameModal.

    // The `onClose` prop (which points to `useUsernameModal.handleClose`) will set its `isVisible` to false.
    // This local `handleClose` is for the `Modal` component's `onRequestClose` and the overlay press.
    // If `hasSetUsername` is false, it means the user is trying to dismiss without completing.
    if (!hasSetUsername && visible) { // Only alert if trying to close while visible and username not set
        console.log('[AndroidUsernameModal] Attempting to close modal via overlay/back without setting username. Alerting.');
        Alert.alert('Username Required', 'Please set a username before continuing.', [
            { text: 'OK' },
        ]);
        // Do not call onClose() here again to prevent potential loops if it doesn't immediately hide.
        // Let the Alert be the action. The actual close is managed by useUsernameModal or parent.
    } else {
        onClose(); // Propagate to useUsernameModal to hide it
    }
  };

  console.log('[AndroidUsernameModal] Render. visible prop:', visible); // Log the visible prop

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={handleClose}>
      <BlurBackground visible={visible} intensity={40} tint="dark" />
      
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => {
        console.log('[AndroidUsernameModal] modalOverlay onPress triggered.');
        handleClose();
      }}>
        <Animated.View
          style={[
            styles.modalAnimatedContainer, // Contains position: 'absolute'. top will be overridden.
            {
              width: modalContentWidth,
              left: (screenWidth - modalContentWidth) / 2,
              top: modalTopPosition, // Use calculated percentage-based top
              transform: [{ translateY: modalPosition }],
            },
          ]}>
          <SquircleView
            style={styles.modalContainer}
            squircleParams={{
              cornerSmoothing: 1,
              cornerRadius: 30,
              fillColor: '#F7F7F7', // Original fill color
            }}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => {
                console.log('[AndroidUsernameModal] modalTouchable onPress triggered (stopPropagation expected).');
                e.stopPropagation();
              }}
              style={styles.modalTouchable}>
              <View style={styles.contentWrapper}>
                <View style={styles.contentContainer}>
                  <View style={styles.titleContainer}>
                    <Text style={styles.heyText}>Hey,</Text>
                    {username ? (
                      <Text style={styles.nameText}>{username}</Text>
                    ) : (
                      <Text style={styles.placeholderNameText}>pick a name</Text>
                    )}
                  </View>

                  <View style={styles.inputContainer}>
                    <SquircleView
                      style={styles.textFieldContainer}
                      squircleParams={{
                        cornerSmoothing: 1,
                        cornerRadius: 16,
                        fillColor: '#FFFFFF',
                      }}>
                      <View style={styles.textFieldContent}>
                        <TextInput
                          style={styles.textInput}
                          placeholder="Enter a unique name"
                          placeholderTextColor="#787878"
                          value={username}
                          onChangeText={(text) => {
                            console.log('[AndroidUsernameModal] TextInput onChangeText. New text:', text);
                            setUsername(text);
                          }}
                          onFocus={() => {
                            console.log('[AndroidUsernameModal] TextInput onFocus.');
                            setKeyboardVisible(true);
                          }}
                          onBlur={() => {
                            console.log('[AndroidUsernameModal] TextInput onBlur.');
                            setKeyboardVisible(false);
                          }}
                        />
                      </View>
                    </SquircleView>

                    {status !== 'empty' && (
                      <View style={styles.statusContainer}>
                        {status === 'checking' && (
                          <>
                            <LoadingSpinner size={16} color="#2D2D2D" style={{ padding: 0 }} />
                            <Text style={styles.statusText}>Checking</Text>
                          </>
                        )}

                        {status === 'available' && (
                          <>
                            <Ionicons name="checkmark-circle" size={16} color="#33CD00" />
                            <Text style={styles.statusText}>Your display name is available 🫡</Text>
                          </>
                        )}

                        {status === 'taken' && (
                          <>
                            <Ionicons name="close-circle" size={16} color="#C9252D" />
                            <Text style={styles.statusText}>Your unique name is taken 😏</Text>
                          </>
                        )}
                      </View>
                    )}
                  </View>
                </View>

                <SquircleView
                  style={styles.buttonContainer}
                  squircleParams={{
                    cornerSmoothing: 1,
                    cornerRadius: 100000,
                    fillColor: '#40FF00',
                  }}>
                  <TouchableOpacity style={styles.button} onPress={handlePressSetUsernameButton}>
                    <Text style={styles.buttonText}>Set username</Text>
                  </TouchableOpacity>
                </SquircleView>
              </View>
            </TouchableOpacity>
          </SquircleView>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalAnimatedContainer: {
    position: 'absolute',
    // top: 400, // Remove fixed top from StyleSheet, it will be set dynamically
    // width is also set dynamically
  },
  modalContainer: {
    padding: 0,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  modalTouchable: {
    width: '100%',
  },
  contentWrapper: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 64,
  },
  contentContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 20,
    alignSelf: 'stretch',
  },
  titleContainer: {
    flexDirection: 'column',
    alignSelf: 'flex-start',
  },
  heyText: {
    fontFamily: 'SF Pro Text',
    fontWeight: '600',
    fontSize: 24,
    lineHeight: 29,
    letterSpacing: -0.42,
    color: '#000000',
  },
  nameText: {
    fontFamily: 'SF Pro Text',
    fontWeight: '600',
    fontSize: 24,
    lineHeight: 29,
    letterSpacing: -0.42,
    color: '#000000',
  },
  placeholderNameText: {
    fontFamily: 'SF Pro Text',
    fontWeight: '600',
    fontSize: 24,
    lineHeight: 29,
    letterSpacing: -0.42,
    color: '#D4D4D4',
  },
  inputContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
    alignSelf: 'stretch',
  },
  textFieldContainer: {
    alignSelf: 'stretch',
  },
  textFieldContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 8,
  },
  textInput: {
    flex: 1,
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 19,
    color: '#000000',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 5,
  },
  statusText: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 17,
    color: '#787878',
  },
  buttonContainer: {
    alignSelf: 'stretch',
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    gap: 8,
  },
  buttonText: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 17,
    textAlign: 'center',
    color: '#000000',
  },
});

export default AndroidUsernameModal;
