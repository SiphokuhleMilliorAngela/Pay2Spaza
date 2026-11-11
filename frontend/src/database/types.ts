// Shared by db.ts (native, SQLite) and db.web.ts (browser, localStorage).
export type Tx = {
  transactionId: string; merchantId: string; customerId: string; deviceId: string;
  amount: number; currency: string; channel: 'QR' | 'USSD'; nonce: string;
  offline: boolean; createdAt: string; signature: string; publicKey: string;
  status: 'LOCAL_PENDING' | 'SUBMITTED' | 'CONFIRMED' | 'REJECTED' | 'EXPIRED';
};
