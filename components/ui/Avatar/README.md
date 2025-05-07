# Web3Avatar for React Native

A React Native/Expo component that generates unique gradient avatars from Ethereum wallet addresses. Inspired by Web3 Modal avatar.

## Installation

The component uses Expo's LinearGradient, so make sure it's installed:

```bash
npx expo install expo-linear-gradient
```

## Usage

```tsx
import Web3Avatar from './components/Web3Avatar';

// Basic usage
<Web3Avatar
  address="0x11Ed0AC7D6142481E459B6e5d4bfB5646277796f"
  size={60}
/>

// Custom border radius
<Web3Avatar
  address="0x11Ed0AC7D6142481E459B6e5d4bfB5646277796f"
  size={60}
  borderRadius={10}
/>

// With additional styles
<Web3Avatar
  address="0x11Ed0AC7D6142481E459B6e5d4bfB5646277796f"
  size={60}
  style={{ marginRight: 10 }}
/>
```

## Props

| Prop           | Type      | Default    | Description                                  |
| -------------- | --------- | ---------- | -------------------------------------------- |
| `address`      | string    | (required) | Ethereum address used to generate the avatar |
| `size`         | number    | 40         | Size of the avatar (width and height)        |
| `borderRadius` | number    | size/2     | Border radius of the avatar                  |
| `style`        | ViewStyle | undefined  | Additional styles for the container          |

## Utility Functions

The component also exports a utility function for generating colors from an Ethereum address:

```tsx
import { generateGradientColors } from './components/Web3Avatar';

// Returns an array of RGB color strings
const colors = generateGradientColors('0x11Ed0AC7D6142481E459B6e5d4bfB5646277796f');
```

## How It Works

1. The component takes an Ethereum address as input
2. It generates a unique set of gradient colors based on the address using an FNV-1a hash algorithm
3. The colors are applied to an Expo LinearGradient component
4. By default, the avatar is rendered as a circle, but you can customize the border radius
