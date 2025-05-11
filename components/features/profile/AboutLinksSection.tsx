import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { SvgXml } from 'react-native-svg';
import Squircle from 'react-native-squircle';

// Placeholders for SVGs - these should be the actual SVG strings or imported components
const helpIconSvg = `<svg width="24" height="24" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_257_908)"><path d="M6.3834 6.25871C6.54014 5.81315 6.84951 5.43745 7.25671 5.19813C7.66391 4.95881 8.14267 4.87133 8.60819 4.95118C9.07371 5.03103 9.49595 5.27306 9.80012 5.63439C10.1043 5.99573 10.2708 6.45306 10.2701 6.92537C10.2701 8.25871 8.27007 8.92537 8.27007 8.92537M8.3234 11.592H8.33007M14.9901 8.25871C14.9901 11.9406 12.0053 14.9254 8.3234 14.9254C4.64151 14.9254 1.65674 11.9406 1.65674 8.25871C1.65674 4.57681 4.64151 1.59204 8.3234 1.59204C12.0053 1.59204 14.9901 4.57681 14.9901 8.25871Z" stroke="#A3A3A3" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/></g></svg>`;
const termIconSvg = `<svg width="24" height="24" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_257_918)"><path d="M1.65674 4.03984H4.32341M1.65674 6.7065H4.32341M1.65674 9.37317H4.32341M1.65674 12.0398H4.32341M6.65674 5.37317H9.99007M6.65674 8.03984H10.9901M6.65674 10.7065H9.65674M4.32341 1.37317H12.3234C13.0598 1.37317 13.6567 1.97012 13.6567 2.7065V13.3732C13.6567 14.1095 13.0598 14.7065 12.3234 14.7065H4.32341C3.58703 14.7065 2.99007 14.1095 2.99007 13.3732V2.7065C2.99007 1.97012 3.58703 1.37317 4.32341 1.37317Z" stroke="#A3A3A3" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/></g></svg>`;
const privacyIconSvg = `<svg width="24" height="24" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.98991 7.48757V5.48757C4.98991 4.60351 5.3411 3.75567 5.96622 3.13055C6.59134 2.50543 7.43919 2.15424 8.32324 2.15424C9.2073 2.15424 10.0551 2.50543 10.6803 3.13055C11.3054 3.75567 11.6566 4.60351 11.6566 5.48757V7.48757M8.98991 11.4876C8.98991 11.8558 8.69143 12.1542 8.32324 12.1542C7.95505 12.1542 7.65658 11.8558 7.65658 11.4876C7.65658 11.1194 7.95505 10.8209 8.32324 10.8209C8.69143 10.8209 8.98991 11.1194 8.98991 11.4876ZM3.65658 7.48757H12.9899C13.7263 7.48757 14.3232 8.08452 14.3232 8.8209V14.1542C14.3232 14.8906 13.7263 15.4876 12.9899 15.4876H3.65658C2.9202 15.4876 2.32324 14.8906 2.32324 14.1542V8.8209C2.32324 8.08452 2.9202 7.48757 3.65658 7.48757Z" stroke="#A3A3A3" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const arrowUpIconSvg = `<svg width="24" height="24" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.01953 4.92542H11.6862M11.6862 4.92542V11.5921M11.6862 4.92542L5.01953 11.5921" stroke="#BABABA" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const AboutLinksSection: React.FC = () => {
  const handleHelpPress = () => Linking.openURL('https://www.zerocard.com/help');
  const handleTermsPress = () => Linking.openURL('https://www.zerocard.com/terms');
  const handlePrivacyPress = () => Linking.openURL('https://www.zerocard.com/privacy');

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>ABOUT</Text>
      </View>
      <Squircle
        style={styles.squircleContainer}
        borderRadius={16}
        borderSmoothing={1}
        backgroundColor="#FFFFFF">
        <View style={styles.sectionContentInner}>
          {/* Help Center */}
          <TouchableOpacity style={[styles.row, styles.topRow]} onPress={handleHelpPress}>
            <View style={styles.rowLeft}>
              <SvgXml xml={helpIconSvg} width={24} height={24} />
              <Text style={styles.rowLabel}>Help Center</Text>
            </View>
            <SvgXml xml={arrowUpIconSvg} width={24} height={24} />
          </TouchableOpacity>

          {/* Terms of Use */}
          <TouchableOpacity style={styles.row} onPress={handleTermsPress}>
            <View style={styles.rowLeft}>
              <SvgXml xml={termIconSvg} width={24} height={24} />
              <Text style={styles.rowLabel}>Term of Use</Text>
            </View>
            <SvgXml xml={arrowUpIconSvg} width={24} height={24} />
          </TouchableOpacity>

          {/* Privacy Policy */}
          <TouchableOpacity style={[styles.row, styles.bottomRow]} onPress={handlePrivacyPress}>
            <View style={styles.rowLeft}>
              <SvgXml xml={privacyIconSvg} width={24} height={24} />
              <Text style={styles.rowLabel}>Privacy Policy</Text>
            </View>
            <SvgXml xml={arrowUpIconSvg} width={24} height={24} />
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
});

export default AboutLinksSection; 