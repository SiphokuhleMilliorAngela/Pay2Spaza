import 'react-native-get-random-values';
import nacl from 'tweetnacl';
import * as util from 'tweetnacl-util';
import * as SecureStore from 'expo-secure-store';

// Must match backend canonical() exactly.
export const canonical = (t: { transactionId: string; merchantId: string; amount: number; currency: string; nonce: string; createdAt: string }) =>
  [t.transactionId, t.merchantId, t.amount, t.currency, t.nonce, t.createdAt].join('|');

async function keypair() {
  const stored = await SecureStore.getItemAsync('p2s_secret');
  if (stored) return nacl.sign.keyPair.fromSecretKey(util.decodeBase64(stored));
  const kp = nacl.sign.keyPair();
  await SecureStore.setItemAsync('p2s_secret', util.encodeBase64(kp.secretKey));
  return kp;
}
export async function signTx(t: Parameters<typeof canonical>[0]) {
  const kp = await keypair();
  const sig = nacl.sign.detached(util.decodeUTF8(canonical(t)), kp.secretKey);
  return { signature: util.encodeBase64(sig), publicKey: util.encodeBase64(kp.publicKey) };
}
export const newNonce = () => util.encodeBase64(nacl.randomBytes(12));
