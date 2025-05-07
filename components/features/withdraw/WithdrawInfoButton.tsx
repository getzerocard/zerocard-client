import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { SvgXml } from 'react-native-svg';

// Import SVG icons as strings
const infoCircleSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12 2C6.49 2 2 6.49 2 12C2 17.51 6.49 22 12 22C17.51 22 22 17.51 22 12C22 6.49 17.51 2 12 2ZM11.25 8C11.25 7.59 11.59 7.25 12 7.25C12.41 7.25 12.75 7.59 12.75 8V13C12.75 13.41 12.41 13.75 12 13.75C11.59 13.75 11.25 13.41 11.25 13V8ZM12.92 16.38C12.87 16.51 12.8 16.61 12.71 16.71C12.61 16.8 12.5 16.87 12.38 16.92C12.26 16.97 12.13 17 12 17C11.87 17 11.74 16.97 11.62 16.92C11.5 16.87 11.39 16.8 11.29 16.71C11.2 16.61 11.13 16.51 11.08 16.38C11.03 16.26 11 16.13 11 16C11 15.87 11.03 15.74 11.08 15.62C11.13 15.5 11.2 15.39 11.29 15.29C11.39 15.2 11.5 15.13 11.62 15.08C11.86 14.98 12.14 14.98 12.38 15.08C12.5 15.13 12.61 15.2 12.71 15.29C12.8 15.39 12.87 15.5 12.92 15.62C12.97 15.74 13 15.87 13 16C13 16.13 12.97 16.26 12.92 16.38Z" fill="#989898"/>
</svg>
`;

// Placeholder for padlock icon SVG - replace with actual SVG string if available
const padlockIconSvg = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12.6667 6.66669H12V4.66669C12 2.45335 10.2133 0.666687 8 0.666687C5.78667 0.666687 4 2.45335 4 4.66669V6.66669H3.33333C2.59333 6.66669 2 7.26002 2 8.00002V12.6667C2 13.4067 2.59333 14 3.33333 14H12.6667C13.4067 14 14 13.4067 14 12.6667V8.00002C14 7.26002 13.4067 6.66669 12.6667 6.66669ZM8 11.3334C7.63333 11.3334 7.33333 11.0334 7.33333 10.6667C7.33333 10.3000 7.63333 10.0000 8 10.0000C8.36667 10.0000 8.66667 10.3000 8.66667 10.6667C8.66667 11.0334 8.36667 11.3334 8 11.3334ZM10 6.66669H6V4.66669C6 3.56002 6.89333 2.66669 8 2.66669C9.10667 2.66669 10 3.56002 10 4.66669V6.66669Z" fill="#000000"/>
</svg>
`;

interface WithdrawInfoButtonProps {
  onWithdrawPress: () => void;
}

const WithdrawInfoButton: React.FC<WithdrawInfoButtonProps> = ({ onWithdrawPress }) => {
  return (
    <View style={styles.container}>
      {/* Info Box */}
      <View style={styles.infoBox}>
        <SvgXml xml={infoCircleSvg} width={24} height={24} />
        <Text style={styles.infoText}>
          Only withdraw to an address on Base, this wallet currently only holds USDC asset on Base
        </Text>
      </View>

      {/* Withdraw Button */}
      <TouchableOpacity style={styles.withdrawButton} onPress={onWithdrawPress} activeOpacity={0.8}>
        <SvgXml xml={padlockIconSvg} width={16} height={16} />
        <Text style={styles.withdrawButtonText}>Withdraw</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 15,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Align icon to top of text
    padding: 16,
    gap: 8,
    backgroundColor: '#343434',
    borderRadius: 20,
    width: '100%',
  },
  infoText: {
    flex: 1, // Allow text to wrap
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 17, // 120%
    color: '#989898',
  },
  withdrawButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    gap: 8,
    backgroundColor: '#40FF00',
    borderRadius: 1000, // Large value for pill shape
    width: '100%',
    height: 49, // Fixed height from design
  },
  withdrawButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 17, // 120%
    textAlign: 'center',
    color: '#000000',
  },
});

export default WithdrawInfoButton;
