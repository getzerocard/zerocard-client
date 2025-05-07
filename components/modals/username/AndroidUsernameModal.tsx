import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect, useRef } from 'react';
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
} from 'react-native';
import { SquircleView } from 'react-native-figma-squircle';

import { useUsernameModal } from './useUsernameModal';
import { Button } from '../../ui/Button';
import { LoadingSpinner } from '../../ui/feedback/LoadingSpinner';

interface AndroidUsernameModalProps {
  customOnClose?: () => void;
  customOnSubmit?: (username: string) => Promise<void>;
}

export default function AndroidUsernameModal({ customOnClose, customOnSubmit }: AndroidUsernameModalProps) {
  const { isVisible, hideUsernameModal, setUsername } = useUsernameModal();
  const [localUsername, setLocalUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const translateY = useRef(new Animated.Value(300)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 300,
          duration: 200,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, translateY, opacity]);

  const handleSetUsername = async () => {
    if (localUsername.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await setUsername(localUsername);
    } catch (err) {
      setError('Failed to set username. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setLocalUsername('');
    setError('');
    setLoading(false);
    hideUsernameModal();
  };

  return (
    <Modal transparent visible={isVisible} animationType="none" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}>
        <Animated.View style={[styles.animatedContainer, { opacity }]}>
          <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleClose} />
          <Animated.View
            style={[
              styles.modalContainer,
              {
                transform: [{ translateY }],
              },
            ]}>
            <SquircleView
              style={styles.modalContent}
              squircleParams={{
                cornerSmoothing: 1,
                cornerRadius: 24,
                fillColor: '#FFFFFF',
              }}>
              <View style={styles.header}>
                <Text style={styles.title}>Set Username</Text>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                  <Ionicons name="close-circle" size={28} color="#CCCCCC" />
                </TouchableOpacity>
              </View>
              <Text style={styles.subtitle}>
                Choose a unique username for your ZeroCard account.
              </Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputPrefix}>@</Text>
                <TextInput
                  style={styles.input}
                  value={localUsername}
                  onChangeText={setLocalUsername}
                  placeholder="username"
                  placeholderTextColor="#B0B0B0"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              <Button
                title={loading ? '' : 'Confirm Username'}
                onPress={handleSetUsername}
                variant="primary"
                disabled={loading}
                style={styles.confirmButton}>
                {loading && <LoadingSpinner size="small" color="#FFFFFF" />}
              </Button>
            </SquircleView>
          </Animated.View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  animatedContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalContainer: {
    width: '100%',
  },
  modalContent: {
    width: '100%',
    padding: 24,
    paddingTop: 32,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#121212',
    fontFamily: 'SF Pro Display',
  },
  closeButton: {
    padding: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#666666',
    marginBottom: 24,
    fontFamily: 'SF Pro Text',
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  inputPrefix: {
    fontSize: 16,
    color: '#838383',
    marginRight: 4,
    fontFamily: 'SF Pro Text',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#121212',
    fontFamily: 'SF Pro Text',
  },
  errorText: {
    color: 'red',
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'SF Pro Text',
  },
  confirmButton: {
    marginTop: 12,
  },
});
