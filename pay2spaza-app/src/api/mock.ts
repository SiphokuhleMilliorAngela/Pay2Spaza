import { Merchant, SyncResult } from './types';
import { Tx } from '../database/db';

const seen = new Set<string>(); // fake replay protection
const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
const SHOPS: Record<string, Merchant> = {
  SPZ12345: { id: 'SPZ12345', name: 'Thuba’s Spaza', ownerFirstName: 'Thuba' },
  SPZ67890: { id: 'SPZ67890', name: 'Mama Nomsa’s Tuck Shop', ownerFirstName: 'Nomsa' },
};

export const mockApi = {
  async lookupMerchant(id: string): Promise<Merchant | null> { await wait(300); return SHOPS[id] ?? null; },
  async submitTransactions(list: Tx[]): Promise<SyncResult[]> {
    await wait(700);
    return list.map(t => {
      if (seen.has(t.nonce)) return { transactionId: t.transactionId, status: 'REJECTED', reason: 'Possible replay attack' } as SyncResult;
      seen.add(t.nonce);
      return { transactionId: t.transactionId, status: 'CONFIRMED' } as SyncResult;
    });
  },
};
