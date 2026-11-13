// English: the master list. Every other language file must have exactly these keys (TypeScript checks it).
export const fmt = (n: number) => String(Math.round(n * 100) / 100);

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
  allowanceLeft: (r: number) => `R${fmt(r)} left`,
  paymentsLeft: (c: number) => `${c} of 5 offline payments left`,
  limitAmount: (left: number) => `That’s more than your offline allowance. You have R${fmt(left)} left until you’re back online.`,
  limitCount: 'You’ve used all 5 offline payments. Please wait until you have signal.',
  // Shop owner
  verified: 'Verified', open: 'Open', showCode: 'Show this code to customers', today: 'Today',
  onTheWay: (n: number) => `${n} payment${n === 1 ? '' : 's'} still on the way`,
  noPayments: 'No payments yet today', paidChip: 'Paid', backedBy: 'Backed by customer’s reserve',
  // Dev tools
  demoOffline: 'Pretend there’s no signal',
  // Sign in
  loginTitle: 'Sign in', loginSub: 'We’ll text you a 6-digit code.',
  roleCustomer: 'Customer', roleOwner: 'Shop owner',
  phoneLabel: 'Your cell number', phonePlaceholder: '082 123 4567', shopCodeLabel: 'Shop code',
  sendCode: 'Send code', codeTitle: 'Enter your code',
  codeSent: (p: string) => `We sent a 6-digit code to ${p}.`,
  codeLabel: '6-digit code', verify: 'Verify',
  resendIn: (s: number) => `Send a new code in ${s}s`, resendNow: 'Send a new code', changeNumber: 'Change number',
  badPhone: 'Enter a valid South African cell number, like 082 123 4567.',
  badCode: 'That code isn’t right. Try again.',
  codeFailed: 'We couldn’t reach the server. Check your signal and try again.',
  demoCode: 'Demo mode: the code is 123456',
  // Dashboards and wallet
  signOut: 'Sign out', spentToday: 'Spent today', recent: 'Recent payments', noRecent: 'No payments yet',
  failedChip: 'Failed', loadingShop: 'Loading your shop…',
  phoneOnly: 'Showing payments saved on this phone. Reconnect to see all of them.',
  walletTitle: 'Wallet', walletEmpty: 'Your wallet is empty. Add money before you pay.',
  topUpDemo: 'Add R100 (demo)', topUpFailed: 'We couldn’t add money. Check your signal and try again.',
  noFunds: (b: number) => `Not enough money in your wallet (R${b.toFixed(2)}). Add money and try again.`,
  noFundsServer: 'Not enough money in your wallet.',
  badAmount: 'Enter a valid amount.', payTo: (s: string) => `to ${s}`,
  reasonReplay: 'This payment was already used.',
  reasonSignature: 'We couldn’t verify this payment.',
  reasonOfflineLimit: 'The offline payment limit has been reached.',
  // USSD
  ussdBtn: 'Pay with USSD', ussdTitle: 'Pay with USSD', ussdDial: 'Dial',
  ussdIntro: 'No data? Dial the code below. USSD works on any phone with a signal, even without internet.',
  ussdDemo: 'Demo only: this is a simulated USSD session.',
  ussdCancel: 'Cancel', ussdSend: 'Send', ussdOk: 'OK',
  ussdMenu: 'Pay2Spaza\n1. Pay a shop\n2. My offline allowance\n3. Last payments\n0. Exit',
  ussdAskShop: 'Enter the shop code (for example SPZ12345):',
  ussdAskAmount: (shop: string) => `Paying ${shop}\nEnter the amount in rand:`,
  ussdConfirm: (amount: string, shop: string) => `Pay ${amount} to ${shop}?\n1. Confirm\n2. Cancel`,
  ussdInvalid: 'Invalid choice.', ussdNeedShop: 'Enter a shop code.', ussdReply12: 'Reply 1 or 2.',
  ussdLast: 'Last payments', ussdCancelled: 'Payment cancelled.', ussdRunning: 'USSD running…',
};
export type Strings = typeof en;
