/**
 * Type declarations for Privy-io Expo UI module
 */

declare module '@privy-io/expo/dist/ui' {
  export interface UseDelegatedActionsInterface {
    delegateWallet: (params: { address: string; chainType: string }) => Promise<void>;
  }

  export interface UseLoginInterface {
    login: () => Promise<void>;
  }

  export function useDelegatedActions(): UseDelegatedActionsInterface;
  export function useLogin(): UseLoginInterface;
}

// Ensure TypeScript treats this as a module
export {}; 