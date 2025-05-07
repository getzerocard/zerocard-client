import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { SquircleView } from 'react-native-figma-squircle';

// Import the SVG icons as strings
const basenameIconSvg = `<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="18" cy="18" r="18" fill="#002FFF"/>
<path d="M26.8502 4.64999C20.1302 10.05 12.4502 6.89999 9.45017 4.64999C8.85015 4.64999 8.55019 5.39999 10.9502 10.8C4.80015 8.24999 4.95017 8.99999 4.95017 9.29999C11.8502 19.5 5.10017 25.95 4.95017 26.85C4.80017 27.75 10.5002 25.35 10.9502 25.5C9.60017 28.35 9.30017 31.05 9.60017 31.5C20.2502 23.85 26.5502 32.4 27.1502 31.5C27.7502 30.6 25.8002 26.4 25.6502 25.95C25.5002 25.5 25.6502 24.9 26.2502 25.35C26.8502 25.8 31.0502 27.3 31.8002 26.85C24.7502 17.55 31.5002 10.5 31.8002 9.29999C32.1002 8.09999 26.1002 10.95 25.5002 10.8C24.9002 10.65 27.7502 5.69999 26.8502 4.64999Z" fill="#ECECEC"/>
<path d="M13.35 11.85C8.90996 12.81 8.84976 21 12.75 23.85C10.6499 19.35 12.75 18.75 13.35 18.6C16.3498 19.35 13.95 22.95 14.25 23.85C19.5 17.7 16.125 11.25 13.35 11.85Z" fill="#002FFF"/>
<path d="M22.3324 11.85C17.8924 12.81 17.8322 21 21.7324 23.85C19.6324 19.35 21.7324 18.75 22.3324 18.6C25.7999 19.65 22.9324 22.95 23.2324 23.85C28.4824 17.7 25.4999 11.4 22.3324 11.85Z" fill="#002FFF"/>
</svg>`;

const arrowUpIconSvg = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M5.01953 4.92542H11.6862M11.6862 4.92542V11.5921M11.6862 4.92542L5.01953 11.5921" stroke="#BABABA" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const BasenameDialog: React.FC = () => {
  const handlePress = () => {
    Linking.openURL('https://www.base.org/names');
  };

  return (
    <SquircleView
      style={styles.squircleContainer}
      squircleParams={{
        cornerRadius: 20,
        cornerSmoothing: 1,
        fillColor: '#ECECEC',
      }}>
      <TouchableOpacity style={styles.container} onPress={handlePress}>
        <View style={styles.iconContainer}>
          <SvgXml xml={basenameIconSvg} width={36} height={36} />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>Get a basename</Text>
          <Text style={styles.description}>
            Access and manage your personal decentralized identity directly
          </Text>
        </View>

        <View style={styles.arrowContainer}>
          <SvgXml xml={arrowUpIconSvg} width={18} height={18} />
        </View>
      </TouchableOpacity>
    </SquircleView>
  );
};

const styles = StyleSheet.create({
  squircleContainer: {
    marginTop: 24,
    width: '100%',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    width: '100%',
  },
  iconContainer: {
    marginRight: 8,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    marginRight: 8,
  },
  arrowContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'System',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 19,
    color: '#252525',
    marginBottom: 4,
  },
  description: {
    fontFamily: 'System',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 17,
    color: '#484848',
  },
});

export default BasenameDialog;
