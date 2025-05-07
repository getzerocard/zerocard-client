import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SvgXml } from 'react-native-svg';

import IdentityVerification from './IdentityVerification';
import { Button } from '../../../components/ui/Button';

// Import close icon SVG
const closeIconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12.0002 22.75C6.07024 22.75 1.25024 17.93 1.25024 12C1.25024 6.07 6.07024 1.25 12.0002 1.25C17.9302 1.25 22.7502 6.07 22.7502 12C22.7502 17.93 17.9302 22.75 12.0002 22.75ZM12.0002 2.75C6.90024 2.75 2.75024 6.9 2.75024 12C2.75024 17.1 6.90024 21.25 12.0002 21.25C17.1002 21.25 21.2502 17.1 21.2502 12C21.2502 6.9 17.1002 2.75 12.0002 2.75Z" fill="#6A6A6A"/>
<path d="M9.16962 15.58C8.97962 15.58 8.78962 15.51 8.63962 15.36C8.34962 15.07 8.34962 14.59 8.63962 14.3L14.2996 8.63999C14.5896 8.34999 15.0696 8.34999 15.3596 8.63999C15.6496 8.92999 15.6496 9.40998 15.3596 9.69998L9.69962 15.36C9.55962 15.51 9.35962 15.58 9.16962 15.58Z" fill="#6A6A6A"/>
<path d="M14.8296 15.58C14.6396 15.58 14.4496 15.51 14.2996 15.36L8.63962 9.69998C8.34962 9.40998 8.34962 8.92999 8.63962 8.63999C8.92962 8.34999 9.40962 8.34999 9.69962 8.63999L15.3596 14.3C15.6496 14.59 15.6496 15.07 15.3596 15.36C15.2096 15.51 15.0196 15.58 14.8296 15.58Z" fill="#6A6A6A"/>
</svg>`;

// Import edit icon SVG
const editIconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M21 22H3C2.59 22 2.25 21.66 2.25 21.25C2.25 20.84 2.59 20.5 3 20.5H21C21.41 20.5 21.75 20.84 21.75 21.25C21.75 21.66 21.41 22 21 22Z" fill="#767676"/>
<path d="M19.0201 3.48004C17.0801 1.54004 15.1801 1.49004 13.1901 3.48004L11.9801 4.69004C11.8801 4.79004 11.8401 4.95004 11.8801 5.09004C12.6401 7.74004 14.7601 9.86003 17.4101 10.62C17.4501 10.63 17.4901 10.64 17.5301 10.64C17.6401 10.64 17.7401 10.6 17.8201 10.52L19.0201 9.31004C20.0101 8.33004 20.4901 7.38004 20.4901 6.42004C20.5001 5.43004 20.0201 4.47004 19.0201 3.48004Z" fill="#767676"/>
<path d="M15.6098 11.53C15.3198 11.39 15.0398 11.25 14.7698 11.09C14.5498 10.96 14.3398 10.82 14.1298 10.67C13.9598 10.56 13.7598 10.4 13.5698 10.24C13.5498 10.23 13.4798 10.17 13.3998 10.09C13.0698 9.81005 12.6998 9.45005 12.3698 9.05005C12.3398 9.03005 12.2898 8.96005 12.2198 8.87005C12.1198 8.75005 11.9498 8.55005 11.7998 8.32005C11.6798 8.17005 11.5398 7.95005 11.4098 7.73005C11.2498 7.46005 11.1098 7.19005 10.9698 6.91005C10.9486 6.86465 10.9281 6.81949 10.9083 6.77458C10.7607 6.44127 10.3261 6.34382 10.0683 6.60158L4.33983 12.33C4.20983 12.46 4.08983 12.71 4.05983 12.88L3.51983 16.71C3.41983 17.39 3.60983 18.03 4.02983 18.46C4.38983 18.81 4.88983 19 5.42983 19C5.54983 19 5.66983 18.99 5.78983 18.97L9.62983 18.43C9.80983 18.4 10.0598 18.28 10.1798 18.15L15.9011 12.4287C16.1607 12.1692 16.0628 11.7237 15.7252 11.5797C15.6872 11.5634 15.6488 11.5469 15.6098 11.53Z" fill="#767676"/>
</svg>`;

// Import padlock icon SVG
const padlockIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" viewBox="0 0 24 24" id="padlock">
  <path d="M17,9V7c0-2.8-2.2-5-5-5S7,4.2,7,7v2c-1.7,0-3,1.3-3,3v7c0,1.7,1.3,3,3,3h10c1.7,0,3-1.3,3-3v-7C20,10.3,18.7,9,17,9z M9,7
	c0-1.7,1.3-3,3-3s3,1.3,3,3v2H9V7z"></path>
</svg>`;

interface SubmissionSummaryProps {
  onClose: () => void;
  onContinue: () => void;
  onEdit: () => void;
  userData: {
    firstName: string;
    lastName: string;
    dob: string;
    phoneNumber: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
  };
}

const SubmissionSummary: React.FC<SubmissionSummaryProps> = ({
  onClose,
  onContinue,
  onEdit,
  userData,
}) => {
  const [showIdentityVerification, setShowIdentityVerification] = useState(false);

  const formatDOB = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.toLocaleString('en-US', { month: 'short' });
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  };

  const formatPhoneNumber = (phone: string) => {
    if (phone.length === 11) {
      return `${phone.slice(0, 4)} ${phone.slice(4, 7)} ${phone.slice(7)}`;
    }
    return `${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6)}`;
  };

  const fullName = `${userData.firstName} ${userData.lastName}`;
  const address = `${userData.street}, ${userData.city}, ${userData.state}`;
  const phoneNumber = formatPhoneNumber(userData.phoneNumber);
  const dob = formatDOB(userData.dob);

  const handleContinue = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowIdentityVerification(true);
  };

  const handleVerifyIdentity = (idType: string, idNumber: string) => {
    // Process the identity verification
    // For now, just pass through to onContinue
    setShowIdentityVerification(false);
    onContinue();
  };

  if (showIdentityVerification) {
    return (
      <IdentityVerification
        onClose={() => setShowIdentityVerification(false)}
        onVerify={handleVerifyIdentity}
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
        <View style={styles.header}>
          <View style={styles.spacer} />
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <SvgXml xml={closeIconSvg} width={24} height={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.subheaderText}>Just for confirmation</Text>

          <Text style={styles.infoText}>
            <Text style={styles.infoTextLabel}>Your name is </Text>
            <Text style={styles.infoTextValue}>{fullName}</Text>
            <Text style={styles.infoTextLabel}>, who lives in </Text>
            <Text style={styles.infoTextValue}>{address}</Text>
            <Text style={styles.infoTextLabel}>. Your phone number is </Text>
            <Text style={styles.infoTextValue}>{phoneNumber}</Text>
            <Text style={styles.infoTextLabel}> and you were born on </Text>
            <Text style={styles.infoTextValue}>{dob}</Text>
          </Text>

          <Text style={styles.correctText}>Correct?</Text>
        </View>

        <TouchableOpacity style={styles.editContainer} onPress={onEdit} activeOpacity={0.7}>
          <SvgXml xml={editIconSvg} width={24} height={24} />
          <Text style={styles.editText}>Click the submission you want to edit</Text>
        </TouchableOpacity>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.verifyButton} onPress={handleContinue}>
            <SvgXml
              xml={padlockIconSvg}
              width={16}
              height={16}
              color="#000000"
              style={styles.buttonIcon}
            />
            <Text style={styles.buttonText}>Verify identity</Text>
          </TouchableOpacity>

          <Text style={styles.secureText}>Secure Submission</Text>
        </View>
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
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 24,
  },
  spacer: {
    flex: 1,
  },
  closeButton: {
    width: 24,
    height: 24,
  },
  contentContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 16,
    marginTop: 36,
    alignSelf: 'stretch',
  },
  subheaderText: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 19,
    color: '#767676',
    alignSelf: 'stretch',
  },
  infoText: {
    fontFamily: 'SF Pro Text',
    fontWeight: '600',
    fontSize: 24,
    lineHeight: 29,
    alignSelf: 'stretch',
  },
  infoTextLabel: {
    color: '#767676',
    fontWeight: '500',
  },
  infoTextValue: {
    color: '#000000',
    fontWeight: '600',
  },
  correctText: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 19,
    color: '#000000',
    alignSelf: 'stretch',
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 8,
    backgroundColor: '#ECECEC',
    borderRadius: 12,
    marginTop: 36,
    alignSelf: 'stretch',
  },
  editText: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 19,
    color: '#767676',
    flex: 1,
  },
  buttonContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  verifyButton: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    width: '100%',
    height: 49,
    backgroundColor: '#40FF00',
    borderRadius: 100000,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontFamily: 'SF Pro Text',
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 17,
    textAlign: 'center',
    color: '#000000',
  },
  secureText: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 14,
    color: '#767676',
    marginTop: 8,
  },
});

export default SubmissionSummary;
