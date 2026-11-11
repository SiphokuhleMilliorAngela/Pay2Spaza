import { mockApi } from './mock';
import { Merchant, SyncResult } from './types';
import { cacheMerchant, getCachedMerchant, Tx } from '../database/db';

// Flip to false when the backend routes exist. Android emulator -> host is 10.0.2.2; a real phone needs your PC's LAN IP.
export const USE_MOCK = true;
const BASE_URL = 'http://10.0.2.2:3000';

// ASSUMED CONTRACT (agree with backend): responses look like { success, data, error }.
async function call<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(BASE_URL + path, { headers: { 'Content-Type': 'application/json' }, ...init });
    const body = await res.json();
    return body.success ? (body.data as T) : null;
  } catch { return null; }
}

const realApi = {
  lookupMerchant: async (id: string): Promise<Merchant | null> => {
  const m = await call<Merchant>(`/api/merchants/${encodeURIComponent(id)}`);
  if (m) { cacheMerchant(m).catch(() => {}); return m; }
  return getCachedMerchant(id); // offline or unreachable: use the saved copy
},

export const api = USE_MOCK ? mockApi : realApi;
