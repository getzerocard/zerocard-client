import { ViewStyle } from 'react-native';

/**
 * RGB color representation
 */
export interface RGB {
  r: number;
  g: number;
  b: number;
}

/**
 * Props for the Web3Avatar component
 */
export interface Web3AvatarProps {
  /**
   * Ethereum address to generate the avatar from
   */
  address: string;

  /**
   * Size of the avatar in pixels (both width and height)
   * @default 40
   */
  size?: number;

  /**
   * Custom styles to apply to the avatar container
   */
  style?: ViewStyle;

  /**
   * Custom border radius for the avatar
   * @default size/2 (circular)
   */
  borderRadius?: number;
}
