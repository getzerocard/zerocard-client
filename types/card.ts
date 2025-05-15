import { z } from 'zod';

// --------- Request Related Types ---------
export interface MapCardRequestParams {
  userId: string; // Typically 'me' or a specific user ID
  status: 'active' | 'inactive' | string; // Allow other statuses if API supports
  expirationDate: string; // Format like MAY-2028
  number: string; // Card number
}

export const MapCardRequestParamsSchema = z.object({
  userId: z.string(),
  status: z.string(), // More generic for now, can be tightened with z.enum if fixed set
  expirationDate: z.string().regex(/^[A-Z]{3}-\d{4}$/, 'Invalid expiration date format (e.g., MAY-2028)'),
  number: z.string().min(10).max(19), // Basic card number length validation
});

// --------- Response Related Types (200 OK) ---------
export interface SpendingControlsChannels {
  atm: boolean;
  pos: boolean;
  web: boolean;
  mobile: boolean;
}
export const SpendingControlsChannelsSchema = z.object({
  atm: z.boolean(),
  pos: z.boolean(),
  web: z.boolean(),
  mobile: z.boolean(),
});

export interface SpendingLimitItem {
  amount: number;
  interval: string;
  categories: string[];
}
export const SpendingLimitItemSchema = z.object({
  amount: z.number(),
  interval: z.string(),
  categories: z.array(z.string()),
});

export interface CardSpendingControls {
  channels: SpendingControlsChannels;
  allowedCategories: string[];
  blockedCategories: string[];
  spendingLimits: SpendingLimitItem[];
}
export const CardSpendingControlsSchema = z.object({
  channels: SpendingControlsChannelsSchema,
  allowedCategories: z.array(z.string()),
  blockedCategories: z.array(z.string()),
  spendingLimits: z.array(SpendingLimitItemSchema),
});

export interface MappedCardMetadata {
  user_id: string;
  // Add other potential metadata fields if any
}
export const MappedCardMetadataSchema = z.object({
  user_id: z.string(),
  // Add other potential metadata fields if any
});

export interface MappedCardData {
  business: string;
  customer: string;
  account: string;
  fundingSource: string;
  type: string;
  brand: string;
  currency: string;
  maskedPan: string;
  expiryMonth: string;
  expiryYear: string;
  metadata: MappedCardMetadata;
  status: string;
  spendingControls: CardSpendingControls;
  is2FAEnrolled: boolean;
  isDigitalized: boolean;
  isDeleted: boolean;
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
  _id: string;
  __v: number;
}
export const MappedCardDataSchema = z.object({
  business: z.string(),
  customer: z.string(),
  account: z.string(),
  fundingSource: z.string(),
  type: z.string(),
  brand: z.string(),
  currency: z.string(),
  maskedPan: z.string(),
  expiryMonth: z.string().length(2),
  expiryYear: z.string().length(4),
  metadata: MappedCardMetadataSchema,
  status: z.string(),
  spendingControls: CardSpendingControlsSchema,
  is2FAEnrolled: z.boolean(),
  isDigitalized: z.boolean(),
  isDeleted: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  _id: z.string(),
  __v: z.number(),
});

export interface MapCardSuccessData {
  status: string;
  message: string;
  data: MappedCardData;
}
export const MapCardSuccessDataSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: MappedCardDataSchema,
});

export interface MapCardApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: MapCardSuccessData;
}
export const MapCardApiResponseSchema = z.object({
  success: z.boolean(),
  statusCode: z.number(),
  message: z.string(),
  data: MapCardSuccessDataSchema,
});

// --------- Error Response Related Types (e.g., 400) ---------
export interface MapCardErrorResponse {
  success: boolean;
  statusCode: number;
  message: string;
  // data might be null or an object with error details, adjust as needed
}
export const MapCardErrorResponseSchema = z.object({
  success: z.boolean(),
  statusCode: z.number(),
  message: z.string(),
  // data: z.any().optional(), // If data field can exist in errors
}); 