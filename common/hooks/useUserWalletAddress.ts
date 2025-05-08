import { useEmbeddedEthereumWallet, useEmbeddedSolanaWallet } from '@privy-io/expo';
import { useMemo } from 'react';

interface WalletAddresses {
  ethereum?: string;
  solana?: string;
}

/**
 * Custom hook to get addresses of embedded wallets (Ethereum and Solana)
 * associated with the currently authenticated Privy user.
 *
 * @returns An object containing wallet addresses for different chains,
 *          or undefined if no user is authenticated, Privy is not ready,
 *          or no embedded wallets of that type are found.
 */
export function useUserWallets(): WalletAddresses {
  const { wallets: ethereumWallets } = useEmbeddedEthereumWallet();
  const { wallets: solanaWallets } = useEmbeddedSolanaWallet();

  // Use useMemo to return wallet addresses if available.
  // This ensures the hook only causes re-renders if the wallets arrays actually change.
  return useMemo(() => {
    const addresses: WalletAddresses = {};
    
    // Check if ethereum wallets array exists and has at least one wallet
    if (ethereumWallets && ethereumWallets.length > 0) {
      addresses.ethereum = ethereumWallets[0].address;
    }
    
    // Check if solana wallets array exists and has at least one wallet
    if (solanaWallets && solanaWallets.length > 0) {
      addresses.solana = solanaWallets[0].address;
    }
    
    return addresses;
  }, [ethereumWallets, solanaWallets]); // Dependency array includes both wallet arrays
}

/**
 * Custom hook to get the address of the first embedded Ethereum wallet
 * associated with the currently authenticated Privy user.
 *
 * @returns The wallet address as a string, or undefined if no user is authenticated,
 *          Privy is not ready, or no embedded wallets are found.
 */
export function useUserWalletAddress(): string | undefined {
  const { wallets } = useEmbeddedEthereumWallet();

  // Use useMemo to return the address of the first wallet, if available.
  // This ensures the hook only causes re-renders if the wallets array actually changes.
  const walletAddress = useMemo(() => {
    // Check if wallets array exists and has at least one wallet
    if (wallets && wallets.length > 0) {
      return wallets[0].address;
    }
    // Return undefined if no wallets are found
    return undefined;
  }, [wallets]); // Dependency array includes wallets

  return walletAddress;
}
