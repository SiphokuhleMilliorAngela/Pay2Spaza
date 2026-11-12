export type Merchant = { id: string; name: string; ownerFirstName: string };
export type SyncResult = { transactionId: string; status: 'CONFIRMED' | 'REJECTED'; reason?: string | null };

// Backend: POST request-otp returns { identifier, expiresAt } and, outside production only, the code itself in `otp`.
export type OtpChallenge = { identifier: string; expiresAt: string; otp?: string };
// `error` is the backend's message, or 'network' when the server could not be reached.
export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string; network?: boolean };
// Messages the backend sends (otpService.js). The app turns these into friendly wording.
export const OTP_ERRORS = { wrong: 'Invalid OTP', expired: 'OTP is invalid or has expired', tooMany: 'Too many OTP attempts' } as const;
