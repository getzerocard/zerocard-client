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

import { LoadingSpinner } from '../../ui/feedback/LoadingSpinner';
import BlurBackground from '../../ui/layout/BlurBackground';
import { CommonModalProps } from './hooks/useUsernameModal';

const useDeviceDetection = () => {
  const windowDim = Dimensions.get('window');
  const screenDim = Dimensions.get('screen');
  const insets = useSafeAreaInsets();
  
  return useMemo(() => {
    const { width, height } = windowDim;
    const isSmallDevice = width < 375;
    // const isMediumDevice = width >= 375 && width < 414; // Example, not directly used by modalPositionPercentage logic below
    // const isLargeDevice = width >= 414; // Example
    
    const isShortDevice = height < 700;
    // const isTallDevice = height > 800; // Example
        
    let modalPositionPercentage = 0.6; // Default for medium devices
    if (isSmallDevice && isShortDevice) {
      modalPositionPercentage = 0.5; 
    } else if (width >= 414 && height > 800) { // Example for large & tall
      modalPositionPercentage = 0.62;
    }
    
    return {
      window: windowDim,
      screen: screenDim,
      insets,
      modalPositionPercentage,
      // statusBarHeight: StatusBar.currentHeight || 0, // Not directly used by component from props
    };
  }, [windowDim, screenDim, insets]);
};

const AndroidUsernameModal: React.FC<CommonModalProps> = ({
  visible,
  onClose,
  onSubmit,
  currentUsername,
  onUsernameInputChange,
  usernameStatus,
  isLoadingCheck,
  checkError,
  submissionError,
  isLoadingSubmit,
}) => {
  const [hasSetUsername, setHasSetUsername] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  
  const inputRef = useRef<TextInput>(null);
  const deviceInfo = useDeviceDetection();
  const { window: { width: screenWidth, height: screenHeight }, modalPositionPercentage } = deviceInfo;
  
  const translateY = useSharedValue(screenHeight);
  const opacity = useSharedValue(0);
  const modalPosition = useSharedValue(0);
  
  const modalContentWidth = useMemo(() => screenWidth * 0.9, [screenWidth]);
  const modalTopPosition = useMemo(() => 
    screenHeight * modalPositionPercentage, 
    [screenHeight, modalPositionPercentage]
  );

  const forceShowKeyboard = useCallback(() => {
    if (Platform.OS === 'android') {
      if (inputRef.current) {
        console.log('[AndroidUsernameModal] Force showing keyboard for Samsung device');
        inputRef.current.blur();
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
            setTimeout(() => {
              if (inputRef.current) inputRef.current.focus();
            }, 100);
          }
        }, 50);
      }
    }
  }, []);
  
  useEffect(() => {
    if (visible && Platform.OS === 'android') {
      const backHandler = Keyboard.addListener('keyboardDidHide', () => {
        if (visible && isKeyboardVisible) {
          console.log('[AndroidUsernameModal] Keyboard unexpectedly hidden, trying to restore it');
          forceShowKeyboard();
        }
      });
      return () => backHandler.remove();
    }
  }, [visible, isKeyboardVisible, forceShowKeyboard]);

  useEffect(() => {
    if (visible) {
      StatusBar.setTranslucent(true);
      StatusBar.setBackgroundColor('transparent');
    } else {
      if (Platform.OS === 'android') {
        StatusBar.setTranslucent(false);
        StatusBar.setBackgroundColor('#f7f7f7');
      }
    }
    return () => {
      if (Platform.OS === 'android') {
        StatusBar.setTranslucent(false);
        StatusBar.setBackgroundColor('#f7f7f7');
      }
    };
  }, [visible]);

  useEffect(() => {
    if (visible) {
      setHasSetUsername(false);
      opacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) });
      translateY.value = withSpring(0, { damping: 15, stiffness: 100 });
      const focusTimer = setTimeout(() => {
        if (inputRef.current) {
          console.log('[AndroidUsernameModal] Attempting to focus input after modal appears');
          inputRef.current.focus();
        }
      }, 500);
      return () => clearTimeout(focusTimer);
    } else {
      opacity.value = withTiming(0, { duration: 200, easing: Easing.in(Easing.ease) });
      translateY.value = withSpring(screenHeight, { damping: 15, stiffness: 100 });
    }
    console.log('[AndroidUsernameModal] Visibility changed (useEffect). New visible state:', visible);
  }, [visible, opacity, translateY, screenHeight]);

  useEffect(() => {
    const keyboardShowEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const keyboardHideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const keyboardShowListener = Keyboard.addListener(keyboardShowEvent, (event) => {
      console.log('[AndroidUsernameModal] Keyboard show event');
      setKeyboardVisible(true);
      const keyboardHeight = event.endCoordinates.height;
      const inputBottom = screenHeight * modalPositionPercentage + 200;
      const visibleAreaWithKeyboard = screenHeight - keyboardHeight;
      const needsToMoveUp = inputBottom > visibleAreaWithKeyboard;
      const moveUpDistance = needsToMoveUp ? -(inputBottom - visibleAreaWithKeyboard + 50) : 0;
      modalPosition.value = withTiming(moveUpDistance, { duration: 300, easing: Easing.out(Easing.ease) });
    });

    const keyboardHideListener = Keyboard.addListener(keyboardHideEvent, () => {
      console.log('[AndroidUsernameModal] Keyboard hide event');
      setKeyboardVisible(false);
      modalPosition.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.ease) });
    });

    return () => {
      keyboardShowListener.remove();
      keyboardHideListener.remove();
    };
  }, [modalPosition, screenHeight, modalPositionPercentage]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const modalStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }, { translateY: modalPosition.value }] }));

  const handlePressSetUsernameButton = useCallback(async () => {
    console.log('[AndroidUsernameModal] "Set Username" button pressed. Current username from props:', currentUsername);

    if (!currentUsername || currentUsername.trim().length === 0) {
      console.log('[AndroidUsernameModal] Username is empty locally. Alerting user.');
      Alert.alert('Username Required', 'Please enter a username to continue.', [{ text: 'OK' }]);
      return;
    }

    try {
      console.log('[AndroidUsernameModal] Calling onSubmit (from useUsernameModal) with username:', currentUsername);
      await onSubmit(currentUsername);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setHasSetUsername(true);
    } catch (e) {
      console.log('[AndroidUsernameModal] onSubmit (from useUsernameModal) threw an error. Error should be handled by useUsernameModal or displayed via submissionError prop.', e);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [currentUsername, onSubmit]);

  const handleCloseLocal = useCallback(() => {
    console.log('[AndroidUsernameModal] handleCloseLocal called. hasSetUsername:', hasSetUsername);
    if (!hasSetUsername && visible && currentUsername.trim().length === 0) {
      console.log('[AndroidUsernameModal] Attempting to close modal via overlay/back without setting username. Alerting.');
      Alert.alert('Username Required', 'Please set a username before continuing.', [{ text: 'OK' }]);
    } else {
      onClose();
    }
  }, [hasSetUsername, visible, onClose, currentUsername]);

  const handleTextChange = useCallback((text: string) => {
    console.log('[AndroidUsernameModal] TextInput onChangeText. New text:', text);
    onUsernameInputChange(text);
  }, [onUsernameInputChange]);

  console.log('[AndroidUsernameModal] Render. visible prop:', visible, 'usernameStatus from props:', usernameStatus);

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={handleCloseLocal} statusBarTranslucent={true}>
      <BlurBackground visible={visible} intensity={40} tint="dark" />
      
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={handleCloseLocal}>
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
                    {currentUsername ? (
                      <Text style={styles.nameText}>{currentUsername}</Text>
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
                            value={currentUsername}
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

                    {submissionError && (
                      <View style={styles.statusContainer}>
                        <Ionicons name="alert-circle-outline" size={16} color="#C9252D" />
                        <Text style={styles.statusText}>{submissionError}</Text>
                      </View>
                    )}

                    {!submissionError && usernameStatus !== 'empty' && (
                      <View style={styles.statusContainer}>
                        {isLoadingCheck && (
                          <>
                            <LoadingSpinner size={16} color="#2D2D2D" style={{ padding: 0 }} />
                            <Text style={styles.statusText}>Checking</Text>
                          </>
                        )}
                        {!isLoadingCheck && usernameStatus === 'available' && (
                          <>
                            <Ionicons name="checkmark-circle" size={16} color="#33CD00" />
                            <Text style={styles.statusText}>Your display name is available 🫡</Text>
                          </>
                        )}
                        {!isLoadingCheck && usernameStatus === 'taken' && (
                          <>
                            <Ionicons name="close-circle" size={16} color="#C9252D" />
                            <Text style={styles.statusText}>Your unique name is taken 😏</Text>
                          </>
                        )}
                        {!isLoadingCheck && checkError && usernameStatus !== 'available' && usernameStatus !== 'taken' && (
                          <>
                            <Ionicons name="warning-outline" size={16} color="#FF8C00" />
                            <Text style={styles.statusText}>{checkError}</Text>
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
                    fillColor: (isLoadingSubmit || usernameStatus !== 'available') ? '#A0A0A0' : '#40FF00',
                  }}>
                  <TouchableOpacity 
                    style={styles.button} 
                    onPress={handlePressSetUsernameButton}
                    disabled={isLoadingSubmit || usernameStatus !== 'available'}
                  >
                    {isLoadingSubmit ? (
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
