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
import PhoneInput from './PhoneInput';

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

interface DOBInputProps {
  onClose: () => void;
  onBack?: () => void;
  onContinue?: (dob: string) => void;
  userName?: string;
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const DOB_DRAFT_KEY = 'DOB_DRAFT_DATA';

const DOBInput: React.FC<DOBInputProps> = ({ onClose, onBack, onContinue, userName = 'there' }) => {
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [focused, setFocused] = useState<'year' | 'month' | 'day'>('year');
  const [isTouched, setIsTouched] = useState(false);
  const [showPhoneInput, setShowPhoneInput] = useState(false);

  const yearRef = useRef<TextInput>(null);
  const monthRef = useRef<TextInput>(null);
  const dayRef = useRef<TextInput>(null);

  // Load saved draft on initial mount
  useEffect(() => {
    const loadDraft = async () => {
      try {
        const savedDraft = await AsyncStorage.getItem(DOB_DRAFT_KEY);
        if (savedDraft) {
          const draftData = JSON.parse(savedDraft);
          setYear(draftData.year || '');
          setMonth(draftData.month || '');
          setDay(draftData.day || '');
          if (draftData.year || draftData.month || draftData.day) {
            setIsTouched(true);
          }
        }
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    };

    loadDraft();
  }, []);

  // Validation functions
  const isYearValid = () => {
    if (!year) return true; // Empty is not invalid
    const yearNum = parseInt(year);
    return year.length === 4 && yearNum >= 1900 && yearNum <= new Date().getFullYear() - 18;
  };

  const isMonthValid = () => {
    if (!month) return true; // Empty is not invalid
    const monthNum = parseInt(month);
    return monthNum >= 1 && monthNum <= 12;
  };

  const isDayValid = () => {
    if (!day) return true; // Empty is not invalid
    const dayNum = parseInt(day);
    const monthNum = parseInt(month) || 1;
    const yearNum = parseInt(year) || 2000;

    // Get last day of the month
    const lastDay = new Date(yearNum, monthNum, 0).getDate();
    return dayNum >= 1 && dayNum <= lastDay;
  };

  const isFormComplete = year && month && day;
  const isFormValid = isYearValid() && isMonthValid() && isDayValid() && isFormComplete;

  // Handle input changes with proper formatting and validation
  const handleYearChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '').slice(0, 4);
    setYear(numericValue);
    setIsTouched(true);

    // Move to month input when year is fully entered
    if (numericValue.length === 4) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      monthRef.current?.focus();
      setFocused('month');
    }
  };

  const handleMonthChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '').slice(0, 2);
    setMonth(numericValue);
    setIsTouched(true);

    // Auto-format month (01-12) and move to day
    if (numericValue.length === 1 && parseInt(numericValue) > 1) {
      // If user enters a month > 1, prepend a 0 (e.g., "5" becomes "05")
      setMonth(`0${numericValue}`);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      dayRef.current?.focus();
      setFocused('day');
    } else if (numericValue.length === 2) {
      // If user enters two digits, move to day
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      dayRef.current?.focus();
      setFocused('day');
    }
  };

  const handleDayChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '').slice(0, 2);
    setDay(numericValue);
    setIsTouched(true);

    // Auto-format day (01-31) and blur field when complete
    if (numericValue.length === 1 && parseInt(numericValue) > 3) {
      // If user enters a day > 3, prepend a 0 (e.g., "5" becomes "05")
      setDay(`0${numericValue}`);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      dayRef.current?.blur();
    } else if (numericValue.length === 2) {
      // If user enters two digits, blur
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      dayRef.current?.blur();
    }
  };

  const formatDateInWords = () => {
    if (!isFormComplete || !isFormValid) return null;

    const monthName = MONTHS[parseInt(month) - 1];
    const formattedDay = parseInt(day).toString();
    return `${monthName} ${formattedDay}, ${year}`;
  };

  const handleContinue = () => {
    if (isFormValid) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const formattedDOB = `${year}-${month}-${day}`;

      // Show PhoneInput component instead of calling onContinue
      setShowPhoneInput(true);

      // If onContinue prop is provided, call it with the formatted date
      if (onContinue) {
        onContinue(formattedDOB);
      }
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  // Handler for returning from PhoneInput to DOBInput
  const handleBackFromPhoneInput = () => {
    setShowPhoneInput(false);
  };

  // Save the current form state as a draft
  const saveDraft = async () => {
    try {
      if (year || month || day) {
        const draftData = { year, month, day };
        await AsyncStorage.setItem(DOB_DRAFT_KEY, JSON.stringify(draftData));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  // If showPhoneInput is true, render PhoneInput instead of DOBInput
  if (showPhoneInput) {
    return <PhoneInput onClose={onClose} onBack={handleBackFromPhoneInput} userName={userName} />;
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
            <Text style={styles.titleText}>
              When were you{'\n'}born, {userName}? 🎂
            </Text>
            <Text style={styles.descriptionText}>
              Birthdays are important, and we don't want to miss yours
            </Text>
          </View>

          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <SvgXml xml={closeIconSvg} width={24} height={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.dobContainer}>
          <View style={styles.dateFieldContainer}>
            <View style={styles.dateInputRow}>
              {/* Year Field */}
              <TextInput
                ref={yearRef}
                style={[
                  styles.yearInput,
                  year && styles.filledInput,
                  year && !isYearValid() && styles.invalidInput,
                ]}
                placeholder="YYYY"
                placeholderTextColor="#A2A2A2"
                value={year}
                onChangeText={handleYearChange}
                keyboardType="number-pad"
                maxLength={4}
                onFocus={() => setFocused('year')}
                autoFocus
              />

              <Text style={styles.dateSeparator}>.</Text>

              {/* Month Field */}
              <TextInput
                ref={monthRef}
                style={[
                  styles.monthInput,
                  month && styles.filledInput,
                  month && !isMonthValid() && styles.invalidInput,
                ]}
                placeholder="MM"
                placeholderTextColor="#A2A2A2"
                value={month}
                onChangeText={handleMonthChange}
                keyboardType="number-pad"
                maxLength={2}
                onFocus={() => setFocused('month')}
              />

              <Text style={styles.dateSeparator}>.</Text>

              {/* Day Field */}
              <TextInput
                ref={dayRef}
                style={[
                  styles.dayInput,
                  day && styles.filledInput,
                  day && !isDayValid() && styles.invalidInput,
                ]}
                placeholder="DD"
                placeholderTextColor="#A2A2A2"
                value={day}
                onChangeText={handleDayChange}
                keyboardType="number-pad"
                maxLength={2}
                onFocus={() => setFocused('day')}
              />
            </View>
          </View>

          {/* Status message */}
          <View style={styles.statusContainer}>
            {!isTouched && (
              <>
                <SvgXml xml={infoCircleIconSvg} width={14} height={14} />
                <Text style={styles.infoText}>We are not saving your date of birth</Text>
              </>
            )}

            {isTouched && isFormComplete && !isFormValid && (
              <>
                <SvgXml xml={errorCircleIconSvg} width={16} height={16} />
                <Text style={styles.errorText}>Enter a valid date of birth</Text>
              </>
            )}

            {isTouched && isFormValid && (
              <>
                <SvgXml xml={successCircleIconSvg} width={16} height={16} />
                <Text style={styles.successText}>{formatDateInWords()}</Text>
              </>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.continueButton, !isFormValid && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={!isFormValid}>
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
  dobContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 32,
  },
  dateFieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    padding: 16,
    paddingHorizontal: 0,
    borderRadius: 16,
  },
  dateInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  yearInput: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 18,
    lineHeight: 20,
    color: '#A2A2A2',
    width: Platform.select({ ios: 44, android: 55 }),
    textAlign: 'center',
  },
  monthInput: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 18,
    lineHeight: 20,
    color: '#A2A2A2',
    width: Platform.select({ ios: 29, android: 40 }),
    textAlign: 'center',
  },
  dayInput: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 18,
    lineHeight: 20,
    color: '#A2A2A2',
    width: Platform.select({ ios: 24, android: 35 }),
    textAlign: 'center',
  },
  dateSeparator: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 19,
    color: '#A2A2A2',
  },
  filledInput: {
    color: '#121212',
  },
  invalidInput: {
    color: '#ED0000',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 17,
    color: '#767676',
  },
  errorText: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 17,
    color: '#787878',
  },
  successText: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 17,
    color: '#787878',
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

export default DOBInput;
