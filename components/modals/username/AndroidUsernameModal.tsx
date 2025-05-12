import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  Keyboard,
  StatusBar,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { SquircleView } from 'react-native-figma-squircle';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '../../ui/Button';
import { LoadingSpinner } from '../../ui/feedback/LoadingSpinner';
import { useCheckUsername } from './hooks/useCheckUsername';
import BlurBackground from '../../ui/layout/BlurBackground';

import { CommonModalProps } from './hooks/useUsernameModal';

type AndroidUsernameModalProps = CommonModalProps;

// Device detection utility
const useDeviceDetection = () => {
  const window = Dimensions.get('window');
  const screen = Dimensions.get('screen');
  const insets = useSafeAreaInsets();
  
  return useMemo(() => {
    const isSmallDevice = window.width < 375;
    const isMediumDevice = window.width >= 375 && window.width < 414;
    const isLargeDevice = window.width >= 414;
    
    const isShortDevice = window.height < 700;
    const isTallDevice = window.height > 800;
    
    // Calculate modal position based on device characteristics
    let modalPositionPercentage = 0.6; // Default for medium devices
    
    if (isSmallDevice && isShortDevice) {
      modalPositionPercentage = 0.5; // Center on small and short devices
    } else if (isLargeDevice && isTallDevice) {
      modalPositionPercentage = 0.62;
    }
    
    return {
      window,
      screen,
      insets,
      isSmallDevice,
      isMediumDevice,
      isLargeDevice,
      isShortDevice,
      isTallDevice,
      modalPositionPercentage,
      statusBarHeight: StatusBar.currentHeight || 0,
    };
  }, [window, screen, insets]);
};

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
  
  // Create a ref for the text input
  const inputRef = useRef<TextInput>(null);
  
  // Use device detection
  const deviceInfo = useDeviceDetection();
  const { window: { width: screenWidth, height: screenHeight }, modalPositionPercentage } = deviceInfo;
  
  // Animation values
  const translateY = useSharedValue(screenHeight);
  const opacity = useSharedValue(0);
  const modalPosition = useSharedValue(0);
  
  // Memoized values
  const modalContentWidth = useMemo(() => screenWidth * 0.9, [screenWidth]);
  const modalTopPosition = useMemo(() => 
    screenHeight * modalPositionPercentage, 
    [screenHeight, modalPositionPercentage]
  );

  const { status, error } = useCheckUsername(username);

  // Function to force keyboard to appear (particularly helpful for Samsung devices)
  const forceShowKeyboard = useCallback(() => {
    if (Platform.OS === 'android') {
      if (inputRef.current) {
        console.log('[AndroidUsernameModal] Force showing keyboard for Samsung device');
        // Try multiple focus attempts with slight delays
        inputRef.current.blur();
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
            // Some Samsung devices need a second attempt
            setTimeout(() => {
              if (inputRef.current) inputRef.current.focus();
            }, 100);
          }
        }, 50);
      }
    }
  }, []);
  
  // Add Samsung-specific keyboard workaround
  useEffect(() => {
    if (visible && Platform.OS === 'android') {
      const backHandler = Keyboard.addListener('keyboardDidHide', () => {
        // Check if we still need the keyboard (modal is visible and input was focused)
        if (visible && isKeyboardVisible) {
          console.log('[AndroidUsernameModal] Keyboard unexpectedly hidden, trying to restore it');
          forceShowKeyboard();
        }
      });
      
      return () => {
        backHandler.remove();
      };
    }
  }, [visible, isKeyboardVisible, forceShowKeyboard]);

  // Make status bar transparent when modal is visible
  useEffect(() => {
    if (visible) {
      StatusBar.setTranslucent(true);
      StatusBar.setBackgroundColor('transparent');
    } else {
      // Reset to default when modal is hidden (optional - depends on app's needs)
      if (Platform.OS === 'android') {
        StatusBar.setTranslucent(false);
        StatusBar.setBackgroundColor('#f7f7f7');
      }
    }
    
    return () => {
      // Reset on unmount
      if (Platform.OS === 'android') {
        StatusBar.setTranslucent(false);
        StatusBar.setBackgroundColor('#f7f7f7');
      }
    };
  }, [visible]);

  // Reset hasSetUsername when modal becomes visible
  useEffect(() => {
    if (visible) {
      setHasSetUsername(false);
      // Trigger show animations
      opacity.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      });
      translateY.value = withSpring(0, {
        damping: 15,
        stiffness: 100,
      });
      
      // Samsung device fix: try to focus the input after modal appears
      const focusTimer = setTimeout(() => {
        if (inputRef.current) {
          console.log('[AndroidUsernameModal] Attempting to focus input after modal appears');
          inputRef.current.focus();
        }
      }, 500);
      
      return () => clearTimeout(focusTimer);
    } else {
      // Trigger hide animations
      opacity.value = withTiming(0, {
        duration: 200,
        easing: Easing.in(Easing.ease),
      });
      translateY.value = withSpring(screenHeight, {
        damping: 15,
        stiffness: 100,
      });
    }
    console.log('[AndroidUsernameModal] Visibility changed (useEffect). New visible state:', visible);
  }, [visible, opacity, translateY, screenHeight]);

  // Handle keyboard show/hide with animations
  useEffect(() => {
    // Use different event names based on platform
    const keyboardShowEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const keyboardHideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const keyboardShowListener = Keyboard.addListener(keyboardShowEvent, (event) => {
      console.log('[AndroidUsernameModal] Keyboard show event');
      setKeyboardVisible(true);
      
      // Calculate how much to move the modal up based on keyboard height and screen size
      const keyboardHeight = event.endCoordinates.height;
      const inputBottom = screenHeight * modalPositionPercentage + 200; // Approximate position of input bottom
      const visibleAreaWithKeyboard = screenHeight - keyboardHeight;
      const needsToMoveUp = inputBottom > visibleAreaWithKeyboard;
      
      // Move up enough to keep the input field visible
      const moveUpDistance = needsToMoveUp ? -(inputBottom - visibleAreaWithKeyboard + 50) : 0;
      
      modalPosition.value = withTiming(moveUpDistance, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      });
    });

    const keyboardHideListener = Keyboard.addListener(keyboardHideEvent, () => {
      console.log('[AndroidUsernameModal] Keyboard hide event');
      setKeyboardVisible(false);
      modalPosition.value = withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      });
    });

    return () => {
      keyboardShowListener.remove();
      keyboardHideListener.remove();
    };
  }, [modalPosition, screenHeight, modalPositionPercentage]);

  // Memoized styles
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const modalStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateY: modalPosition.value },
    ],
  }));

  // Memoized handlers
  const handlePressSetUsernameButton = useCallback(async () => {
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
      await onSubmit(trimmedUsername);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      console.log('[AndroidUsernameModal] onSubmit (from useUsernameModal) threw an error. Error should be handled in useUsernameModal.', e);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  }, [username, onSubmit]);

  const handleClose = useCallback(() => {
    console.log('[AndroidUsernameModal] handleClose called (local). hasSetUsername:', hasSetUsername);
    if (!hasSetUsername && visible) {
      console.log('[AndroidUsernameModal] Attempting to close modal via overlay/back without setting username. Alerting.');
      Alert.alert('Username Required', 'Please set a username before continuing.', [
        { text: 'OK' },
      ]);
    } else {
      onClose();
    }
  }, [hasSetUsername, visible, onClose]);

  const handleTextChange = useCallback((text: string) => {
    console.log('[AndroidUsernameModal] TextInput onChangeText. New text:', text);
    setUsername(text);
  }, []);

  console.log('[AndroidUsernameModal] Render. visible prop:', visible);

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={handleClose} statusBarTranslucent={true}>
      <BlurBackground visible={visible} intensity={40} tint="dark" />
      
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={handleClose}>
        <Animated.View
          style={[
            styles.modalAnimatedContainer,
            {
              width: modalContentWidth,
              left: (screenWidth - modalContentWidth) / 2,
              top: modalTopPosition,
              zIndex: 1500,
              elevation: 5,
            },
            modalStyle,
          ]}>
          <SquircleView
            style={styles.modalContainer}
            squircleParams={{
              cornerSmoothing: 1,
              cornerRadius: 30,
              fillColor: '#F7F7F7',
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
                      <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => {
                          console.log('[AndroidUsernameModal] TextFieldContainer pressed, focusing input');
                          forceShowKeyboard();
                        }}
                        style={{ flex: 1 }}
                      >
                        <View style={styles.textFieldContent}>
                          <TextInput
                            ref={inputRef}
                            style={styles.textInput}
                            placeholder="Enter a unique name"
                            placeholderTextColor="#787878"
                            value={username}
                            onChangeText={handleTextChange}
                            onFocus={() => {
                              console.log('[AndroidUsernameModal] TextInput onFocus.');
                              setKeyboardVisible(true);
                            }}
                            onBlur={() => {
                              console.log('[AndroidUsernameModal] TextInput onBlur.');
                              setKeyboardVisible(false);
                            }}
                            autoCapitalize="none"
                            autoCorrect={false}
                            returnKeyType="done"
                            blurOnSubmit={true}
                            // Additional Samsung-specific fixes
                            caretHidden={false}
                            keyboardType="visible-password"
                            contextMenuHidden={false}
                            selectionColor="#40FF00"
                            enablesReturnKeyAutomatically={false}
                            underlineColorAndroid="transparent"
                            showSoftInputOnFocus={true}
                          />
                        </View>
                      </TouchableOpacity>
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
                    fillColor: loading ? '#A0A0A0' : '#40FF00',
                  }}>
                  <TouchableOpacity 
                    style={styles.button} 
                    onPress={handlePressSetUsernameButton}
                    disabled={loading || status !== 'available'}
                  >
                    {loading ? (
                      <LoadingSpinner size="small" color="#000000" style={{ padding: 0 }} />
                    ) : (
                      <Text style={styles.buttonText}>Set username</Text>
                    )}
                  </TouchableOpacity>
                </SquircleView>
              </View>
            </TouchableOpacity>
          </SquircleView>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    elevation: 2,
  },
  modalAnimatedContainer: {
    position: 'absolute',
    zIndex: 1500,
    elevation: 5,
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
