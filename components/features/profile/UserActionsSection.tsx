import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SvgXml } from 'react-native-svg';
import Squircle from 'react-native-squircle';
import { usePrivy } from '@privy-io/expo';
import * as SecureStore from 'expo-secure-store';

// Placeholder for SVG - this should be the actual SVG string or imported component
const logoutIconSvg = `<svg width="24" height="24" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.32324 14.3458H3.65658C3.30295 14.3458 2.96381 14.2053 2.71377 13.9552C2.46372 13.7052 2.32324 13.3661 2.32324 13.0124V3.6791C2.32324 3.32548 2.46372 2.98634 2.71377 2.73629C2.96381 2.48624 3.30295 2.34576 3.65658 2.34576H6.32324M10.9899 11.6791L14.3232 8.34576M14.3232 8.34576L10.9899 5.01243M14.3232 8.34576H6.32324" stroke="#C9252D" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

interface UserActionsSectionProps {
  onLogoutProp?: () => void; // Renamed to avoid conflict if ProfileSettings also has onLogout
}

const UserActionsSection: React.FC<UserActionsSectionProps> = ({ onLogoutProp }) => {
  const privy = usePrivy();

  const handleLogout = async () => {
    if (onLogoutProp) {
        onLogoutProp(); // Call the passed-in onLogout if it exists
        return;
    }
    try {
      await SecureStore.deleteItemAsync('user_session');
      await privy.logout();
      console.log('Successfully logged out from UserActionsSection');
    } catch (error) {
      console.error('Error during logout from UserActionsSection:', error);
    }
  };

  const handleCloseAccount = () => {
    console.log('Closing account...');
    // Implement close account logic here
  };

  return (
    <View style={[styles.section, styles.logoutSection]}>
      <Squircle
        style={styles.squircleContainer}
        borderRadius={16}
        borderSmoothing={1}
        backgroundColor="#FFFFFF">
        <View style={styles.sectionContentInner}>
          {/* Logout */}
          <TouchableOpacity style={[styles.row, styles.topRow]} onPress={handleLogout}>
            <View style={styles.rowLeft}>
              <SvgXml xml={logoutIconSvg} width={24} height={24} />
              <Text style={[styles.rowLabel, styles.logoutText]}>Log out</Text>
            </View>
          </TouchableOpacity>

          {/* Close Account */}
          <TouchableOpacity style={[styles.row, styles.bottomRow]} onPress={handleCloseAccount}>
            <Text style={[styles.rowLabel, styles.closeAccountText]}>Close account</Text>
          </TouchableOpacity>
        </View>
      </Squircle>
    </View>
  );
};

// Copied styles from ProfileSettings.tsx - adjust as needed
const styles = StyleSheet.create({
  section: {
    marginBottom: 0,
  },
  logoutSection: {
    marginTop: 8,
  },
  squircleContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  sectionContentInner: {
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E8E8E8',
  },
  topRow: {},
  bottomRow: {
    borderBottomWidth: 0,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  rowLabel: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  logoutText: {
    color: '#C9252D',
  },
  closeAccountText: {
    color: '#818181',
  },
});

export default UserActionsSection; 