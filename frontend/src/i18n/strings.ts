// Wording copied from the Figma frames. isiZulu entries are a first draft: have a native speaker review them.
export const en = {
  appName: 'Pay2Spaza',
  // Welcome
  welcomeTitle: 'Sawubona!', welcomeHello: 'Hello, welcome.',
  welcomeLine1: 'Pay your spaza, even when', welcomeLine2: 'the signal runs away.',
  pickLanguage: 'Pick your language', letsGo: 'Let’s go', worksWithoutData: 'Works with or without data',
  // Scan
  scanTitle: 'Who are you paying?', scanHint: 'Point at the shop’s QR code',
  noCameraTitle: 'No camera or no QR?', typeCodeSub: 'Type the shop code instead.',
  typeShopCode: 'Type shop code', codePlaceholder: 'e.g. SPZ12345', findShop: 'Find shop',
  allowCamera: 'Allow camera', cameraNeeded: 'We need your camera to scan the shop’s code.',
  notFound: 'We couldn’t find that shop. Check the code and try again.',
  onlineChip: 'Online', offlineChip: 'Offline',
  // Confirm
  payAShop: 'Pay a spaza',
  checkedBy: (n: string) => `Checked by Pay2Spaza · ${n}’s shop`,
  howMuch: 'How much?', payBtn: (n: string) => `Pay ${n}`, cancel: 'Not now',
  onlineNote: (n: string) => `Online now. ${n} gets this straight away.`,
  offlineNote: 'No signal. We’ll save this on your phone and send it when you’re back online.',
  // Success
  sharp: 'Sharp!', sentTo: (a: string, n: string) => `${a} sent to ${n}`,
  receiptShop: 'Shop', receiptPaid: 'Paid', receiptRef: 'Reference',
  done: 'Done', shareReceipt: 'Share receipt',
  failedTitle: 'That one didn’t go through', failedBody: 'No money left your account. Please try again.',
  // Saved offline
  noSignal: 'No signal', savedTitle: 'Saved on your phone',
  savedBody1: (n: string) => `${n} gets paid once you’re back online.`, savedBody2: 'We’ll send it as soon as you have signal.',
  onItsWay: 'On its way', offlineAllowance: 'Offline allowance',
  allowanceLeft: (r: number) => `R${r} left`,
  paymentsLeft: (c: number) => `${c} of 5 offline payments left`,
  limitAmount: (left: number) => `That’s more than your offline allowance. You have R${left} left until you’re back online.`,
  limitCount: 'You’ve used all 5 offline payments. Please wait until you have signal.',
  // Shop owner
  verified: 'Verified', open: 'Open', showCode: 'Show this code to customers', today: 'Today',
  onTheWay: (n: number) => `${n} payment${n === 1 ? '' : 's'} still on the way`,
  noPayments: 'No payments yet today', paidChip: 'Paid', backedBy: 'Backed by customer’s reserve',
  // Dev tools
  demoOffline: 'Pretend there’s no signal',
  // Phone number + SMS code (not in Figma yet: built with the same look as the Confirm screen)
  phoneTitle: 'Let’s check it’s you', phoneSub: 'We’ll text you a 6-digit code.', phoneLabel: 'Your cell number',
  phonePlaceholder: '82 123 4567', sendCode: 'Send code', sending: 'Sending…', back: 'Back',
  phoneInvalid: 'That doesn’t look like a South African cell number. Try 082 123 4567.',
  otpTitle: 'Enter your code', otpSent: (p: string) => `We sent a 6-digit code to ${p}.`, otpWrongNumber: 'Wrong number?',
  otpExpiresIn: (s: string) => `Code expires in ${s}`, otpExpired: 'That code has expired.',
  otpResend: 'Send a new code', otpResendIn: (s: number) => `Send a new code in ${s}s`,
  verify: 'Verify', verifying: 'Checking…',
  otpWrong: 'That code isn’t right. Check the SMS and try again.', otpExpiredMsg: 'That code has expired. Send a new one.',
  otpTooMany: 'Too many tries. Send a new code.', otpVerifyFailed: 'We couldn’t check that code. Please try again.',
  otpNetwork: 'We can’t reach the server. Check your connection and try again.',
  otpNeedsSignal: 'You need signal to verify your number. Try again when you’re online.',
  otpSendFailed: 'We couldn’t send the code. Please try again.',
  devCode: (c: string) => `Dev mode: your code is ${c}`, devFill: 'Fill it in',
  // Feature phone (USSD)
  ussdTitle: 'Feature phone', ussdSub: 'No data needed. Dial *120*321#', ussdDialed: 'Dialled *120*321#',
  ussdMenuLabel: '1 · MENU', ussdConfirmLabel: '2 · CONFIRM', ussdSmsLabel: '3 · SMS RECEIPT',
  ussdFootnote: 'Short menus keep airtime costs low.', ussdTry: 'Try it', ussdSend: 'Send', ussdCancel: 'Cancel',
  ussdRedial: 'Dial again', ussdReply: 'Your reply',
  ussdDemoNote: 'Demo: any 4-digit PIN works here. The real PIN is checked by the server.',
};
export type Strings = typeof en;
const zu: Partial<Strings> = {
  welcomeTitle: 'Sawubona!', pickLanguage: 'Khetha ulimi lwakho', letsGo: 'Asiqale',
  scanTitle: 'Ukhokhela bani?', scanHint: 'Khomba ikhodi ye-QR yesitolo',
  cancel: 'Hhayi manje', done: 'Kwenziwe', howMuch: 'Malini?', savedTitle: 'Ilondolozwe efonini yakho',
  onlineChip: 'Ku-inthanethi', offlineChip: 'Alikho uphawu',
};
export const strings: Record<'en' | 'zu', Strings> = { en, zu: { ...en, ...zu } };
export const LANGUAGES = ['English', 'isiZulu', 'isiXhosa', 'Sesotho', 'Setswana', 'Afrikaans'] as const;
