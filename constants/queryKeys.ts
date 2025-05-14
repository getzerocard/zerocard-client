export const TRANSACTION_QUERY_KEYS = {
  all: ['transactions'] as const,
  summaries: () => [...TRANSACTION_QUERY_KEYS.all, 'summaries'] as const,
  weeklySummary: () => [...TRANSACTION_QUERY_KEYS.summaries(), 'weekly'] as const,
  // Example for a key with parameters:
  // byId: (id: string) => [...TRANSACTION_QUERY_KEYS.all, 'detail', id] as const,
}; 