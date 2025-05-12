export interface GetBalanceParams {
  symbols: string; // e.g., "USDC" or comma-separated like "USDC,ETH"
  chainType: 'ethereum' | 'solana'; // Add other supported types if needed
  blockchainNetwork: string; // e.g., "Base Sepolia"
}

export interface TokenBalance {
  [networkName: string]: string | 'Unsupported combination'; // Allow string balance or specific message
}

export interface BalancesData {
  [tokenSymbol: string]: TokenBalance;
}

export interface GetBalanceSuccessResponse {
  data: {
    balances: BalancesData;
  };
}

// You can reuse ApiErrorResponse from spendingLimit.ts or define a specific one
// export interface GetBalanceErrorResponse {
//   statusCode: number;
//   success: boolean;
//   message: string;
// } 