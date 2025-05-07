import { Feather } from '@expo/vector-icons';
import { forwardRef } from 'react';
import { Text, TouchableOpacity, TouchableOpacityProps, View, StyleSheet } from 'react-native';

type ButtonVariant = 'primary' | 'secondary';

interface ButtonProps extends TouchableOpacityProps {
  /**
   * The text to display in the button
   */
  title: string;
  
  /**
   * Button style variant
   * @default 'primary'
   */
  variant?: ButtonVariant;
  
  /**
   * Whether to show a right arrow icon
   * @default false
   */
  showRightArrow?: boolean;
  
  /**
   * Whether the button is disabled
   * @default false
   */
  disabled?: boolean;
}

export const Button = forwardRef<View, ButtonProps>(
  ({ title, variant = 'primary', showRightArrow = false, style, disabled = false, ...touchableProps }, ref) => {
    const buttonStyle = variant === 'primary' ? styles.primaryButton : styles.secondaryButton;
    const disabledStyle = disabled ? styles.disabledButton : null;
    const textStyle = [styles.buttonText, disabled ? styles.disabledText : null];

    return (
      <TouchableOpacity 
        ref={ref} 
        style={[buttonStyle, disabledStyle, style]} 
        {...touchableProps}
        disabled={disabled}
      >
        <Text style={textStyle}>{title}</Text>
        {showRightArrow && (
          <Feather name="arrow-right" size={16} color={disabled ? "#A0A0A0" : "#292D32"} style={styles.arrowIcon} />
        )}
      </TouchableOpacity>
    );
  }
);

// Container styles for button groups (can be used by parent components)
export const buttonContainerStyles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-end',
    padding: 0,
    gap: 16,
    width: 354,
    height: 114,
    alignSelf: 'stretch',
  },
});

const styles = StyleSheet.create({
  // Primary button (green)
  primaryButton: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    gap: 8,
    width: 354,
    height: 49,
    backgroundColor: '#40FF00',
    borderRadius: 100000,
    alignSelf: 'stretch',
  },
  // Secondary button (white with shadow)
  secondaryButton: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    gap: 8,
    width: 354,
    height: 49,
    backgroundColor: '#FFFFFF',
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 1,
    shadowRadius: 1,
    elevation: 1,
    borderRadius: 100000,
    alignSelf: 'stretch',
  },
  // Disabled button styling
  disabledButton: {
    backgroundColor: '#E0E0E0',
    shadowOpacity: 0,
    elevation: 0,
  },
  // Text styling for both buttons
  buttonText: {
    fontFamily: 'SF Pro Text',
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 17, // 120% of 14px
    textAlign: 'center',
    color: '#000000',
  },
  // Disabled text styling
  disabledText: {
    color: '#A0A0A0',
  },
  // Arrow icon styling
  arrowIcon: {
    width: 16,
    height: 16,
    marginLeft: 8,
    transform: [{ scaleX: -1 }],
  },
});
