import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SvgXml } from 'react-native-svg';

// SVG content for the info-circle icon
const infoCircleSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12 2C6.49 2 2 6.49 2 12C2 17.51 6.49 22 12 22C17.51 22 22 17.51 22 12C22 6.49 17.51 2 12 2ZM11.25 8C11.25 7.59 11.59 7.25 12 7.25C12.41 7.25 12.75 7.59 12.75 8V13C12.75 13.41 12.41 13.75 12 13.75C11.59 13.75 11.25 13.41 11.25 13V8ZM12.92 16.38C12.87 16.51 12.8 16.61 12.71 16.71C12.61 16.8 12.5 16.87 12.38 16.92C12.26 16.97 12.13 17 12 17C11.87 17 11.74 16.97 11.62 16.92C11.5 16.87 11.39 16.8 11.29 16.71C11.2 16.61 11.13 16.51 11.08 16.38C11.03 16.26 11 16.13 11 16C11 15.87 11.03 15.74 11.08 15.62C11.13 15.5 11.2 15.39 11.29 15.29C11.39 15.2 11.5 15.13 11.62 15.08C11.86 14.98 12.14 14.98 12.38 15.08C12.5 15.13 12.61 15.2 12.71 15.29C12.8 15.39 12.87 15.5 12.92 15.62C12.97 15.74 13 15.87 13 16C13 16.13 12.97 16.26 12.92 16.38Z" fill="#989898"/>
</svg>`;

export function OtpInfoDialog() {
  return (
    <View style={styles.dialogContainer}>
      <SvgXml xml={infoCircleSvg} width={24} height={24} />
      <Text style={styles.dialogText}>
        If you haven't received the OTP on your phone, simply dial{' '}
        <Text style={styles.highlightedText}>*347*238#</Text>
        {' '}on your device to retrieve your OTP instantly
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  dialogContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    gap: 12,
    backgroundColor: '#343434',
    borderRadius: 16,
    width: '100%',
  },
  dialogText: {
    flex: 1, 
    fontFamily: 'SF Pro Text',
    fontSize: 14,
    lineHeight: 20, // Increased line height for better readability
    color: '#B3B3B3', // Slightly lighter for better contrast
    letterSpacing: 0.1,
  },
  highlightedText: {
    color: '#FFFFFF',
    fontWeight: '600', // Made slightly bolder
  },
}); 