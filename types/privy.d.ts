import '@privy-io/expo';

declare module '@privy-io/expo' {
  interface UsePrivy {
    ready: boolean;
    user: any;
    logout: () => Promise<void>;
    // Add other properties as needed
  }
}
