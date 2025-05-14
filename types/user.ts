export interface UserProfileData {
  id: string;
  userId: string;
  username: string | null;
  accountNumber: string | null;
  accountName: string | null;
  EVMWalletAddress: string | null;
  SolanaWalletAddress: string | null;
  BitcoinWalletAddress: string | null;
  TronWalletAddress: string | null;
  firstName: string | null;
  lastName: string | null;
  dateOfBirth: string | null; // Assuming date is string, adjust if it's Date object
  phoneNumber: string | null;
  shippingAddress: string | null; // Could be a more complex object
  verificationStatus: "pending" | "verified" | "failed" | string; // Use string as fallback for other statuses
  identityType: string | null;
  isIdentityVerified: boolean;
  cardOrderStatus: "not_ordered" | "ordered" | "shipped" | "delivered" | string; // Use string as fallback
  trackingNumber: string | null;
  customerId: string | null;
  email: string | null;
  timeZone: string | null;
  accountId: string | null;
  cardId: string | null;
  isMainUser: boolean;
  createdAt: string; // Assuming ISO date string
  updatedAt: string; // Assuming ISO date string
  upgradeRequestStatus: string | null;
  base64Photo: string | null;
  parentUser: string | null; // Or a more complex UserProfileData object if nested
  subUsers: UserProfileData[]; // Assuming subUsers are also UserProfileData
}

export interface UserApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: UserProfileData;
} 