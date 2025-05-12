export interface ProcessWithdrawalParams {
      tokenSymbol: 'USDC'; // Add other supported symbols if needed
      amount: string; // API expects amount as string
      recipientAddress: string;
      chainType: 'ethereum' | 'solana'; // Add other supported types if needed
      blockchainNetwork: string; // e.g., 'Base', 'BNB Smart Chain', 'Solana Devnet'
    }

    export interface WithdrawalSuccessData {
      transactionHash: string;
      userId: string;
      message: string;
      amount: string;
      tokenSymbol: string;
      to: string;
      from: string;
      chainType: string;
      blockchainNetwork: string;
    }

    export interface ProcessWithdrawalSuccessResponse {
      data: WithdrawalSuccessData;
    }

    // Reusing ApiErrorResponse from spendingLimit for consistency, or define a specific one
    // export interface WithdrawalErrorResponse {
    //   statusCode: number;
    //   success: boolean;
    //   message: string; // e.g., "Insufficient balance..." or "Failed to process..."
    // } 