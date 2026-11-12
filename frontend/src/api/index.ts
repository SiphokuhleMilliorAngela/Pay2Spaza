import { mockApi } from './mock';
import { ApiResult, Merchant, OtpChallenge, SyncResult } from './types';
import { Tx } from '../database/db';

// Flip to false when the backend routes exist. Android emulator -> host is 10.0.2.2; a real phone needs your PC's LAN IP.
export const USE_MOCK = true;
const BASE_URL = 'http://10.0.2.2:3000';

// ASSUMED: the OTP route paths. Ask the backend owner and change these two lines to match her routes file.
export const OTP_PATHS = { request: '/api/otp/request', confirm: '/api/otp/confirm' };

// Responses look like { success, data, error } (same as the backend controllers).
async function callResult<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  try {
    const res = await fetch(BASE_URL + path, { headers: { 'Content-Type': 'application/json' }, ...init });
    const body = await res.json().catch(() => null);
    if (body && body.success) return { ok: true, data: body.data as T };
    return { ok: false, error: (body && body.error) || 'Request failed' };
  } catch { return { ok: false, error: 'network', network: true }; }
}
async function call<T>(path: string, init?: RequestInit): Promise<T | null> {
  const r = await callResult<T>(path, init);
  return r.ok ? r.data : null;
}

const realApi = {
  lookupMerchant: (id: string) => call<Merchant>(`/api/merchants/${encodeURIComponent(id)}`),
  submitTransactions: async (list: Tx[]): Promise<SyncResult[]> => {
    const data = await call<any>('/api/transactions/sync', { method: 'POST', body: JSON.stringify({ transactions: list }) });
    return Array.isArray(data) ? data : data?.results ?? [];
  },
  requestOtp: (identifier: string) => callResult<OtpChallenge>(OTP_PATHS.request, { method: 'POST', body: JSON.stringify({ identifier }) }),
  confirmOtp: (identifier: string, code: string) => callResult<{ verified: boolean }>(OTP_PATHS.confirm, { method: 'POST', body: JSON.stringify({ identifier, code }) }),
};

export const api = USE_MOCK ? mockApi : realApi;
