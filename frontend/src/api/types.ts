export type Merchant = { id: string; name: string; ownerFirstName: string };
export type SyncResult = { transactionId: string; status: 'CONFIRMED' | 'REJECTED'; reason?: string | null };
export type ShopTx = {
  transactionId: string; amount: number; createdAt: string; channel: string;
  status: 'LOCAL_PENDING' | 'SUBMITTED' | 'CONFIRMED' | 'REJECTED' | 'EXPIRED';
};
export type WalletInfo = { customerId: string; balance: number; offlineAllowance: number };
