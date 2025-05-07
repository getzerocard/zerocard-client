import React, { useState } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, Platform } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { Button } from '../../ui/Button';
import { SquircleView } from 'react-native-figma-squircle';
import AndroidCardTypeModal from '../../modals/card-type/AndroidCardTypeModal';

// Import SVG icons
const cardNotFoundSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M18.8999 15.03C16.6899 15.03 14.8999 16.82 14.8999 19.03C14.8999 21.24 16.6899 23.03 18.8999 23.03C21.1099 23.03 22.8999 21.24 22.8999 19.03C22.8999 16.82 21.1099 15.03 18.8999 15.03ZM20.4999 20.68C20.3499 20.83 20.1599 20.9 19.9699 20.9C19.7799 20.9 19.5899 20.83 19.4399 20.68L18.9099 20.15L18.3599 20.7C18.2099 20.85 18.0199 20.92 17.8299 20.92C17.6399 20.92 17.4499 20.85 17.2999 20.7C17.0099 20.41 17.0099 19.93 17.2999 19.64L17.8499 19.09L17.3199 18.56C17.0299 18.27 17.0299 17.79 17.3199 17.5C17.6099 17.21 18.0899 17.21 18.3799 17.5L18.9099 18.03L19.4099 17.53C19.6999 17.24 20.1799 17.24 20.4699 17.53C20.7599 17.82 20.7599 18.3 20.4699 18.59L19.9699 19.09L20.4999 19.62C20.7899 19.91 20.7899 20.39 20.4999 20.68Z" fill="#C9252D"/>
<path d="M22 7.55002V8.00002C22 8.55002 21.55 9.00002 21 9.00002H3C2.45 9.00002 2 8.55002 2 8.00002V7.54002C2 5.25002 3.85 3.40002 6.14 3.40002H17.85C20.14 3.40002 22 5.26002 22 7.55002Z" fill="#919191"/>
<path d="M2 11.5V16.46C2 18.75 3.85 20.6 6.14 20.6H12.4C12.98 20.6 13.48 20.11 13.43 19.53C13.29 18 13.78 16.34 15.14 15.02C15.7 14.47 16.39 14.05 17.14 13.81C18.39 13.41 19.6 13.46 20.67 13.82C21.32 14.04 22 13.57 22 12.88V11.49C22 10.94 21.55 10.49 21 10.49H3C2.45 10.5 2 10.95 2 11.5ZM8 17.25H6C5.59 17.25 5.25 16.91 5.25 16.5C5.25 16.09 5.59 15.75 6 15.75H8C8.41 15.75 8.75 16.09 8.75 16.5C8.75 16.91 8.41 17.25 8 17.25Z" fill="#919191"/>
</svg>`;

const cardSendSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M19.97 1.75H17.03C15.76 1.75 15 2.51 15 3.78V6.72C15 7.99 15.76 8.75 17.03 8.75H19.97C21.24 8.75 22 7.99 22 6.72V3.78C22 2.51 21.24 1.75 19.97 1.75ZM20.19 5.06C20.07 5.18 19.91 5.24 19.75 5.24C19.59 5.24 19.43 5.18 19.31 5.06L19.13 4.88V7.12C19.13 7.47 18.85 7.75 18.5 7.75C18.15 7.75 17.87 7.47 17.87 7.12V4.88L17.69 5.06C17.45 5.3 17.05 5.3 16.81 5.06C16.57 4.82 16.57 4.42 16.81 4.18L18.06 2.93C18.11 2.88 18.18 2.84 18.25 2.81C18.27 2.8 18.29 2.8 18.31 2.79C18.36 2.77 18.41 2.76 18.47 2.76C18.49 2.76 18.51 2.76 18.53 2.76C18.6 2.76 18.66 2.77 18.73 2.8C18.74 2.8 18.74 2.8 18.75 2.8C18.82 2.83 18.88 2.87 18.93 2.92C18.94 2.93 18.94 2.93 18.95 2.93L20.2 4.18C20.44 4.42 20.44 4.82 20.19 5.06Z" fill="#007AFF"/>
<path d="M2 11.46V16.46C2 18.75 3.85 20.6 6.14 20.6H17.85C20.14 20.6 22 18.74 22 16.45V11.46C22 10.79 21.46 10.25 20.79 10.25H3.21C2.54 10.25 2 10.79 2 11.46ZM8 17.25H6C5.59 17.25 5.25 16.91 5.25 16.5C5.25 16.09 5.59 15.75 6 15.75H8C8.41 15.75 8.75 16.09 8.75 16.5C8.75 16.91 8.41 17.25 8 17.25ZM14.5 17.25H10.5C10.09 17.25 9.75 16.91 9.75 16.5C9.75 16.09 10.09 15.75 10.5 15.75H14.5C14.91 15.75 15.25 16.09 15.25 16.5C15.25 16.91 14.91 17.25 14.5 17.25Z" fill="#919191"/>
<path d="M13.5 4.61002V7.54002C13.5 8.21002 12.96 8.75002 12.29 8.75002H3.21C2.53 8.75002 2 8.19002 2 7.52002C2.01 6.39002 2.46 5.36002 3.21 4.61002C3.96 3.86002 5 3.40002 6.14 3.40002H12.29C12.96 3.40002 13.5 3.94002 13.5 4.61002Z" fill="#919191"/>
</svg>`;

type CardStatus = 'not_found' | 'ordered';

interface CardStatusProps {
  status: CardStatus;
  onPrimaryButtonPress?: () => void;
  onSecondaryButtonPress?: () => void;
}

const CardStatusComponent: React.FC<CardStatusProps> = ({
  status = 'not_found',
  onPrimaryButtonPress,
  onSecondaryButtonPress,
}) => {
  const [isModalVisible, setModalVisible] = useState(false);

  // Content based on status
  const iconSvg = status === 'not_found' ? cardNotFoundSvg : cardSendSvg;

  const title = status === 'not_found' ? 'No card found 😕' : 'Card arrived?';

  const description =
    status === 'not_found'
      ? "Looks like you don't have a ZeroCard yet. Order one now to start spending crypto like cash"
      : 'Your card should arrive shortly. Once you have it, you can activate your new card below';

  const primaryButtonTitle = status === 'not_found' ? 'Order card' : 'Activate card';

  const secondaryButtonTitle = status === 'not_found' ? 'Load wallet' : 'Check status';

  const handlePrimaryButtonPress = () => {
    if (status === 'not_found' && Platform.OS === 'android') {
      setModalVisible(true);
    } else if (onPrimaryButtonPress) {
      onPrimaryButtonPress();
    }
  };

  const handleCardTypeSelection = (cardType: 'physical' | 'contactless') => {
    setModalVisible(false);
    // Only physical card is selectable for now
    if (cardType === 'physical' && onPrimaryButtonPress) {
      onPrimaryButtonPress();
    }
  };

  return (
    <>
      <SquircleView
        style={styles.container as ViewStyle}
        squircleParams={{
          cornerSmoothing: 1,
          cornerRadius: 20,
          fillColor: '#ECECEC',
        }}>
        <View style={styles.contentContainer as ViewStyle}>
          <View style={styles.headerContainer as ViewStyle}>
            <View style={styles.titleContainer as ViewStyle}>
              <SvgXml xml={iconSvg} width={24} height={24} />
              <Text style={styles.title as TextStyle}>{title}</Text>
            </View>

            <Text style={styles.description as TextStyle}>{description}</Text>
          </View>

          <View style={styles.buttonContainer as ViewStyle}>
            <Button
              title={secondaryButtonTitle}
              variant="secondary"
              style={styles.button as ViewStyle}
              onPress={onSecondaryButtonPress}
            />
            <Button
              title={primaryButtonTitle}
              variant="primary"
              style={styles.button as ViewStyle}
              onPress={handlePrimaryButtonPress}
            />
          </View>
        </View>
      </SquircleView>

      {Platform.OS === 'android' && (
        <AndroidCardTypeModal
          visible={isModalVisible}
          onClose={() => setModalVisible(false)}
          onSelectCardType={handleCardTypeSelection}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  headerContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontFamily: 'SF Pro Text',
    fontWeight: '600',
    fontSize: 18,
    lineHeight: 19,
    color: '#121212',
  },
  description: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 17,
    color: '#484848',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    width: '100%',
  },
  button: {
    flex: 1,
    height: 41,
    padding: 12,
    minWidth: 120,
  },
});

export default CardStatusComponent;
