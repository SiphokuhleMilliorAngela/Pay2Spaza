import * as SecureStore from 'expo-secure-store';

// The phone number that passed the OTP check on this device. Kept in secure storage, so verification happens once.
const KEY = 'p2s_verified_phone';

export async function getVerifiedPhone(): Promise<string | null> {
  try { return await SecureStore.getItemAsync(KEY); } catch { return null; }
}
export async function setVerifiedPhone(phone: string) {
  try { await SecureStore.setItemAsync(KEY, phone); } catch { /* the person just has to verify again next time */ }
}
export async function clearVerifiedPhone() {
  try { await SecureStore.deleteItemAsync(KEY); } catch { /* ignore */ }
}
