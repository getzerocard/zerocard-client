import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useFonts } from 'expo-font';
import { SquircleView } from 'react-native-figma-squircle';

// Import close icon SVG
const closeIconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12.0002 22.75C6.07024 22.75 1.25024 17.93 1.25024 12C1.25024 6.07 6.07024 1.25 12.0002 1.25C17.9302 1.25 22.7502 6.07 22.7502 12C22.7502 17.93 17.9302 22.75 12.0002 22.75ZM12.0002 2.75C6.90024 2.75 2.75024 6.9 2.75024 12C2.75024 17.1 6.90024 21.25 12.0002 21.25C17.1002 21.25 21.2502 17.1 21.2502 12C21.2502 6.9 17.1002 2.75 12.0002 2.75Z" fill="#6A6A6A"/>
<path d="M9.16962 15.58C8.97962 15.58 8.78962 15.51 8.63962 15.36C8.34962 15.07 8.34962 14.59 8.63962 14.3L14.2996 8.63999C14.5896 8.34999 15.0696 8.34999 15.3596 8.63999C15.6496 8.92999 15.6496 9.40998 15.3596 9.69998L9.69962 15.36C9.55962 15.51 9.35962 15.58 9.16962 15.58Z" fill="#6A6A6A"/>
<path d="M14.8296 15.58C14.6396 15.58 14.4496 15.51 14.2996 15.36L8.63962 9.69998C8.34962 9.40998 8.34962 8.92999 8.63962 8.63999C8.92962 8.34999 9.40962 8.34999 9.69962 8.63999L15.3596 14.3C15.6496 14.59 15.6496 15.07 15.3596 15.36C15.2096 15.51 15.0196 15.58 14.8296 15.58Z" fill="#6A6A6A"/>
</svg>`;

// Import info icon SVG
const infoCircleIconSvg = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M7.00033 12.8337C3.78533 12.8337 1.16699 10.2153 1.16699 7.00033C1.16699 3.78533 3.78533 1.16699 7.00033 1.16699C10.2153 1.16699 12.8337 3.78533 12.8337 7.00033C12.8337 10.2153 10.2153 12.8337 7.00033 12.8337ZM6.41699 6.41699V9.91699H7.58366V6.41699H6.41699ZM6.41699 4.08366V5.25033H7.58366V4.08366H6.41699Z" fill="#767676"/>
</svg>`;

// Import back arrow icon SVG
const backArrowIconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M15 19.9201L8.47997 13.4001C7.70997 12.6301 7.70997 11.3701 8.47997 10.6001L15 4.08008" stroke="#A4A4A4" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

interface NameInputProps {
  onClose: () => void;
  onBack?: () => void;
  onContinue?: (firstName: string, lastName: string) => void;
}

const NameInput: React.FC<NameInputProps> = ({ onClose, onBack, onContinue }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const handleContinue = () => {
    if (onContinue && firstName.trim().length > 0 && lastName.trim().length > 0) {
      onContinue(firstName, lastName);
    }
  };

  const isFormValid = firstName.trim().length > 0 && lastName.trim().length > 0;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled">
        {onBack && (
          <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
            <SvgXml xml={backArrowIconSvg} width={24} height={24} />
          </TouchableOpacity>
        )}

        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.titleText}>What's your real{'\n'}name 🙈</Text>
            <Text style={styles.descriptionText}>
              We want to know you more so we'd know what to call you
            </Text>
          </View>

          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <SvgXml xml={closeIconSvg} width={24} height={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.nameFieldsContainer}>
          {/* First name field */}
          <View style={styles.textFieldContainer}>
            <View style={styles.textField}>
              <TextInput
                style={[styles.input, firstName.length > 0 && styles.inputFilled]}
                placeholder="Enter first name"
                placeholderTextColor="#A2A2A2"
                value={firstName}
                onChangeText={setFirstName}
                autoFocus
              />
            </View>
          </View>

          {/* Last name field */}
          <View style={styles.textFieldContainer}>
            <View style={styles.textField}>
              <TextInput
                style={[styles.input, lastName.length > 0 && styles.inputFilled]}
                placeholder="Enter last name"
                placeholderTextColor="#A2A2A2"
                value={lastName}
                onChangeText={setLastName}
              />
            </View>
          </View>

          {/* Info message */}
          <View style={styles.infoContainer}>
            <SvgXml xml={infoCircleIconSvg} width={14} height={14} />
            <Text style={styles.infoText}>Enter your full legal name as on your ID</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.continueButton, !isFormValid && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={!isFormValid}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  scrollContainer: {
    paddingHorizontal: 24,
    flexGrow: 1,
  },
  backButton: {
    position: 'absolute',
    top: 24,
    left: 24,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 34,
    marginTop: 70,
  },
  headerContent: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
    flex: 1,
  },
  titleText: {
    fontFamily: 'SF Pro Text',
    fontWeight: '600',
    fontSize: 24,
    lineHeight: 29,
    color: '#000000',
  },
  descriptionText: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 19,
    color: '#767676',
  },
  closeButton: {
    width: 24,
    height: 24,
  },
  nameFieldsContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 40,
  },
  textFieldContainer: {
    width: '100%',
    alignItems: 'flex-start',
  },
  textField: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  input: {
    flex: 1,
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 19,
    color: '#A2A2A2',
  },
  inputFilled: {
    color: '#121212',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 14,
    color: '#767676',
  },
  continueButton: {
    marginTop: 40,
    backgroundColor: '#40FF00',
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  continueButtonDisabled: {
    backgroundColor: '#E5E5E5',
  },
  continueButtonText: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 16,
    color: '#000000',
  },
});

export default NameInput;
