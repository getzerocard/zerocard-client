export interface SetSpendingLimitParams {
  usdAmount: number;
  chainType: 'ethereum' | 'solana'; // Add other supported types if needed
  tokenSymbol: 'USDC' | 'USDT'; // Add other supported symbols if needed
  blockchainNetwork: string; // e.g., 'Base', 'BNB Smart Chain', 'Solana Devnet'
}

export interface SpendingLimitResponseData {
  id: string;
  userId: string;
  usdAmount: number;
  fxRate: string;
  nairaAmount: number;
  nairaRemaining: number;
  createdAt: string;
  updatedAt: string;
  orderId: string;
  status: string; // e.g., 'COMPLETED'
  txHash: string;
}

export interface SetSpendingLimitSuccessResponse {
  data: SpendingLimitResponseData;
}

// You might also want types for error responses if you handle them specifically
export interface ApiErrorResponse {
  statusCode: number;
  success: boolean;
  message: string;
} 