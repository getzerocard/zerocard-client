import { z } from 'zod';

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

export const DayOfWeekSchema = z.enum(["S", "M", "T", "W", "T2", "F", "S2"]);
export type DayOfWeek = z.infer<typeof DayOfWeekSchema>;

export interface ChangeFromLastWeek {
  percentage: number;
  isIncrease: boolean;
}

export const ChangeFromLastWeekSchema = z.object({
  percentage: z.number(),
  isIncrease: z.boolean(),
});

export interface DailySpending {
  S: number;
  M: number;
  T: number;
  W: number;
  T2: number; // Assuming T2 is Thursday
  F: number;
  S2: number; // Assuming S2 is Saturday
}

export const DailySpendingSchema = z.object({
  S: z.number(),
  M: z.number(),
  T: z.number(),
  W: z.number(),
  T2: z.number(),
  F: z.number(),
  S2: z.number(),
});

export interface WeeklySpendingSummaryData {
  totalSpentThisWeek: number;
  currency: string;
  changeFromLastWeek: ChangeFromLastWeek;
  dailySpending: DailySpending;
  highlightDay: DayOfWeek;
}

export const WeeklySpendingSummaryDataSchema = z.object({
  totalSpentThisWeek: z.number(),
  currency: z.string(),
  changeFromLastWeek: ChangeFromLastWeekSchema,
  dailySpending: DailySpendingSchema,
  highlightDay: DayOfWeekSchema,
});

export interface WeeklySpendingSummaryApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: WeeklySpendingSummaryData;
}

export const WeeklySpendingSummaryApiResponseSchema = z.object({
  success: z.boolean(),
  statusCode: z.number(),
  message: z.string(),
  data: WeeklySpendingSummaryDataSchema,
}); 