export type Merchant = { id: string; name: string; ownerFirstName: string };
export type SyncResult = { transactionId: string; status: 'CONFIRMED' | 'REJECTED'; reason?: string | null };
