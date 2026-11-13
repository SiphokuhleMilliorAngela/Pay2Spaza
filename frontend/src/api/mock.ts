import { ApiResult, Merchant, OtpChallenge, OTP_ERRORS, SyncResult } from './types';
import { Tx } from '../database/db';

const seen = new Set<string>(); // fake replay protection
const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
const SHOPS: Record<string, Merchant> = {
  SPZ12345: { id: 'SPZ12345', name: 'Thuba’s Spaza', ownerFirstName: 'Thuba' },
  SPZ67890: { id: 'SPZ67890', name: 'Mama Nomsa’s Tuck Shop', ownerFirstName: 'Nomsa' },
};

// Fake OTP server. Behaves like backend otpService.js: 6 digits, 5 minutes, 5 tries, and returns the code in dev.
const OTP_TTL_MS = 5 * 60 * 1000, OTP_MAX_ATTEMPTS = 5;
const challenges = new Map<string, { code: string; expiresAt: number; attempts: number; consumed: boolean }>();

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
  async requestOtp(identifier: string): Promise<ApiResult<OtpChallenge>> {
    await wait(500);
    const id = identifier.trim().toLowerCase();
    if (!id) return { ok: false, error: 'A valid identifier is required' };
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = Date.now() + OTP_TTL_MS;
    challenges.set(id, { code, expiresAt, attempts: 0, consumed: false });
    return { ok: true, data: { identifier: id, expiresAt: new Date(expiresAt).toISOString(), otp: code } };
  },
  async confirmOtp(identifier: string, code: string): Promise<ApiResult<{ verified: boolean }>> {
    await wait(500);
    const id = identifier.trim().toLowerCase();
    const c = challenges.get(id);
    if (!c || c.consumed || c.expiresAt <= Date.now()) return { ok: false, error: OTP_ERRORS.expired };
    if (c.attempts >= OTP_MAX_ATTEMPTS) return { ok: false, error: OTP_ERRORS.tooMany };
    if (!/^\d{6}$/.test(code) || code !== c.code) { c.attempts += 1; return { ok: false, error: OTP_ERRORS.wrong }; }
    c.consumed = true;
    return { ok: true, data: { verified: true } };
  },
};
