import React, { useState, useRef, useEffect } from 'react';
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
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ShippingAddress from './ShippingAddress';

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

// Error circle icon SVG
const errorCircleIconSvg = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8.00033 14.6667C4.31033 14.6667 1.33366 11.69 1.33366 8.00001C1.33366 4.31001 4.31033 1.33334 8.00033 1.33334C11.6903 1.33334 14.667 4.31001 14.667 8.00001C14.667 11.69 11.6903 14.6667 8.00033 14.6667ZM7.33366 7.33334V10.6667H8.66699V7.33334H7.33366ZM7.33366 4.66668V6.00001H8.66699V4.66668H7.33366Z" fill="#C9252D"/>
</svg>`;

// Success circle icon SVG
const successCircleIconSvg = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8.00033 14.6667C4.31033 14.6667 1.33366 11.69 1.33366 8.00001C1.33366 4.31001 4.31033 1.33334 8.00033 1.33334C11.6903 1.33334 14.667 4.31001 14.667 8.00001C14.667 11.69 11.6903 14.6667 8.00033 14.6667ZM6.81366 9.88667L11.077 5.62334C11.3103 5.39001 11.3103 5.01001 11.077 4.77667C10.8437 4.54334 10.4637 4.54334 10.2303 4.77667L6.39033 8.61667L5.76366 8.00001C5.53033 7.76667 5.15033 7.76667 4.91699 8.00001C4.68366 8.23334 4.68366 8.61334 4.91699 8.84667L5.96699 9.88667C6.08366 10.0033 6.24033 10.0633 6.39033 10.0633C6.55033 10.0633 6.69699 10.0033 6.81366 9.88667Z" fill="#33CD00"/>
</svg>`;

interface PhoneInputProps {
  onClose: () => void;
  onBack?: () => void;
  onContinue?: (phoneNumber: string) => void;
  userName?: string;
}

const PHONE_DRAFT_KEY = 'PHONE_DRAFT_DATA';

const PhoneInput: React.FC<PhoneInputProps> = ({
  onClose,
  onBack,
  onContinue,
  userName = 'there',
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showShippingAddress, setShowShippingAddress] = useState(false);

  const phoneInputRef = useRef<TextInput>(null);

  // Load saved draft on initial mount
  useEffect(() => {
    const loadDraft = async () => {
      try {
        const savedDraft = await AsyncStorage.getItem(PHONE_DRAFT_KEY);
        if (savedDraft) {
          const draftData = JSON.parse(savedDraft);
          setPhoneNumber(draftData.phoneNumber || '');
        }
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    };

    loadDraft();
  }, []);

  // Format phone number as "090 XXX XXXX"
  const formatPhoneNumber = (text: string) => {
    // Remove all non-digit characters
    const digitsOnly = text.replace(/\D/g, '').slice(0, 11);

    if (digitsOnly.length <= 3) {
      return digitsOnly;
    } else if (digitsOnly.length <= 6) {
      return `${digitsOnly.slice(0, 3)} ${digitsOnly.slice(3)}`;
    } else if (digitsOnly.length <= 10) {
      return `${digitsOnly.slice(0, 3)} ${digitsOnly.slice(3, 6)} ${digitsOnly.slice(6)}`;
    } else {
      // Format for 11 digits: e.g., "0901 234 5678"
      return `${digitsOnly.slice(0, 4)} ${digitsOnly.slice(4, 7)} ${digitsOnly.slice(7)}`;
    }
  };

  // Handle input changes with formatting
  const handlePhoneNumberChange = (text: string) => {
    const formattedNumber = formatPhoneNumber(text);
    setPhoneNumber(formattedNumber);
  };

  const handleContinue = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Show ShippingAddress component
    setShowShippingAddress(true);

    // Pass the raw phone number without formatting to onContinue if provided
    if (onContinue) {
      const rawPhoneNumber = phoneNumber.replace(/\D/g, '');
      onContinue(rawPhoneNumber);
    }
  };

  // Handler for returning from ShippingAddress to PhoneInput
  const handleBackFromShippingAddress = () => {
    setShowShippingAddress(false);
  };

  // Save the current form state as a draft
  const saveDraft = async () => {
    try {
      if (phoneNumber) {
        const draftData = { phoneNumber };
        await AsyncStorage.setItem(PHONE_DRAFT_KEY, JSON.stringify(draftData));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  // If showShippingAddress is true, render ShippingAddress instead of PhoneInput
  if (showShippingAddress) {
    return (
      <ShippingAddress
        onClose={onClose}
        onBack={handleBackFromShippingAddress}
        userName={userName}
      />
    );
  }

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
            <Text style={styles.titleText}>What's your phone{'\n'}number?</Text>
            <Text style={styles.descriptionText}>We promise not to call you.</Text>
          </View>

          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <SvgXml xml={closeIconSvg} width={24} height={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.phoneContainer}>
          <View style={styles.phoneFieldContainer}>
            <TextInput
              ref={phoneInputRef}
              style={[styles.phoneInput, phoneNumber && styles.filledInput]}
              placeholder="090X XXX XXXX"
              placeholderTextColor="#A2A2A2"
              value={phoneNumber}
              onChangeText={handlePhoneNumberChange}
              keyboardType="number-pad"
              autoFocus
            />
          </View>
        </View>

        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveDraftButton} onPress={saveDraft}>
          <Text style={styles.saveDraftButtonText}>Save draft</Text>
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
    gap: 12,
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
  phoneContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 32,
  },
  phoneFieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    padding: 16,
    paddingHorizontal: 0,
    borderRadius: 16,
    height: 54,
  },
  phoneInput: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 18,
    lineHeight: 22,
    color: '#A2A2A2',
    width: '100%',
    paddingVertical: Platform.select({ android: 0 }),
  },
  filledInput: {
    color: '#121212',
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
  continueButtonText: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 16,
    color: '#000000',
  },
  saveDraftButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 100000,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  saveDraftButtonText: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 17,
    textAlign: 'center',
    color: '#000000',
  },
});

export default PhoneInput;
