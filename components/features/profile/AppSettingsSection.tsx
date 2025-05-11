import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { SvgXml } from 'react-native-svg';
import Squircle from 'react-native-squircle';
import { useSettingsStore } from '../../../store/settingsStore';
import { router, usePathname } from 'expo-router';

// Updated SVG strings with color #A3A3A3 and user-provided SVGs
const biometricsIconSvg = `<svg width="17" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M7.806 15.1622H5.31266C4.78141 15.1622 4.39183 15.1409 4.05891 15.0913C1.70016 14.8293 1.23975 13.4268 1.23975 11.0893V7.54759C1.23975 5.21009 1.70725 3.8005 4.08016 3.53842C4.39183 3.49592 4.78141 3.47467 5.31266 3.47467H7.7635C8.05391 3.47467 8.29475 3.7155 8.29475 4.00592C8.29475 4.29634 8.05391 4.53717 7.7635 4.53717H5.31266C4.831 4.53717 4.491 4.55842 4.21475 4.59384C2.77683 4.74967 2.30225 5.203 2.30225 7.54759V11.0893C2.30225 13.4338 2.77683 13.8801 4.1935 14.043C4.491 14.0855 4.831 14.0997 5.31266 14.0997H7.806C8.09641 14.0997 8.33725 14.3405 8.33725 14.6309C8.33725 14.9213 8.09641 15.1622 7.806 15.1622Z" fill="#A3A3A3"/>
<path d="M11.6875 15.1622H10.6392C10.3487 15.1622 10.1079 14.9213 10.1079 14.6309C10.1079 14.3405 10.3487 14.0997 10.6392 14.0997H11.6875C12.1692 14.0997 12.5092 14.0784 12.7854 14.043C14.2233 13.8872 14.6979 13.4338 14.6979 11.0893V7.54759C14.6979 5.203 14.2233 4.75675 12.8067 4.59384C12.5092 4.55134 12.1692 4.53717 11.6875 4.53717H10.6392C10.3487 4.53717 10.1079 4.29634 10.1079 4.00592C10.1079 3.7155 10.3487 3.47467 10.6392 3.47467H11.6875C12.2187 3.47467 12.6083 3.49592 12.9412 3.5455C15.3 3.80759 15.7604 5.21009 15.7604 7.54759V11.0893C15.7604 13.4268 15.2929 14.8363 12.92 15.0984C12.6083 15.1409 12.2187 15.1622 11.6875 15.1622Z" fill="#A3A3A3"/>
<path d="M10.625 16.933C10.3346 16.933 10.0938 16.6922 10.0938 16.4018V2.23511C10.0938 1.94469 10.3346 1.70386 10.625 1.70386C10.9154 1.70386 11.1562 1.94469 11.1562 2.23511V16.4018C11.1562 16.6922 10.9154 16.933 10.625 16.933Z" fill="#A3A3A3"/>
<path d="M5.6665 12.3288C5.37609 12.3288 5.13525 12.088 5.13525 11.7976V6.83923C5.13525 6.54882 5.37609 6.30798 5.6665 6.30798C5.95692 6.30798 6.19775 6.54882 6.19775 6.83923V11.7976C6.19775 12.088 5.95692 12.3288 5.6665 12.3288Z" fill="#A3A3A3"/>
</svg>
`;
const spendingLimitIconSvg = `<svg width="17" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8.5 11.6641C8.10886 11.6641 7.79167 11.981 7.79167 12.3725V13.0808C7.79167 13.4723 8.10886 13.7891 8.5 13.7891C8.89114 13.7891 9.20833 13.4723 9.20833 13.0808V12.3725C9.20833 11.981 8.89114 11.6641 8.5 11.6641ZM8.5 6.70581C7.3282 6.70581 6.375 7.65901 6.375 8.83081C6.375 10.0026 7.3282 10.9558 8.5 10.9558C9.6718 10.9558 10.625 10.0026 10.625 8.83081C10.625 7.65901 9.6718 6.70581 8.5 6.70581ZM8.5 9.53914C8.1095 9.53914 7.79167 9.22167 7.79167 8.83081C7.79167 8.43995 8.1095 8.12248 8.5 8.12248C8.8905 8.12248 9.20833 8.43995 9.20833 8.83081C9.20833 9.22167 8.8905 9.53914 8.5 9.53914Z" fill="#A3A3A3"/>
<path d="M13.0604 1.53931C10.0846 1.21419 6.91714 1.21419 3.93718 1.53931C2.50011 1.70046 1.4165 2.91306 1.4165 4.36153V4.80006C1.4165 5.49047 1.66931 6.1614 2.14354 6.70583C2.36907 6.94942 2.62952 7.14471 2.90832 7.29665C2.75702 9.18506 2.87057 11.0766 3.27418 12.9266C3.53187 14.1163 4.35049 15.0709 5.41299 15.4189C6.42775 15.7474 7.46638 15.9142 8.49984 15.9142C9.5333 15.9142 10.5719 15.7474 11.5887 15.4182C12.6492 15.071 13.4678 14.1163 13.7251 12.928C14.0181 11.5874 14.1665 10.2087 14.1665 8.83083C14.1665 8.31814 14.139 7.80389 14.0981 7.29247C15.0026 6.80195 15.5832 5.86369 15.5832 4.80013V4.36153C15.5832 3.67119 15.3304 3.00018 14.861 2.46135C14.3871 1.9391 13.747 1.61192 13.0604 1.53931ZM12.3407 12.6264C12.1892 13.3271 11.7323 13.8805 11.1502 14.0714C9.40289 14.6372 7.59402 14.6365 5.85152 14.0721C5.26736 13.8805 4.81048 13.327 4.65862 12.6257C4.24984 10.7525 4.14678 8.83359 4.35184 6.92371C4.41098 6.37376 4.49542 5.82799 4.60507 5.28916H7.7915C7.7915 5.68066 8.1087 5.99749 8.49984 5.99749C8.89098 5.99749 9.20817 5.68066 9.20817 5.28916H12.3946C12.5032 5.82246 12.5883 6.371 12.6478 6.92371C12.7156 7.5525 12.7498 8.19446 12.7498 8.83083C12.7498 10.1077 12.6122 11.384 12.3407 12.6264ZM14.1665 4.80013C14.1665 5.10931 14.0697 5.39846 13.8998 5.63504C13.849 5.33272 13.7916 5.036 13.7276 4.74686C13.6999 4.60647 13.6622 4.47429 13.6155 4.3429C13.5149 4.06063 13.2479 3.87249 12.9484 3.87249H4.05129C3.75181 3.87249 3.48477 4.06063 3.38411 4.3429C3.33743 4.47429 3.29975 4.6064 3.27482 4.73298C3.20944 5.02977 3.15135 5.33067 3.09986 5.63504C2.96251 5.44067 2.83317 5.16116 2.83317 4.80013V4.36153C2.83317 3.63591 3.37547 3.02788 4.0928 2.94762C5.53022 2.79066 7.01297 2.71111 8.49984 2.71111C9.9867 2.71111 11.4695 2.79066 12.9093 2.94769C13.252 2.98439 13.5726 3.14971 13.8023 3.40216C13.9683 3.59306 14.1665 3.91471 14.1665 4.36153V4.80013Z" fill="#A3A3A3"/>
</svg>
`;
const arrowIconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 18L15 12L9 6" stroke="#A3A3A3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

interface AppSettingsSectionProps {
  spendingLimitDisplay?: string;
  showSpendingLimit: boolean;
}

const AppSettingsSection: React.FC<AppSettingsSectionProps> = ({ spendingLimitDisplay, showSpendingLimit }) => {
  const { biometricsEnabled, toggleBiometrics } = useSettingsStore();
  const pathname = usePathname();
  
  const handleSpendingLimitPress = () => {
    router.push({ 
      pathname: "/(app)/spending-limit", 
      params: { backPath: pathname } 
    } as any);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>App Settings</Text>
      <Squircle
        style={styles.squircleHost}
        borderRadius={16}
        borderSmoothing={1}
        backgroundColor="#FFFFFF"
      >
        <View style={styles.innerContentContainer}>
          {/* Biometrics Item */}
          <View style={[styles.menuItem, styles.menuItemWithBorder]}> 
            <View style={styles.menuItemContent}>
              <SvgXml xml={biometricsIconSvg} width={17} height={18} />
              <Text style={styles.menuItemLabel}>Biometrics</Text>
            </View>
            <Switch
              value={biometricsEnabled}
              onValueChange={toggleBiometrics}
              trackColor={{ false: "#E8E8E8", true: "#00D743" }}
              thumbColor={"#FFFFFF"}
              ios_backgroundColor="#E8E8E8"
              style={styles.switchStyle}
            />
          </View>

          {/* Spending Limit Item - Conditionally render this entire block */}
          {showSpendingLimit && (
            <TouchableOpacity
              style={styles.menuItem} 
              onPress={handleSpendingLimitPress}
            >
              <View style={styles.menuItemContent}>
                <SvgXml xml={spendingLimitIconSvg} width={17} height={18} />
                <Text style={styles.menuItemLabel}>Spending limit</Text>
              </View>
              <View style={styles.menuItemRightContent}>
                <Text style={styles.spendingLimitValue}>{spendingLimitDisplay || "Not set"}</Text>
                <SvgXml xml={arrowIconSvg} width={20} height={20} />
              </View>
            </TouchableOpacity>
          )}
        </View>
      </Squircle>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
  },
  header: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    fontFamily: 'System',
    fontSize: 11,
    fontWeight: '500',
    color: '#A3A3A3',
    textTransform: 'uppercase',
  },
  squircleHost: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  innerContentContainer: {
    overflow: 'hidden',
    borderRadius: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF", 
  },
  menuItemWithBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E0E0E0", 
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemRightContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemLabel: {
    marginLeft: 12,
    fontSize: 16,
    fontFamily: "System", 
    color: "#333333",
  },
  spendingLimitValue: {
    fontSize: 16,
    fontFamily: "System",
    color: "#A3A3A3",
    marginRight: 8,
  },
  switchStyle: {
    // Specific styles for the switch if needed
  },
});

export default AppSettingsSection; 