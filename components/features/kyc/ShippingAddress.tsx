import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import * as Haptics from 'expo-haptics';
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

import SubmissionSummary from './SubmissionSummary';

// Import close icon SVG
const closeIconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12.0002 22.75C6.07024 22.75 1.25024 17.93 1.25024 12C1.25024 6.07 6.07024 1.25 12.0002 1.25C17.9302 1.25 22.7502 6.07 22.7502 12C22.7502 17.93 17.9302 22.75 12.0002 22.75ZM12.0002 2.75C6.90024 2.75 2.75024 6.9 2.75024 12C2.75024 17.1 6.90024 21.25 12.0002 21.25C17.1002 21.25 21.2502 17.1 21.2502 12C21.2502 6.9 17.1002 2.75 12.0002 2.75Z" fill="#6A6A6A"/>
<path d="M9.16962 15.58C8.97962 15.58 8.78962 15.51 8.63962 15.36C8.34962 15.07 8.34962 14.59 8.63962 14.3L14.2996 8.63999C14.5896 8.34999 15.0696 8.34999 15.3596 8.63999C15.6496 8.92999 15.6496 9.40998 15.3596 9.69998L9.69962 15.36C9.55962 15.51 9.35962 15.58 9.16962 15.58Z" fill="#6A6A6A"/>
<path d="M14.8296 15.58C14.6396 15.58 14.4496 15.51 14.2996 15.36L8.63962 9.69998C8.34962 9.40998 8.34962 8.92999 8.63962 8.63999C8.92962 8.34999 9.40962 8.34999 9.69962 8.63999L15.3596 14.3C15.6496 14.59 15.6496 15.07 15.3596 15.36C15.2096 15.51 15.0196 15.58 14.8296 15.58Z" fill="#6A6A6A"/>
</svg>`;

// Import back arrow icon SVG
const backArrowIconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M15 19.9201L8.47997 13.4001C7.70997 12.6301 7.70997 11.3701 8.47997 10.6001L15 4.08008" stroke="#A4A4A4" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// Arrow down icon for state dropdown
const arrowDownIconSvg = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4.94 5.72656L8 8.7799L11.06 5.72656L12 6.66656L8 10.6666L4 6.66656L4.94 5.72656Z" fill="#292D32"/>
</svg>`;

interface ShippingAddressProps {
  onClose: () => void;
  onBack?: () => void;
  onContinue?: (addressData: AddressData) => void;
  userName?: string;
  userInfo?: {
    firstName: string;
    lastName: string;
    dob: string;
    phoneNumber: string;
  };
}

interface AddressData {
  street: string;
  city: string;
  state: string;
  postalCode: string;
}

const ADDRESS_DRAFT_KEY = 'ADDRESS_DRAFT_DATA';

// Nigerian states
const NIGERIAN_STATES = [
  'Abia',
  'Adamawa',
  'Akwa Ibom',
  'Anambra',
  'Bauchi',
  'Bayelsa',
  'Benue',
  'Borno',
  'Cross River',
  'Delta',
  'Ebonyi',
  'Edo',
  'Ekiti',
  'Enugu',
  'FCT - Abuja',
  'Gombe',
  'Imo',
  'Jigawa',
  'Kaduna',
  'Kano',
  'Katsina',
  'Kebbi',
  'Kogi',
  'Kwara',
  'Lagos',
  'Nasarawa',
  'Niger',
  'Ogun',
  'Ondo',
  'Osun',
  'Oyo',
  'Plateau',
  'Rivers',
  'Sokoto',
  'Taraba',
  'Yobe',
  'Zamfara',
];

const ShippingAddress: React.FC<ShippingAddressProps> = ({
  onClose,
  onBack,
  onContinue,
  userName = 'there',
  userInfo = {
    firstName: '',
    lastName: '',
    dob: '',
    phoneNumber: '',
  },
}) => {
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showSubmissionSummary, setShowSubmissionSummary] = useState(false);

  const streetRef = useRef<TextInput>(null);
  const cityRef = useRef<TextInput>(null);
  const postalCodeRef = useRef<TextInput>(null);

  // Load saved draft on initial mount
  useEffect(() => {
    const loadDraft = async () => {
      try {
        const savedDraft = await AsyncStorage.getItem(ADDRESS_DRAFT_KEY);
        if (savedDraft) {
          const draftData = JSON.parse(savedDraft);
          setStreet(draftData.street || '');
          setCity(draftData.city || '');
          setState(draftData.state || '');
          setPostalCode(draftData.postalCode || '');
        }
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    };

    loadDraft();
  }, []);

  const handleContinue = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Show Submission Summary
    setShowSubmissionSummary(true);

    // Call the onContinue prop if provided
    if (onContinue) {
      const addressData: AddressData = {
        street,
        city,
        state,
        postalCode,
      };

      onContinue(addressData);
    }
  };

  // Handler for returning from SubmissionSummary to ShippingAddress
  const handleBackFromSubmissionSummary = () => {
    setShowSubmissionSummary(false);
  };

  // Save the current form state as a draft
  const saveDraft = async () => {
    try {
      if (street || city || state || postalCode) {
        const draftData = { street, city, state, postalCode };
        await AsyncStorage.setItem(ADDRESS_DRAFT_KEY, JSON.stringify(draftData));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleStatePress = () => {
    setShowStateDropdown(!showStateDropdown);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const selectState = (selectedState: string) => {
    setState(selectedState);
    setShowStateDropdown(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    postalCodeRef.current?.focus();
  };

  // If showSubmissionSummary is true, render SubmissionSummary instead of ShippingAddress
  if (showSubmissionSummary) {
    const userData = {
      ...userInfo,
      street,
      city,
      state,
      postalCode,
    };

    return (
      <SubmissionSummary
        onClose={onClose}
        onEdit={handleBackFromSubmissionSummary}
        onContinue={() => {
          // Final submission logic would go here
          onClose(); // For now, just close the form flow
        }}
        userData={userData}
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
            <Text style={styles.titleText}>Where would you like your{'\n'}card delivered?</Text>
            <Text style={styles.descriptionText}>
              Tell us where you live and get your card, flash speed
            </Text>
          </View>

          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <SvgXml xml={closeIconSvg} width={24} height={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.addressFieldsContainer}>
          {/* Street */}
          <View style={styles.inputContainer}>
            <TextInput
              ref={streetRef}
              style={[styles.textInput, street ? styles.filledInput : null]}
              placeholder="Street"
              placeholderTextColor="#A2A2A2"
              value={street}
              onChangeText={setStreet}
              autoFocus
              onSubmitEditing={() => cityRef.current?.focus()}
              returnKeyType="next"
            />
          </View>

          {/* City and State row */}
          <View style={styles.rowContainer}>
            {/* City */}
            <View style={styles.halfInputContainer}>
              <TextInput
                ref={cityRef}
                style={[styles.textInput, city ? styles.filledInput : null]}
                placeholder="City"
                placeholderTextColor="#A2A2A2"
                value={city}
                onChangeText={setCity}
                returnKeyType="next"
                onSubmitEditing={handleStatePress}
              />
            </View>

            {/* State */}
            <View style={styles.halfInputContainer}>
              <TouchableOpacity
                style={[styles.textInput, styles.stateInput]}
                onPress={handleStatePress}>
                <Text style={[styles.stateText, state ? styles.filledStateText : null]}>
                  {state || 'State'}
                </Text>
                <SvgXml xml={arrowDownIconSvg} width={16} height={16} />
              </TouchableOpacity>

              {showStateDropdown && (
                <View style={styles.stateDropdown}>
                  <ScrollView style={styles.stateScrollView} nestedScrollEnabled>
                    {NIGERIAN_STATES.map((stateName) => (
                      <TouchableOpacity
                        key={stateName}
                        style={styles.stateOption}
                        onPress={() => selectState(stateName)}>
                        <Text
                          style={[
                            styles.stateOptionText,
                            stateName === state ? styles.selectedStateText : null,
                          ]}>
                          {stateName}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>

          {/* Postal Code */}
          <View style={styles.inputContainer}>
            <TextInput
              ref={postalCodeRef}
              style={[styles.textInput, postalCode ? styles.filledInput : null]}
              placeholder="Postal code"
              placeholderTextColor="#A2A2A2"
              value={postalCode}
              onChangeText={setPostalCode}
              keyboardType="number-pad"
              maxLength={6}
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
  addressFieldsContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
    marginTop: 32,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 8,
  },
  rowContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 8,
    marginBottom: 8,
  },
  halfInputContainer: {
    flex: 1,
    position: 'relative',
  },
  textInput: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    color: '#A2A2A2',
    height: 51,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  stateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stateText: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 16,
    color: '#A2A2A2',
  },
  filledInput: {
    color: '#121212',
  },
  filledStateText: {
    color: '#121212',
  },
  stateDropdown: {
    position: 'absolute',
    top: 55,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    maxHeight: 200,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  stateScrollView: {
    maxHeight: 200,
  },
  stateOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  stateOptionText: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 16,
    color: '#292D32',
  },
  selectedStateText: {
    color: '#40FF00',
    fontWeight: '600',
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

export default ShippingAddress;
