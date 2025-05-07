import { RGB } from './types';

/**
 * Generate gradient colors from an Ethereum address
 * @param address Ethereum address
 * @returns Array of RGB color strings for the gradient
 */
export function generateGradientColors(address: string): string[] {
  // Validate address format and provide fallback for invalid addresses
  if (!address || typeof address !== 'string') {
    console.warn('Invalid address provided to Web3Avatar:', address);
    // Default fallback colors for invalid addresses
    return ['rgb(233, 30, 99)', 'rgb(156, 39, 176)', 'rgb(63, 81, 181)'];
  }

  // Ensure address starts with 0x, or add it if missing
  const normalizedAddress = address.startsWith('0x') ? address : `0x${address}`;

  // Clean and normalize the address
  const cleanAddress = normalizedAddress.toLowerCase().replace(/^0x/, '');

  // Generate 3 colors from different parts of the address
  const rgbColors: RGB[] = [
    getColorFromHex(cleanAddress.substring(0, 10)),
    getColorFromHex(cleanAddress.substring(10, 20)),
    getColorFromHex(cleanAddress.substring(20, 30) || cleanAddress.substring(0, 10)),
  ];

  // Convert RGB objects to CSS color strings
  return rgbColors.map((color) => `rgb(${color.r}, ${color.g}, ${color.b})`);
}

/**
 * Generate a color from a hex string segment
 * @param hex Hex string segment from the address
 * @returns RGB color object
 */
function getColorFromHex(hex: string): RGB {
  // Create a 32-bit FNV-1a hash
  const fnv = getFnv32Hash(hex);

  // Use different bits for each color component
  return {
    r: (fnv & 0xff0000) >> 16,
    g: (fnv & 0x00ff00) >> 8,
    b: fnv & 0x0000ff,
  };
}

/**
 * FNV-1a hash implementation for consistent color generation
 * @param str Input string to hash
 * @returns 32-bit unsigned integer hash
 */
function getFnv32Hash(str: string): number {
  let hash = 0x811c9dc5; // FNV offset basis
  const prime = 0x01000193; // FNV prime

  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, prime);
  }

  return hash >>> 0; // Convert to unsigned 32-bit integer
}
