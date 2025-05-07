import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  RadialGradient,
  Stop,
  Rect,
} from 'react-native-svg';

import { Web3AvatarProps } from './types';
import { generateGradientColors } from './utils';

/**
 * Web3Avatar generates unique gradient avatars from Ethereum addresses
 * with a mesh gradient effect for visual depth
 *
 * @example
 * ```tsx
 * <Web3Avatar
 *   address="0x11Ed0AC7D6142481E459B6e5d4bfB5646277796f"
 *   size={60}
 * />
 * ```
 */
const Web3Avatar: React.FC<Web3AvatarProps> = ({ address, size = 40, style, borderRadius }) => {
  // Ensure address is a string and has a valid format
  const safeAddress = React.useMemo(() => {
    if (!address || typeof address !== 'string') {
      console.warn('Invalid address provided to Web3Avatar, using fallback');
      return '0x0000000000000000000000000000000000000000';
    }
    return address;
  }, [address]);

  // Generate colors based on address
  const generatedColors = generateGradientColors(safeAddress);

  // Fallback colors if we somehow get less than 6 colors
  const defaultColors = [
    'rgb(233, 30, 99)',
    'rgb(156, 39, 176)',
    'rgb(63, 81, 181)',
    'rgb(33, 150, 243)',
    'rgb(76, 175, 80)',
    'rgb(255, 152, 0)',
  ];

  // Default to circular avatar if borderRadius not specified
  const finalBorderRadius = borderRadius ?? size / 2;

  // Get hex values without rgb()
  const getHexFromRgb = (rgbStr: string) => {
    const matches = rgbStr.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!matches) return '#ff00ff';
    const [_, r, g, b] = matches;
    return `#${Number(r).toString(16).padStart(2, '0')}${Number(g).toString(16).padStart(2, '0')}${Number(b).toString(16).padStart(2, '0')}`;
  };

  // Create more colors for the mesh if needed
  const meshColors = useMemo(() => {
    const colors = [...generatedColors];

    // We need at least 6 colors for a decent mesh
    while (colors.length < 6) {
      const idx = colors.length % generatedColors.length;
      const baseColor = generatedColors[idx] || defaultColors[idx];
      const matches = baseColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);

      if (matches) {
        const [_, r, g, b] = matches.map(Number);
        // Create variants with hue shifts
        const newColor = `rgb(${Math.min(255, (r + 50) % 255)}, ${Math.min(255, (g + 70) % 255)}, ${Math.min(255, (b + 90) % 255)})`;
        colors.push(newColor);
      } else {
        colors.push(defaultColors[colors.length]);
      }
    }

    return colors.map(getHexFromRgb);
  }, [generatedColors]);

  // Create deterministic mesh points based on the address
  const getMeshPoints = (str: string, numPoints = 8) => {
    try {
      // Ensure we have a valid string
      if (!str || typeof str !== 'string') {
        console.warn('Invalid string provided to getMeshPoints, using fallback');
        str = '0x0000000000000000000000000000000000000000';
      }

      // Create a hash function
      const hashCode = (s: string) => {
        let hash = 0;
        for (let i = 0; i < s.length; i++) {
          hash = s.charCodeAt(i) + ((hash << 5) - hash);
        }
        return hash;
      };

      // Create a deterministic "random" generator
      const seededRandom = (seed: number, index: number) => {
        const x = Math.sin(seed + index) * 10000;
        return x - Math.floor(x);
      };

      const seed = hashCode(str);
      const points = [];

      // Generate points for the mesh
      for (let i = 0; i < numPoints; i++) {
        points.push({
          x: 10 + seededRandom(seed, i * 2) * 80, // 10-90% of width
          y: 10 + seededRandom(seed, i * 2 + 1) * 80, // 10-90% of height
          color: meshColors[i % meshColors.length],
        });
      }

      return points;
    } catch (error) {
      console.error('Error in getMeshPoints:', error);
      // Return fallback points in case of error
      return Array(numPoints)
        .fill(0)
        .map((_, i) => ({
          x: 10 + ((i * 10) % 80),
          y: 10 + ((i * 15) % 80),
          color: defaultColors[i % defaultColors.length],
        }));
    }
  };

  const meshPoints = useMemo(() => getMeshPoints(address), [address, meshColors]);

  // Create a mesh gradient using overlapping radial gradients
  const createMeshGradient = () => {
    try {
      // Ensure we have valid meshColors
      if (!meshColors || !Array.isArray(meshColors) || meshColors.length < 2) {
        console.warn('Invalid meshColors in createMeshGradient, using fallback');
        return (
          <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
            <Rect
              x="0"
              y="0"
              width={size}
              height={size}
              fill="#ff00ff"
              rx={finalBorderRadius}
              ry={finalBorderRadius}
            />
          </Svg>
        );
      }

      // Ensure we have valid meshPoints
      if (!meshPoints || !Array.isArray(meshPoints) || meshPoints.length === 0) {
        console.warn('Invalid meshPoints in createMeshGradient, using fallback');
        return (
          <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
            <Rect
              x="0"
              y="0"
              width={size}
              height={size}
              fill={meshColors[0]}
              rx={finalBorderRadius}
              ry={finalBorderRadius}
            />
          </Svg>
        );
      }

      return (
        <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
          <Defs>
            {/* Clip path for the rounded corners */}
            <RadialGradient id="baseFill" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <Stop offset="0%" stopColor={meshColors[0]} />
              <Stop offset="100%" stopColor={meshColors[1]} />
            </RadialGradient>

            {/* Create a gradient for each mesh point */}
            {meshPoints.map((point, idx) => (
              <RadialGradient
                key={`grad-${idx}`}
                id={`grad${idx}`}
                cx={`${point.x}%`}
                cy={`${point.y}%`}
                r="60%"
                fx={`${point.x}%`}
                fy={`${point.y}%`}
                gradientUnits="userSpaceOnUse">
                <Stop offset="0%" stopColor={point.color} stopOpacity="0.9" />
                <Stop offset="50%" stopColor={point.color} stopOpacity="0.4" />
                <Stop offset="100%" stopColor={point.color} stopOpacity="0" />
              </RadialGradient>
            ))}
          </Defs>

          {/* Base shape with rounded corners */}
          <Rect
            x="0"
            y="0"
            width={size}
            height={size}
            fill="url(#baseFill)"
            rx={finalBorderRadius}
            ry={finalBorderRadius}
          />

          {/* Overlay all the mesh gradients */}
          {meshPoints.map((_, idx) => (
            <Rect
              key={`overlay-${idx}`}
              x="0"
              y="0"
              width={size}
              height={size}
              fill={`url(#grad${idx})`}
              rx={finalBorderRadius}
              ry={finalBorderRadius}
            />
          ))}

          {/* Add a subtle highlight for 3D effect */}
          <SvgLinearGradient id="highlight" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="white" stopOpacity="0.3" />
            <Stop offset="100%" stopColor="white" stopOpacity="0" />
          </SvgLinearGradient>

          <Rect
            x="0"
            y="0"
            width={size}
            height={size}
            fill="url(#highlight)"
            rx={finalBorderRadius}
            ry={finalBorderRadius}
          />

          {/* Add a subtle rim light */}
          <Rect
            x="1"
            y="1"
            width={size - 2}
            height={size - 2}
            stroke="white"
            strokeWidth="1"
            strokeOpacity="0.3"
            fill="none"
            rx={finalBorderRadius - 1}
            ry={finalBorderRadius - 1}
          />
        </Svg>
      );
    } catch (error) {
      console.error('Error in createMeshGradient:', error);
      // Return a simple fallback in case of error
      return (
        <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
          <Rect
            x="0"
            y="0"
            width={size}
            height={size}
            fill="#40ff00"
            rx={finalBorderRadius}
            ry={finalBorderRadius}
          />
        </Svg>
      );
    }
  };

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius: finalBorderRadius },
        style,
      ]}>
      {createMeshGradient()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
  },
});

export default Web3Avatar;
