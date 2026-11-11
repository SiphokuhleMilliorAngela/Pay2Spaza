import { mockApi } from './mock';
import { Merchant, SyncResult } from './types';
import { Tx } from '../database/db';

// Local development backend.
export const USE_MOCK = false;
const BASE_URL = 'http://10.0.0.4:3000';

// ASSUMED CONTRACT (agree with backend): responses look like { success, data, error }.
async function call<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(BASE_URL + path, { headers: { 'Content-Type': 'application/json' }, ...init });
    const body = await res.json();
    return body.success ? (body.data as T) : null;
  } catch { return null; }
}

const realApi = {
  lookupMerchant: (id: string) => call<Merchant>(`/api/merchants/${encodeURIComponent(id)}`),
  submitTransactions: async (list: Tx[]): Promise<SyncResult[]> =>
    (await call<{ results: SyncResult[] }>('/api/transactions/sync', { method: 'POST', body: JSON.stringify({ transactions: list }) }))?.results ?? [],
};

export const api = USE_MOCK ? mockApi : realApi;
