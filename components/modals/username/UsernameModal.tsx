import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as React from 'react';

import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
  TextInput,
  Keyboard,
  Alert,
} from 'react-native';
import { SquircleView } from 'react-native-figma-squircle';

import BlurBackground from '../../ui/layout/BlurBackground';
import { LoadingSpinner } from '../../ui/feedback/LoadingSpinner';
import { CommonModalProps } from './hooks/useUsernameModal';

const UsernameModal: React.FC<CommonModalProps> = ({
  visible,
  onClose,
  onSubmit,
  currentUsername,
  onUsernameInputChange,
  usernameStatus,
  isLoadingCheck,
  checkError,
  submissionError,
  isLoadingSubmit
}) => {
  const [isKeyboardVisible, setKeyboardVisible] = React.useState(false);
  const [hasSetUsername, setHasSetUsername] = React.useState(false);

  const opacity = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(100)).current;
  const modalPosition = React.useRef(new Animated.Value(0)).current;
  const { width } = Dimensions.get('window');

  React.useEffect(() => {
    if (visible) {
      setHasSetUsername(false);
    }
    console.log('[UsernameModal] Visibility changed. New visible state:', visible);
  }, [visible]);

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
          easing: Easing.in(Easing.ease),
        }),
        Animated.timing(translateY, {
          toValue: 100,
          duration: 200,
          useNativeDriver: true,
          easing: Easing.in(Easing.ease),
        }),
      ]).start();
    }
  }, [visible, opacity, translateY]);

  React.useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener('keyboardWillShow', () => {
      console.log('[UsernameModal] keyboardWillShow event');
      setKeyboardVisible(true);
      Animated.timing(modalPosition, {
        toValue: -150,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }).start();
    });
    const keyboardWillHideListener = Keyboard.addListener('keyboardWillHide', () => {
      console.log('[UsernameModal] keyboardWillHide event');
      setKeyboardVisible(false);
      Animated.timing(modalPosition, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }).start();
    });

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, [modalPosition]);

  const handleCloseLocal = () => {
    console.log('[UsernameModal] handleCloseLocal called. hasSetUsername:', hasSetUsername);
    if (hasSetUsername || currentUsername.trim().length === 0 && !visible) {
      console.log('[UsernameModal] Username has been set or modal is being dismissed appropriately. Calling onClose.');
      Keyboard.dismiss();
      onClose();
    } else if (!hasSetUsername && visible && currentUsername.trim().length === 0) {
      console.log('[UsernameModal] Empty input and not set, allowing close without alert.');
      Keyboard.dismiss();
      onClose();
    } else if (!hasSetUsername && visible) {
      console.log('[UsernameModal] Username not set and input is not empty. Alerting user.');
      Alert.alert('Username Required', 'Please set a username before continuing.', [{ text: 'OK' }]);
    }
  };

  const handlePressSetUsernameButton = async () => {
    console.log('[UsernameModal] handlePressSetUsernameButton called. Current username from props:', currentUsername, 'Status from props:', usernameStatus);
    
    if (!currentUsername || currentUsername.trim().length === 0) {
      console.log('[UsernameModal] Username is empty. Alerting user.');
      Alert.alert('Username Required', 'Please enter a username to continue.', [{ text: 'OK' }]);
      return;
    }

    try {
      console.log('[UsernameModal] Calling onSubmit (from useUsernameModal) with username:', currentUsername);
      await onSubmit(currentUsername);
      setHasSetUsername(true);
    } catch (error) {
      console.error('[UsernameModal] onSubmit (from useUsernameModal) threw an error:', error);
    }
  };

  const handleTextChange = (text: string) => {
    console.log('[UsernameModal] TextInput onChangeText. New text:', text);
    onUsernameInputChange(text);
  };

  console.log('[UsernameModal] Render. visible prop:', visible, 'usernameStatus from props:', usernameStatus);

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={handleCloseLocal}>
      <BlurBackground visible={visible} intensity={40} tint="dark" />

      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={handleCloseLocal}>
        <Animated.View
          style={[
            styles.modalAnimatedContainer,
            {
              left: (width - 354) / 2,
              opacity,
              transform: [{ translateY }, { translateY: modalPosition }],
            },
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
                console.log('[UsernameModal] modalTouchable onPress.');
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
                      <View style={styles.textFieldContent}>
                        <TextInput
                          style={styles.textInput}
                          placeholder="Enter a unique name"
                          placeholderTextColor="#787878"
                          value={currentUsername}
                          onChangeText={handleTextChange}
                          onFocus={() => {
                            console.log('[UsernameModal] TextInput onFocus.');
                            setKeyboardVisible(true);
                          }}
                          onBlur={() => {
                            console.log('[UsernameModal] TextInput onBlur.');
                            setKeyboardVisible(false);
                          }}
                        />
                      </View>
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
                    onPress={() => {
                      console.log('[UsernameModal] Set Username button onPress triggered.');
                      if (!isLoadingSubmit) handlePressSetUsernameButton();
                    }}
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
  },
  modalAnimatedContainer: {
    position: 'absolute',
    top: 496,
    width: 354,
    zIndex: 1500,
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

export default UsernameModal;
