export interface Merchant {
  merchantName: string | null;
  city: string | null;
  state: string | null;
}

export interface Transaction {
  userId: string;
  dateAndTime: string; // ISO 8601 date string (e.g., "2025-05-03T23:30:01.628Z")
  usdAmount: string; // Amount in USD as string
  tokenInfo: any | null; // Type unknown from example, assuming any for now
  transactionType: string; // e.g., "spending", potentially others like "deposit", "withdrawal"
  nairaAmount: string; // Amount in Naira as string
  category: string | null;
  effectiveRate: string;
  channel: string | null; // e.g., "Online", "POS"
  transactionHash: string | null;
  transactionStatus: string; // e.g., "pending", "completed"
  modeType: string | null; // e.g., "Card"
  authorizationId: string | null;
  merchant: Merchant | null;
  recipientAddress: string | null;
  toAddress: string | null;
}

export interface GetTransactionsSuccessResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: Transaction[];
}

// Define potential error response structure if needed (can reuse ApiErrorResponse)
// Example:
// export interface GetTransactionsErrorResponse extends ApiErrorResponse {} 