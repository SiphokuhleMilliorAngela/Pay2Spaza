// Switches that should match the backend.
export const REQUIRE_OTP = true;        // false skips the phone check (useful while the backend is not ready)
export const OTP_LENGTH = 6;            // backend: OTP_LENGTH in otpService.js
export const OTP_RESEND_SECONDS = 30;   // how long before "Send a new code" unlocks (app only)
