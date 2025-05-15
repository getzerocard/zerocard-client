export const TRANSACTION_QUERY_KEYS = {
  all: ['transactions'] as const,
  summaries: () => [...TRANSACTION_QUERY_KEYS.all, 'summaries'] as const,
  weeklySummary: () => [...TRANSACTION_QUERY_KEYS.summaries(), 'weekly'] as const,
  // Example for a key with parameters:
  // byId: (id: string) => [...TRANSACTION_QUERY_KEYS.all, 'detail', id] as const,
};

export const CARD_QUERY_KEYS = {
  all: ['cards'] as const,
  details: () => [...CARD_QUERY_KEYS.all, 'details'] as const,
  detail: (id: string) => [...CARD_QUERY_KEYS.details(), id] as const,
  mapCard: () => [...CARD_QUERY_KEYS.all, 'map'] as const, // Key for the map card mutation
  // Add other card related keys as needed, e.g., list, specific card details, etc.
}; 