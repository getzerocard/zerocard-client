import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
  Clipboard,
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { Ionicons } from '@expo/vector-icons';

interface CardData {
  cardHolder: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
}

interface CardDetailsProps {
  cardData: CardData;
}

export default function CardDetails({ cardData }: CardDetailsProps) {
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);
  const [isBiometricsAvailable, setIsBiometricsAvailable] = useState(false);
  const [copiedText, setCopiedText] = useState('');

  useEffect(() => {
    checkBiometrics();
  }, []);

  const checkBiometrics = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = compatible && await LocalAuthentication.isEnrolledAsync();
    setIsBiometricsAvailable(enrolled);
  };

  const authenticateWithBiometrics = async () => {
    try {
      if (isBiometricsAvailable) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Authenticate to reveal card details',
          cancelLabel: 'Cancel',
          disableDeviceFallback: false,
        });
        
        if (result.success) {
          setIsDetailsVisible(true);
        } else {
          Alert.alert('Authentication failed', 'Please try again');
        }
      } else {
        setIsDetailsVisible(true);
        Alert.alert('Biometrics not available', 'Your device does not support biometric authentication');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      Alert.alert('Error', 'Authentication failed. Please try again.');
    }
  };

  const handleRevealPress = () => {
    if (isDetailsVisible) {
      setIsDetailsVisible(false);
    } else {
      authenticateWithBiometrics();
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    Clipboard.setString(text);
    setCopiedText(label);
    Alert.alert('Copied', `${label} copied to clipboard`);
    
    setTimeout(() => {
      setCopiedText('');
    }, 3000);
  };

  const maskCardNumber = (number: string) => {
    if (!number) return '';
    return isDetailsVisible 
      ? number 
      : number.slice(0, 4) + ' XXXX XXXX XXXX';
  };
  
  const maskData = (data: string) => {
    return isDetailsVisible ? data : 'XXX';
  };

  return (
    <View style={styles.cardDetailsWrapper}>
      <View style={styles.cardDetailsHeader}>
        <Text style={styles.cardDetailsTitle}>Card details</Text>
        <TouchableOpacity 
          style={styles.revealButton}
          onPress={handleRevealPress}
        >
          <Ionicons 
            name={isDetailsVisible ? "eye-off-outline" : "eye-outline"} 
            size={16} 
            color="#7F7F7F" 
          />
          <Text style={styles.revealText}>
            {isDetailsVisible ? 'Hide' : 'Reveal'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.cardDetailsContainer}>
        {/* Holder Name */}
        <View style={styles.detailSection}>
          <Text style={styles.detailLabel}>Holder name</Text>
          <Text style={styles.detailValue}>{cardData.cardHolder}</Text>
        </View>
        <View style={styles.divider} />
        
        {/* Card Number */}
        <View style={styles.detailSection}>
          <Text style={styles.detailLabel}>Card number</Text>
          <View style={styles.detailRow}>
            <Text 
              style={[
                styles.detailValue, 
                !isDetailsVisible && styles.maskedText
              ]}
            >
              {maskCardNumber(cardData.cardNumber)}
            </Text>
            <TouchableOpacity 
              style={[
                styles.copyButton,
                copiedText === 'Card number' && styles.copyButtonActive
              ]}
              onPress={() => copyToClipboard(cardData.cardNumber, 'Card number')}
              disabled={!isDetailsVisible}
            >
              <Text style={styles.copyText}>Copy</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.divider} />
        
        {/* Valid Until */}
        <View style={styles.detailSection}>
          <Text style={styles.detailLabel}>Valid until</Text>
          <View style={styles.detailRow}>
            <Text 
              style={[
                styles.detailValue, 
                !isDetailsVisible && styles.maskedText
              ]}
            >
              {maskData(cardData.expiry)}
            </Text>
            <TouchableOpacity 
              style={[
                styles.copyButton,
                copiedText === 'Expiry date' && styles.copyButtonActive
              ]}
              onPress={() => copyToClipboard(cardData.expiry, 'Expiry date')}
              disabled={!isDetailsVisible}
            >
              <Text style={styles.copyText}>Copy</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.divider} />
        
        {/* CVV */}
        <View style={styles.detailSection}>
          <Text style={styles.detailLabel}>CVV</Text>
          <Text 
            style={[
              styles.detailValue, 
              !isDetailsVisible && styles.maskedText
            ]}
          >
            {maskData(cardData.cvv)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Card Details Styles
  cardDetailsWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 0, 
    marginBottom: 24,
    alignSelf: 'stretch',
  },
  cardDetailsHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    alignSelf: 'stretch',
  },
  cardDetailsTitle: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 19,
    color: '#121212',
  },
  revealButton: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    paddingHorizontal: 8,
    gap: 4,
    backgroundColor: '#FFFFFF',
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 1,
    elevation: 1,
    borderRadius: 100,
  },
  revealText: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 17,
    color: '#7F7F7F',
  },
  cardDetailsContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: 16,
    gap: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 1,
    elevation: 1,
    borderRadius: 20,
    alignSelf: 'stretch',
  },
  detailSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 12,
    alignSelf: 'stretch',
  },
  detailLabel: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 17,
    color: '#888888',
  },
  detailValue: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 19,
    color: '#121212',
  },
  divider: {
    height: 0.5,
    backgroundColor: '#E8E8E8',
    alignSelf: 'stretch',
  },
  detailRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'stretch',
  },
  copyButton: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    paddingHorizontal: 12,
    gap: 4,
    backgroundColor: '#ECECEC',
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 1,
    elevation: 1,
    borderRadius: 100,
  },
  copyButtonActive: {
    backgroundColor: '#E0F7E0',
  },
  copyText: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 17,
    color: '#121212',
  },
  maskedText: {
    color: '#888888',
  },
}); 