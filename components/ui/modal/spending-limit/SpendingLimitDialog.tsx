import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SvgXml } from 'react-native-svg';

interface SpendingLimitDialogProps {
  onPress?: () => void;
}

// Icon SVG from the provided asset
const setLimitIconSvg = `<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_551_1736)">
<rect width="36" height="36" rx="18" fill="#40FF00"/>
<path d="M18 14.6667C17.3558 14.6667 16.8333 15.1885 16.8333 15.8333V17C16.8333 17.6448 17.3558 18.1667 18 18.1667C18.6442 18.1667 19.1667 17.6448 19.1667 17V15.8333C19.1667 15.1885 18.6442 14.6667 18 14.6667ZM18 6.5C16.07 6.5 14.5 8.06998 14.5 10C14.5 11.93 16.07 13.5 18 13.5C19.93 13.5 21.5 11.93 21.5 10C21.5 8.06998 19.93 6.5 18 6.5ZM18 11.1667C17.3568 11.1667 16.8333 10.6438 16.8333 10C16.8333 9.35623 17.3568 8.83333 18 8.83333C18.6432 8.83333 19.1667 9.35623 19.1667 10C19.1667 10.6438 18.6432 11.1667 18 11.1667Z" fill="black"/>
<path d="M25.5117 -2.00957C20.6103 -2.54507 15.3934 -2.54507 10.4852 -2.00957C8.11826 -1.74415 6.3335 0.253065 6.3335 2.63878V3.36106C6.3335 4.49821 6.74988 5.60328 7.53096 6.49998C7.90243 6.9012 8.33141 7.22285 8.79061 7.4731C8.54141 10.5834 8.72843 13.6989 9.3932 16.7459C9.81763 18.7055 11.1659 20.2777 12.9159 20.8509C14.5873 21.392 16.298 21.6666 18.0002 21.6666C19.7023 21.6666 21.413 21.392 23.0878 20.8497C24.8344 20.2778 26.1827 18.7055 26.6065 16.7482C27.0891 14.5402 27.3335 12.2695 27.3335 9.99998C27.3335 9.15555 27.2882 8.30855 27.2208 7.46621C28.7106 6.6583 29.6668 5.11293 29.6668 3.36118V2.63878C29.6668 1.50175 29.2504 0.396564 28.4774 -0.490919C27.6969 -1.3511 26.6425 -1.88999 25.5117 -2.00957ZM24.3263 16.2514C24.0767 17.4056 23.3242 18.317 22.3655 18.6314C19.4875 19.5634 16.5082 19.5623 13.6382 18.6326C12.6761 18.317 11.9236 17.4055 11.6734 16.2503C11.0002 13.165 10.8304 10.0045 11.1682 6.85885C11.2656 5.95305 11.4046 5.05413 11.5852 4.16665H16.8335C16.8335 4.81146 17.3559 5.33331 18.0002 5.33331C18.6444 5.33331 19.1668 4.81146 19.1668 4.16665H24.4151C24.5939 5.04503 24.734 5.9485 24.832 6.85885C24.9438 7.8945 25.0002 8.95185 25.0002 9.99998C25.0002 12.1031 24.7735 14.2052 24.3263 16.2514ZM27.3335 3.36118C27.3335 3.87043 27.174 4.34666 26.8942 4.73633C26.8105 4.2384 26.716 3.74968 26.6105 3.27345C26.5649 3.04221 26.5028 2.82451 26.4259 2.6081C26.2603 2.14318 25.8204 1.83331 25.3272 1.83331H10.6731C10.1799 1.83331 9.74005 2.14318 9.57426 2.6081C9.49738 2.82451 9.43531 3.0421 9.39425 3.25058C9.28656 3.73941 9.1909 4.23501 9.10608 4.73633C8.87986 4.4162 8.66683 3.95583 8.66683 3.36118V2.63878C8.66683 1.44365 9.56003 0.442181 10.7415 0.309998C13.109 0.0514643 15.5512 -0.0795523 18.0002 -0.0795523C20.4491 -0.0795523 22.8913 0.0514645 25.2628 0.310114C25.8273 0.370548 26.3554 0.642848 26.7336 1.05865C27.0071 1.37306 27.3335 1.90285 27.3335 2.63878V3.36118Z" fill="black"/>
</g>
<defs>
<clipPath id="clip0_551_1736">
<rect width="36" height="36" rx="18" fill="white"/>
</clipPath>
</defs>
</svg>`;

const SpendingLimitDialog: React.FC<SpendingLimitDialogProps> = ({ onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <SvgXml xml={setLimitIconSvg} width={36} height={36} />
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.title}>Your card, your rules</Text>
          <Text style={styles.description}>
            Secure your funds with customizable spending controls
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    gap: 8,
    backgroundColor: '#ECECEC',
    borderRadius: 20,
    alignSelf: 'stretch',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 1000,
  },
  contentContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 4,
    flex: 1,
  },
  title: {
    fontFamily: 'SF Pro Text',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 19,
    color: '#252525',
    alignSelf: 'stretch',
  },
  description: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 17,
    color: '#484848',
    alignSelf: 'stretch',
  },
});

export default SpendingLimitDialog;
