export interface Transaction {
  amount: string;
  currency: string;
  timestamp: {
    date: string;
    time: string;
  };
  transactionHash: string;
  chain: string;
} 