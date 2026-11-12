import { Merchant } from '../api/types';
import { Tx } from '../database/db';

// A pretend USSD session (the "*120*321#" menu). On a real feature phone the same menus come from the backend through a
// USSD gateway such as Africa's Talking; this file lets the app show and test the flow. The text is English only for now.
// DEMO ONLY: any 4-digit PIN is accepted. A real PIN must be checked by the server, never on the phone.

export type UssdState =
  | { step: 'menu' } | { step: 'shop' } | { step: 'check' }
  | { step: 'amount'; merchant: Merchant }
  | { step: 'pin'; merchant: Merchant; amount: number; tries: number };

export type UssdView = {
  text: string;
  input: 'number' | 'text' | 'pin';
  end?: boolean;   // session is over
  sms?: string;    // text message sent after a payment
};

export type UssdDeps = {
  lookupMerchant: (code: string) => Promise<Merchant | null>;
  history: () => Promise<Tx[]>;
  pay: (merchantId: string, amount: number) => Promise<{ kind: 'confirmed' | 'pending' | 'rejected'; transactionId: string; reason?: string | null }>;
};

export const MENU_TEXT = 'Pay2Spaza\n1. Pay a shop\n2. Check a payment\n3. My payments\n4. Help';
export const START: { state: UssdState; view: UssdView } = { state: { step: 'menu' }, view: { text: MENU_TEXT, input: 'number' } };

const rand = (n: number) => `R${n.toFixed(2)}`;
const label = (s: Tx['status']) => (s === 'CONFIRMED' ? 'Paid' : s === 'REJECTED' ? 'Failed' : s === 'EXPIRED' ? 'Expired' : 'Pending');

export async function ussdNext(state: UssdState, raw: string, d: UssdDeps): Promise<{ state: UssdState; view: UssdView }> {
  const input = raw.trim();
  switch (state.step) {
    case 'menu': {
      if (input === '1') return { state: { step: 'shop' }, view: { text: 'Enter shop code:', input: 'text' } };
      if (input === '2') return { state: { step: 'check' }, view: { text: 'Enter reference:', input: 'text' } };
      if (input === '3') {
        const list = (await d.history()).slice(0, 3);
        const text = list.length ? `My payments\n${list.map(t => `${rand(t.amount)} ${label(t.status)}`).join('\n')}` : 'No payments yet.';
        return { state, view: { text, input: 'number', end: true } };
      }
      if (input === '4') return { state, view: { text: 'Dial *120*321#\nPay with a shop code.\nNo data needed.', input: 'number', end: true } };
      return { state, view: { text: `Invalid choice.\n${MENU_TEXT}`, input: 'number' } };
    }
    case 'shop': {
      if (!input) return { state, view: { text: 'Enter shop code:', input: 'text' } };
      const m = await d.lookupMerchant(input.toUpperCase());
      if (!m) return { state, view: { text: 'Shop not found.\nEnter shop code:', input: 'text' } };
      return { state: { step: 'amount', merchant: m }, view: { text: `Pay ${m.name}\nEnter amount (R):`, input: 'number' } };
    }
    case 'amount': {
      const n = parseFloat(input.replace(',', '.'));
      if (!(n > 0) || n > 5000) return { state, view: { text: 'Invalid amount.\nEnter amount (R):', input: 'number' } };
      const amount = Math.round(n * 100) / 100;
      return { state: { step: 'pin', merchant: state.merchant, amount, tries: 0 }, view: { text: `Pay ${state.merchant.name}\n${rand(amount)}\nEnter your PIN:`, input: 'pin' } };
    }
    case 'pin': {
      if (!/^\d{4}$/.test(input)) {
        const tries = state.tries + 1;
        if (tries >= 3) return { state, view: { text: 'Too many tries.\nSession ended.', input: 'pin', end: true } };
        return { state: { ...state, tries }, view: { text: 'PIN must be 4 digits.\nEnter your PIN:', input: 'pin' } };
      }
      const { merchant, amount } = state;
      const r = await d.pay(merchant.id, amount);
      if (r.kind === 'confirmed') {
        return { state, view: { text: `Sharp! ${rand(amount)} sent\nto ${merchant.ownerFirstName}.\nRef ${r.transactionId}`, input: 'number', end: true,
          sms: `Pay2Spaza: ${rand(amount)} paid to ${merchant.name}. Ref ${r.transactionId}.` } };
      }
      if (r.kind === 'pending') {
        return { state, view: { text: `Saved. We’ll send it\nwhen the network is back.\nRef ${r.transactionId}`, input: 'number', end: true } };
      }
      return { state, view: { text: `Payment not sent.\n${r.reason || 'Please try again.'}`, input: 'number', end: true } };
    }
    case 'check': {
      const ref = input.toUpperCase();
      const found = (await d.history()).find(t => t.transactionId.toUpperCase() === ref);
      const text = found ? `${found.transactionId}\n${rand(found.amount)} ${label(found.status)}` : 'Reference not found.';
      return { state, view: { text, input: 'number', end: true } };
    }
  }
}
