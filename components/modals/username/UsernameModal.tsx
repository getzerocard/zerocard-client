import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import * as React from 'react';

import { useCheckUsername } from './hooks/useCheckUsername';
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
  onSubmit: (username: string) => Promise<void>;
  initialUsername?: string;
}

type ValidationStatus = 'empty' | 'checking' | 'available' | 'taken';

const UsernameModal: React.FC<UsernameModalProps> = ({
  visible,
  onClose,
  onSubmit,
  initialUsername = '',
}) => {
  const [username, setUsername] = React.useState(initialUsername);
  const [status, setStatus] = React.useState<ValidationStatus>('empty');
  const [isKeyboardVisible, setKeyboardVisible] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
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
    console.log('[UsernameModal] Visibility changed. New visible state:', visible);
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
      console.log('[UsernameModal] keyboardWillShow event');
      setKeyboardVisible(true);
      Animated.timing(modalPosition, {
        toValue: -150, // Move modal up by 150 pixels
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

  // Use the username validation hook
  const { status: validationStatus, error: validationError } = useCheckUsername(username);

  // Update status based on validation results
  React.useEffect(() => {
    setStatus(validationStatus);
    if (validationStatus === 'taken') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else if (validationStatus === 'available') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [validationStatus]);

  // Modified close handler to prevent closing if username not set
  const handleClose = () => {
    console.log('[UsernameModal] handleClose called. hasSetUsername:', hasSetUsername);
    if (hasSetUsername) {
      console.log('[UsernameModal] Username has been set. Calling onClose.');
      Keyboard.dismiss();
      onClose();
    } else {
      console.log('[UsernameModal] Username not set. Alerting user.');
      Alert.alert('Username Required', 'Please set a username before continuing.', [
        { text: 'OK' },
      ]);
    }
  };

  const handleSetUsername = async () => {
    console.log('[UsernameModal] handleSetUsername called. Current username:', username, 'Status from validation hook:', validationStatus, 'Local status:', status);
    if (status === 'available' && username.length > 0) {
      console.log('[UsernameModal] Username available and not empty. Proceeding to set.');
      setLoading(true);
      try {
        console.log('[UsernameModal] Calling onSubmit with username:', username);
        await onSubmit(username);
        setHasSetUsername(true);
        console.log('[UsernameModal] onSubmit successful. Calling onClose.');
        onClose(); // This will internally call handleClose, which now has the dismiss logic
      } catch (error) {
        console.error('Error setting username:', error);
        Alert.alert('Error', 'Failed to set username. Please try again.');
      } finally {
        setLoading(false);
      }
    } else if (status === 'taken') {
      console.log('[UsernameModal] Username taken. Alerting user.');
      Alert.alert(
        'Username Not Available',
        'This username is already taken. Please choose another one.',
        [{ text: 'OK' }]
      );
    } else if (status === 'empty' || username.length === 0) {
      console.log('[UsernameModal] Username empty. Alerting user.');
      Alert.alert('Username Required', 'Please enter a username to continue.', [{ text: 'OK' }]);
    }
  };

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={handleClose}>
      <BlurBackground visible={visible} intensity={40} tint="dark" />

      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => {
        console.log('[UsernameModal] modalOverlay onPress triggered.');
        handleClose();
      }}>
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
              onPress={(e) => {
                console.log('[UsernameModal] modalTouchable onPress triggered (stopPropagation expected).');
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
                            console.log('[UsernameModal] TextInput onChangeText. New text:', text);
                            setUsername(text);
                          }}
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
                    fillColor: loading ? '#A0A0A0' : '#40FF00',
                  }}>
                  <TouchableOpacity 
                    style={styles.button} 
                    onPress={() => {
                      console.log('[UsernameModal] Set Username button onPress triggered.');
                      if (!loading) handleSetUsername();
                    }}
                    disabled={loading}
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
