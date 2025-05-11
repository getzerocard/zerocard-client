import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SvgXml } from 'react-native-svg';
import Squircle from 'react-native-squircle';

// Import SVG icons (ensure these paths are correct relative to this new file or pass them as props)
// For simplicity, I'm assuming these will be copied or imported directly here or passed in.
// Placeholder for SVGs - these should be the actual SVG strings or imported components
const profileIconSvg = `<svg width="24" height="24" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.07909 9.14676C11.0941 9.14676 12.7275 7.51331 12.7275 5.49834C12.7275 3.48337 11.0941 1.84991 9.07909 1.84991C7.06412 1.84991 5.43066 3.48337 5.43066 5.49834C5.43066 7.51331 7.06412 9.14676 9.07909 9.14676Z" stroke="#A3A3A3" stroke-width="1.64179" stroke-linecap="round" stroke-linejoin="round"/><path d="M15.3475 16.4436C15.3475 13.6197 12.5382 11.3358 9.07951 11.3358C5.62081 11.3358 2.81152 13.6197 2.81152 16.4436" stroke="#A3A3A3" stroke-width="1.64179" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const emailIconSvg = `<svg width="24" height="24" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_257_870)"><path d="M14.9901 5.32593L9.01007 9.12593C8.80425 9.25488 8.56628 9.32327 8.3234 9.32327C8.08053 9.32327 7.84256 9.25488 7.63674 9.12593L1.65674 5.32593M2.99007 3.32593H13.6567C14.3931 3.32593 14.9901 3.92288 14.9901 4.65926V12.6593C14.9901 13.3956 14.3931 13.9926 13.6567 13.9926H2.99007C2.25369 13.9926 1.65674 13.3956 1.65674 12.6593V4.65926C1.65674 3.92288 2.25369 3.32593 2.99007 3.32593Z" stroke="#A3A3A3" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/></g></svg>`;
const phoneIconSvg = `<svg width="24" height="24" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.9897 12.2078V14.2078C14.9905 14.3935 14.9524 14.5773 14.878 14.7474C14.8037 14.9175 14.6946 15.0702 14.5578 15.1958C14.4209 15.3213 14.2594 15.4168 14.0835 15.4763C13.9077 15.5358 13.7213 15.5579 13.5364 15.5412C11.4849 15.3183 9.51437 14.6173 7.78303 13.4945C6.17225 12.4709 4.80659 11.1053 3.78304 9.49451C2.65635 7.75531 1.9552 5.77517 1.73637 3.71451C1.71971 3.53015 1.74162 3.34435 1.8007 3.16892C1.85979 2.9935 1.95475 2.8323 2.07955 2.69559C2.20434 2.55888 2.35624 2.44965 2.52556 2.37485C2.69489 2.30006 2.87793 2.26135 3.06304 2.26117H5.06304C5.38657 2.25799 5.70023 2.37256 5.94554 2.58353C6.19086 2.7945 6.35109 3.08747 6.39637 3.40784C6.48078 4.04788 6.63733 4.67632 6.86304 5.28117C6.95273 5.51979 6.97214 5.77912 6.91897 6.02843C6.8658 6.27774 6.74228 6.50658 6.56303 6.68784L5.71637 7.53451C6.66541 9.20354 8.04734 10.5855 9.71637 11.5345L10.563 10.6878C10.7443 10.5086 10.9731 10.3851 11.2224 10.3319C11.4718 10.2787 11.7311 10.2981 11.9697 10.3878C12.5746 10.6135 13.203 10.7701 13.843 10.8545C14.1669 10.9002 14.4626 11.0633 14.6741 11.3128C14.8855 11.5624 14.9978 11.8809 14.9897 12.2078Z" stroke="#A3A3A3" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

interface AccountInfoSectionProps {
  fullName: string;
  email: string;
  phone: string;
}

const AccountInfoSection: React.FC<AccountInfoSectionProps> = ({ fullName, email, phone }) => {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>ACCOUNT</Text>
      </View>
      <Squircle
        style={styles.squircleContainer}
        borderRadius={16}
        borderSmoothing={1}
        backgroundColor="#FFFFFF">
        <View style={styles.sectionContentInner}>
          {/* Name */}
          <View style={[styles.row, styles.topRow]}>
            <View style={styles.rowLeft}>
              <SvgXml xml={profileIconSvg} width={24} height={24} />
              <Text style={styles.rowLabel}>Name</Text>
            </View>
            <Text style={styles.rowValue}>{fullName}</Text>
          </View>

          {/* Email */}
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <SvgXml xml={emailIconSvg} width={24} height={24} />
              <Text style={styles.rowLabel}>Email</Text>
            </View>
            <Text style={styles.rowValue}>{email}</Text>
          </View>

          {/* Phone */}
          <View style={[styles.row, styles.bottomRow]}>
            <View style={styles.rowLeft}>
              <SvgXml xml={phoneIconSvg} width={24} height={24} />
              <Text style={styles.rowLabel}>Phone number</Text>
            </View>
            <Text style={styles.rowValue}>{phone}</Text>
          </View>
        </View>
      </Squircle>
    </View>
  );
};

// Copied styles from ProfileSettings.tsx - adjust as needed
const styles = StyleSheet.create({
  section: {
    marginBottom: 0, // In original, some sections had different marginBottom
  },
  sectionHeader: {
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  sectionHeaderText: {
    fontFamily: 'System',
    fontSize: 11,
    fontWeight: '500',
    color: '#A3A3A3',
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
  rowValue: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '500',
    color: '#A3A3A3',
  },
});

export default AccountInfoSection; 