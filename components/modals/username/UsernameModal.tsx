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

interface UsernameModalProps {
  visible: boolean;
  onClose: () => void;
  onSetUsername: (username: string) => void;
  initialUsername?: string;
}

type ValidationStatus = 'empty' | 'checking' | 'available' | 'taken';

const UsernameModal: React.FC<UsernameModalProps> = ({
  visible,
  onClose,
  onSetUsername,
  initialUsername = '',
}) => {
  const [username, setUsername] = React.useState(initialUsername);
  const [status, setStatus] = React.useState<ValidationStatus>('empty');
  const [isKeyboardVisible, setKeyboardVisible] = React.useState(false);
  const [hasSetUsername, setHasSetUsername] = React.useState(false);

  const opacity = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(100)).current;
  const modalPosition = React.useRef(new Animated.Value(0)).current;
  const { width } = Dimensions.get('window');

  // Reset hasSetUsername when modal becomes visible
  React.useEffect(() => {
    if (visible) {
      setHasSetUsername(false);
    }
  }, [visible]);

  // Handle animation when visibility changes
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

  // Handle keyboard show/hide
  React.useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener('keyboardWillShow', () => {
      setKeyboardVisible(true);
      Animated.timing(modalPosition, {
        toValue: -150, // Move modal up by 150 pixels
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }).start();
    });
    const keyboardWillHideListener = Keyboard.addListener('keyboardWillHide', () => {
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

  // Simulated username validation
  React.useEffect(() => {
    if (username.length === 0) {
      setStatus('empty');
      return;
    }

    // Simulate checking status with a timeout
    setStatus('checking');
    const timer = setTimeout(() => {
      // Simulate API validation - just for demo
      // In a real app, you would make an API call to check username availability
      if (username === 'folajindayo') {
        setStatus('taken');
        // Trigger error haptic feedback for taken username
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else {
        setStatus('available');
        // Trigger success haptic feedback for available username
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [username]);

  // Modified close handler to prevent closing if username not set
  const handleClose = () => {
    if (hasSetUsername) {
      Keyboard.dismiss();
      onClose();
    } else {
      Alert.alert('Username Required', 'Please set a username before continuing.', [
        { text: 'OK' },
      ]);
    }
  };

  const handleSetUsername = () => {
    if (status === 'available' && username.length > 0) {
      onSetUsername(username);
      setHasSetUsername(true);
      onClose();
    } else if (status === 'taken') {
      Alert.alert(
        'Username Not Available',
        'This username is already taken. Please choose another one.',
        [{ text: 'OK' }]
      );
    } else if (status === 'empty' || username.length === 0) {
      Alert.alert('Username Required', 'Please enter a username to continue.', [{ text: 'OK' }]);
    }
  };

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={handleClose}>
      <BlurBackground visible={visible} intensity={40} tint="dark" />

      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={handleClose}>
        <Animated.View
          style={[
            styles.modalAnimatedContainer,
            {
              left: (width - 354) / 2, // Center horizontally
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
              onPress={(e) => e.stopPropagation()}
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
                          onChangeText={setUsername}
                          onFocus={() => setKeyboardVisible(true)}
                          onBlur={() => setKeyboardVisible(false)}
                        />
                      </View>
                    </SquircleView>

                    {/* Status Indicator */}
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
                  <TouchableOpacity style={styles.button} onPress={handleSetUsername}>
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
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalAnimatedContainer: {
    position: 'absolute',
    top: 496,
    width: 354,
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
  spinnerContainer: {
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
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
