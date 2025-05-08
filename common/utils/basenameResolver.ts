import {
  createPublicClient,
  http,
  keccak256,
  encodePacked,
  namehash,
  Address,
} from 'viem';
import { base } from 'viem/chains';

// Import the ABI directly to avoid module resolution issues
const L2ResolverAbi = [
  // Read function to get the Ethereum address for a node
  {
    inputs: [{ internalType: "bytes32", name: "node", type: "bytes32" }],
    name: "addr",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  // Read function to get the address for a specific coin type (multi-chain support)
  {
    inputs: [
      { internalType: "bytes32", name: "node", type: "bytes32" },
      { internalType: "uint256", name: "coinType", type: "uint256" },
    ],
    name: "addr",
    outputs: [{ internalType: "bytes", name: "", type: "bytes" }],
    stateMutability: "view",
    type: "function",
  },
  // Read function to get the name for a node (reverse resolution)
  {
    inputs: [{ internalType: "bytes32", name: "node", type: "bytes32" }],
    name: "name",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  }
] as const;

// Resolver contract addresses on Base Mainnet
const L2_RESOLVER_ADDRESS = '0xC6d566A56A1aFf6508b41f6c90ff131615583BCD';
const BASE_SUFFIX = '.base.eth';

// Recognize the zero address as not found
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

// Create public client to interact with Base chain
const client = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org'),
});

/**
 * Converts a wallet address to a reverse lookup node hash
 */
export function addressToReverseNode(address: string): `0x${string}` {
  const addr = address.toLowerCase().replace(/^0x/, '');
  const reverseName = `${addr}.addr.reverse`;
  return keccak256(encodePacked(['string'], [reverseName]));
}

/**
 * Converts a basename (e.g., "example.base.eth") to ENS node format
 */
export function basenameToNode(basename: string): `0x${string}` {
  // Ensure the name ends with .base.eth
  const fullName = basename.endsWith(BASE_SUFFIX) 
    ? basename 
    : `${basename}${BASE_SUFFIX}`;
  
  return namehash(fullName);
}

/**
 * Resolves a basename to an Ethereum address
 * @param basename The basename to resolve (with or without .base.eth)
 * @returns The resolved Ethereum address or null if not found
 */
export async function resolveBasenameToAddress(basename: string): Promise<Address | null> {
  try {
    // Ensure the name has the .base.eth suffix
    const fullName = basename.endsWith(BASE_SUFFIX) 
      ? basename 
      : `${basename}${BASE_SUFFIX}`;
    
    const node = namehash(fullName);
    
    const address = (await client.readContract({
      address: L2_RESOLVER_ADDRESS,
      abi: L2ResolverAbi,
      functionName: 'addr',
      args: [node],
    })) as Address;
    
    // If the resolver returns the zero address, treat as not found
    if (!address || address.toLowerCase() === ZERO_ADDRESS) {
      return null;
    }
    
    return address;
  } catch (error) {
    console.error('Error resolving basename to address:', error);
    return null;
  }
}

/**
 * Resolves an Ethereum address to a basename
 * @param address The Ethereum address to resolve
 * @returns The resolved basename or null if not found
 */
export async function resolveAddressToBasename(address: string): Promise<string | null> {
  try {
    const reverseNode = addressToReverseNode(address);
    
    const name = await client.readContract({
      address: L2_RESOLVER_ADDRESS,
      abi: L2ResolverAbi,
      functionName: 'name',
      args: [reverseNode],
    });
    
    // Verify the result is a non-empty string
    return typeof name === 'string' && name.length > 0 ? name : null;
  } catch (error) {
    console.error('Error resolving address to basename:', error);
    return null;
  }
}

/**
 * Validates if a string is a valid Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validates if a string is a valid basename format (with or without suffix)
 */
export function isValidBasename(name: string): boolean {
  // Check with or without .base.eth suffix
  return /^[a-zA-Z0-9-]+$/i.test(name) || /^[a-zA-Z0-9-]+(\.base\.eth)$/i.test(name);
}

/**
 * Validates if a string is a fully qualified basename ending with .base.eth
 */
export function isBasenameWithSuffix(name: string): boolean {
  return /^[a-zA-Z0-9-]+(\.base\.eth)$/i.test(name);
} 