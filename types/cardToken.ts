import { z } from 'zod';

// Schema for the nested data object in a successful response
export const CardTokenDataSchema = z.object({
  userId: z.string(),
  token: z.string(),
});
export type CardTokenData = z.infer<typeof CardTokenDataSchema>;

// Schema for the overall successful API response
export const CardTokenApiResponseSchema = z.object({
  success: z.literal(true).optional(), // Making optional based on 200 example
  statusCode: z.number().optional(), // Making optional
  message: z.string().optional(), // Making optional
  data: CardTokenDataSchema,
});
export type CardTokenApiResponse = z.infer<typeof CardTokenApiResponseSchema>;

// Schema for a generic API error response (can be reused)
export const ApiErrorResponseSchema = z.object({
  success: z.literal(false),
  statusCode: z.number(),
  message: z.string(),
  data: z.any().nullable(), // data can be null or sometimes an object with error details
});
export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>; 