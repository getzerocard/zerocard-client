import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Linking, Platform } from 'react-native';
import { SvgXml } from 'react-native-svg';
import Squircle from 'react-native-squircle';
import mockData from '../../../assets/mockdata.json';
import { usePrivy } from '@privy-io/expo';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

// Import SVG icons
const profileIconSvg = `<svg width="24" height="24" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M9.07909 9.14676C11.0941 9.14676 12.7275 7.51331 12.7275 5.49834C12.7275 3.48337 11.0941 1.84991 9.07909 1.84991C7.06412 1.84991 5.43066 3.48337 5.43066 5.49834C5.43066 7.51331 7.06412 9.14676 9.07909 9.14676Z" stroke="#A3A3A3" stroke-width="1.64179" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M15.3475 16.4436C15.3475 13.6197 12.5382 11.3358 9.07951 11.3358C5.62081 11.3358 2.81152 13.6197 2.81152 16.4436" stroke="#A3A3A3" stroke-width="1.64179" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const emailIconSvg = `<svg width="24" height="24" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_257_870)">
<path d="M14.9901 5.32593L9.01007 9.12593C8.80425 9.25488 8.56628 9.32327 8.3234 9.32327C8.08053 9.32327 7.84256 9.25488 7.63674 9.12593L1.65674 5.32593M2.99007 3.32593H13.6567C14.3931 3.32593 14.9901 3.92288 14.9901 4.65926V12.6593C14.9901 13.3956 14.3931 13.9926 13.6567 13.9926H2.99007C2.25369 13.9926 1.65674 13.3956 1.65674 12.6593V4.65926C1.65674 3.92288 2.25369 3.32593 2.99007 3.32593Z" stroke="#A3A3A3" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
</g>
</svg>`;

const phoneIconSvg = `<svg width="24" height="24" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M14.9897 12.2078V14.2078C14.9905 14.3935 14.9524 14.5773 14.878 14.7474C14.8037 14.9175 14.6946 15.0702 14.5578 15.1958C14.4209 15.3213 14.2594 15.4168 14.0835 15.4763C13.9077 15.5358 13.7213 15.5579 13.5364 15.5412C11.4849 15.3183 9.51437 14.6173 7.78303 13.4945C6.17225 12.4709 4.80659 11.1053 3.78304 9.49451C2.65635 7.75531 1.9552 5.77517 1.73637 3.71451C1.71971 3.53015 1.74162 3.34435 1.8007 3.16892C1.85979 2.9935 1.95475 2.8323 2.07955 2.69559C2.20434 2.55888 2.35624 2.44965 2.52556 2.37485C2.69489 2.30006 2.87793 2.26135 3.06304 2.26117H5.06304C5.38657 2.25799 5.70023 2.37256 5.94554 2.58353C6.19086 2.7945 6.35109 3.08747 6.39637 3.40784C6.48078 4.04788 6.63733 4.67632 6.86304 5.28117C6.95273 5.51979 6.97214 5.77912 6.91897 6.02843C6.8658 6.27774 6.74228 6.50658 6.56303 6.68784L5.71637 7.53451C6.66541 9.20354 8.04734 10.5855 9.71637 11.5345L10.563 10.6878C10.7443 10.5086 10.9731 10.3851 11.2224 10.3319C11.4718 10.2787 11.7311 10.2981 11.9697 10.3878C12.5746 10.6135 13.203 10.7701 13.843 10.8545C14.1669 10.9002 14.4626 11.0633 14.6741 11.3128C14.8855 11.5624 14.9978 11.8809 14.9897 12.2078Z" stroke="#A3A3A3" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const biometricsIconSvg = `<svg width="24" height="24" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8.12924 14.5652H5.6359C5.10465 14.5652 4.71507 14.5439 4.38215 14.4944C2.02341 14.2323 1.56299 12.8298 1.56299 10.4923V6.9506C1.56299 4.6131 2.03049 3.20352 4.40341 2.94144C4.71507 2.89894 5.10465 2.87769 5.6359 2.87769H8.08674C8.37715 2.87769 8.61799 3.11852 8.61799 3.40894C8.61799 3.69935 8.37715 3.94019 8.08674 3.94019H5.6359C5.15424 3.94019 4.81424 3.96144 4.53799 3.99685C3.10007 4.15269 2.62549 4.60602 2.62549 6.9506V10.4923C2.62549 12.8369 3.10007 13.2831 4.51674 13.446C4.81424 13.4885 5.15424 13.5027 5.6359 13.5027H8.12924C8.41966 13.5027 8.66049 13.7435 8.66049 14.0339C8.66049 14.3244 8.41966 14.5652 8.12924 14.5652Z" fill="#A3A3A3"/>
<path d="M12.0107 14.5652H10.9624C10.672 14.5652 10.4312 14.3244 10.4312 14.0339C10.4312 13.7435 10.672 13.5027 10.9624 13.5027H12.0107C12.4924 13.5027 12.8324 13.4814 13.1087 13.446C14.5466 13.2902 15.0212 12.8369 15.0212 10.4923V6.9506C15.0212 4.60602 14.5466 4.15977 13.1299 3.99685C12.8324 3.95435 12.4924 3.94019 12.0107 3.94019H10.9624C10.672 3.94019 10.4312 3.69935 10.4312 3.40894C10.4312 3.11852 10.672 2.87769 10.9624 2.87769H12.0107C12.542 2.87769 12.9316 2.89894 13.2645 2.94852C15.6232 3.2106 16.0837 4.6131 16.0837 6.9506V10.4923C16.0837 12.8298 15.6162 14.2394 13.2432 14.5014C12.9316 14.5439 12.542 14.5652 12.0107 14.5652Z" fill="#A3A3A3"/>
<path d="M10.9482 16.336C10.6578 16.336 10.417 16.0952 10.417 15.8048V1.63812C10.417 1.34771 10.6578 1.10687 10.9482 1.10687C11.2387 1.10687 11.4795 1.34771 11.4795 1.63812V15.8048C11.4795 16.0952 11.2387 16.336 10.9482 16.336Z" fill="#A3A3A3"/>
<path d="M5.98975 11.7318C5.69933 11.7318 5.4585 11.491 5.4585 11.2006V6.24225C5.4585 5.95183 5.69933 5.711 5.98975 5.711C6.28016 5.711 6.521 5.95183 6.521 6.24225V11.2006C6.521 11.491 6.28016 11.7318 5.98975 11.7318Z" fill="#A3A3A3"/>
</svg>`;

const helpIconSvg = `<svg width="24" height="24" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_257_908)">
<path d="M6.3834 6.25871C6.54014 5.81315 6.84951 5.43745 7.25671 5.19813C7.66391 4.95881 8.14267 4.87133 8.60819 4.95118C9.07371 5.03103 9.49595 5.27306 9.80012 5.63439C10.1043 5.99573 10.2708 6.45306 10.2701 6.92537C10.2701 8.25871 8.27007 8.92537 8.27007 8.92537M8.3234 11.592H8.33007M14.9901 8.25871C14.9901 11.9406 12.0053 14.9254 8.3234 14.9254C4.64151 14.9254 1.65674 11.9406 1.65674 8.25871C1.65674 4.57681 4.64151 1.59204 8.3234 1.59204C12.0053 1.59204 14.9901 4.57681 14.9901 8.25871Z" stroke="#A3A3A3" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
</g>
</svg>`;

const termIconSvg = `<svg width="24" height="24" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_257_918)">
<path d="M1.65674 4.03984H4.32341M1.65674 6.7065H4.32341M1.65674 9.37317H4.32341M1.65674 12.0398H4.32341M6.65674 5.37317H9.99007M6.65674 8.03984H10.9901M6.65674 10.7065H9.65674M4.32341 1.37317H12.3234C13.0598 1.37317 13.6567 1.97012 13.6567 2.7065V13.3732C13.6567 14.1095 13.0598 14.7065 12.3234 14.7065H4.32341C3.58703 14.7065 2.99007 14.1095 2.99007 13.3732V2.7065C2.99007 1.97012 3.58703 1.37317 4.32341 1.37317Z" stroke="#A3A3A3" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
</g>
</svg>`;

const privacyIconSvg = `<svg width="24" height="24" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4.98991 7.48757V5.48757C4.98991 4.60351 5.3411 3.75567 5.96622 3.13055C6.59134 2.50543 7.43919 2.15424 8.32324 2.15424C9.2073 2.15424 10.0551 2.50543 10.6803 3.13055C11.3054 3.75567 11.6566 4.60351 11.6566 5.48757V7.48757M8.98991 11.4876C8.98991 11.8558 8.69143 12.1542 8.32324 12.1542C7.95505 12.1542 7.65658 11.8558 7.65658 11.4876C7.65658 11.1194 7.95505 10.8209 8.32324 10.8209C8.69143 10.8209 8.98991 11.1194 8.98991 11.4876ZM3.65658 7.48757H12.9899C13.7263 7.48757 14.3232 8.08452 14.3232 8.8209V14.1542C14.3232 14.8906 13.7263 15.4876 12.9899 15.4876H3.65658C2.9202 15.4876 2.32324 14.8906 2.32324 14.1542V8.8209C2.32324 8.08452 2.9202 7.48757 3.65658 7.48757Z" stroke="#A3A3A3" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const notificationIconSvg = `<svg width="24" height="24" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M7.32324 14.1542V14.8209C7.32324 15.1745 7.46372 15.5136 7.71377 15.7637C7.96381 16.0137 8.30295 16.1542 8.65658 16.1542C9.01021 16.1542 9.34934 16.0137 9.59939 15.7637C9.84944 15.5136 9.98991 15.1745 9.98991 14.8209V14.1542M14.3232 12.1542C14.3232 12.8906 13.7263 13.4876 12.9899 13.4876H4.32324C3.58686 13.4876 2.98991 12.8906 2.98991 12.1542V7.48757C2.98991 5.33757 5.47157 2.4876 8.65658 2.4876C11.8416 2.4876 14.3232 5.3339 14.3232 7.48757V12.1542Z" stroke="#A3A3A3" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const logoutIconSvg = `<svg width="24" height="24" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M6.32324 14.3458H3.65658C3.30295 14.3458 2.96381 14.2053 2.71377 13.9552C2.46372 13.7052 2.32324 13.3661 2.32324 13.0124V3.6791C2.32324 3.32548 2.46372 2.98634 2.71377 2.73629C2.96381 2.48624 3.30295 2.34576 3.65658 2.34576H6.32324M10.9899 11.6791L14.3232 8.34576M14.3232 8.34576L10.9899 5.01243M14.3232 8.34576H6.32324" stroke="#C9252D" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const arrowUpIconSvg = `<svg width="24" height="24" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M5.01953 4.92542H11.6862M11.6862 4.92542V11.5921M11.6862 4.92542L5.01953 11.5921" stroke="#BABABA" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

interface ProfileSettingsProps {
  /**
   * Callback when a setting is selected
   */
  onSettingPress?: (settingId: string) => void;
  
  /**
   * Callback when logout is pressed
   */
  onLogout?: () => void;
  
  /**
   * Current notification settings status
   * @default false
   */
  notificationsEnabled?: boolean;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  onSettingPress,
  onLogout,
  notificationsEnabled = false
}) => {
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  const userData = mockData.user || {};
  const privy = usePrivy();

  // Set default values or use values from mockData
  const username = userData.username || 'Temidayo Folajin';
  const email = userData.email || 'dayofolajin@gmail.com';
  const phone = '+44 7563 543 710'; // Default phone number since it's not in mockData

  const handleHelpPress = () => {
    Linking.openURL('https://www.zerocard.com/help');
  };

  const handleTermsPress = () => {
    Linking.openURL('https://www.zerocard.com/terms');
  };

  const handlePrivacyPress = () => {
    Linking.openURL('https://www.zerocard.com/privacy');
  };

  const handleLogout = async () => {
    try {
      // Clear any secure storage
      await SecureStore.deleteItemAsync('user_session');
      
      // Logout from Privy
      await privy.logout();
      
      console.log('Successfully logged out');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleCloseAccount = () => {
    // Handle close account logic
    console.log('Closing account...');
  };

  // Settings data
  const settings = [
    {
      id: 'profile',
      title: 'Profile',
      icon: profileIconSvg,
      path: '/(app)/profile/edit',
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: notificationIconSvg,
      path: '/(app)/settings/notifications',
      isToggle: true,
      isEnabled: notificationsEnabled,
    },
    {
      id: 'privacy',
      title: 'Privacy',
      icon: privacyIconSvg,
      path: '/(app)/settings/privacy',
    },
    {
      id: 'logout',
      title: 'Logout',
      icon: logoutIconSvg,
      isDestructive: true,
    },
  ];

  const handleSettingPress = (setting: typeof settings[0]) => {
    if (setting.id === 'logout') {
      if (onLogout) {
        onLogout();
      } else {
        console.log('Logout pressed');
        // Implement logout functionality
      }
      return;
    }
    
    if (onSettingPress) {
      onSettingPress(setting.id);
    } else if (setting.path) {
      router.push(setting.path as any);
    }
  };

  return (
    <View style={styles.container}>
      {/* ACCOUNT Section */}
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
              <Text style={styles.rowValue}>{username}</Text>
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

      {/* APP Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>APP</Text>
        </View>
        <Squircle
          style={styles.squircleContainer}
          borderRadius={16}
          borderSmoothing={1}
          backgroundColor="#FFFFFF">
          <View style={styles.sectionContentInner}>
            {/* Biometrics */}
            <View style={[styles.row, styles.singleRow]}>
              <View style={styles.rowLeft}>
                <SvgXml xml={biometricsIconSvg} width={24} height={24} />
                <Text style={styles.rowLabel}>Biometrics</Text>
              </View>
              <Switch
                value={biometricsEnabled}
                onValueChange={setBiometricsEnabled}
                trackColor={{ false: '#E8E8E8', true: '#00D743' }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#E8E8E8"
                style={styles.switch}
              />
            </View>
          </View>
        </Squircle>
      </View>

      {/* ABOUT Section */}
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

      {/* Logout Section */}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    width: '100%',
  },
  section: {
    marginBottom: 0,
  },
  logoutSection: {
    marginTop: 8,
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
  topRow: {
    // No need for border radius here as it's handled by Squircle
  },
  bottomRow: {
    borderBottomWidth: 0,
    // No need for border radius here as it's handled by Squircle
  },
  singleRow: {
    borderBottomWidth: 0,
    // No need for border radius here as it's handled by Squircle
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
  switch: {
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
  },
  logoutText: {
    color: '#C9252D',
  },
  closeAccountText: {
    color: '#818181',
  },
});

export default ProfileSettings;
