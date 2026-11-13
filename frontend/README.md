# Pay2Spaza frontend (React Native / Expo)

Screens built from the Figma frames: Welcome, Scan QR, Confirm payment, Successful payment, Saved offline, Shop owner home.

## Run
    npm install
    npx expo install --fix
    npx expo start        # scan the QR code with Expo Go

## Mock vs real backend
`src/api/index.ts` has `USE_MOCK = true` (fake shops SPZ12345 and SPZ67890). Set it to `false` and set `BASE_URL` once the backend routes exist.

## Demo tools (dev builds only)
The round "···" button at the bottom right lets you pretend there is no signal and jump to the Welcome, Scan and Shop owner screens.

## Where to change the look
`src/theme.ts` (colours), `src/fonts.ts` (fonts), `src/i18n/strings.ts` (all wording).

## Phone check (SMS code)
After Welcome the app asks for a South African cell number, texts a 6-digit code, and asks for it (`PhoneScreen.tsx`, `OtpScreen.tsx`).
The verified number is kept in secure storage, so it only happens once per phone. `REQUIRE_OTP` in `src/config.ts` turns it off.
- Uses the backend's `requestOtp` and `confirmOtp` controllers. The route paths are ASSUMED in `src/api/index.ts` (`OTP_PATHS`): confirm them with the backend owner.
- With `USE_MOCK = true` a fake server issues the code, and the code is shown on screen in dev builds. The real backend only sends it back outside production.
- Demo tools ("···" button): jump to the phone screen, or forget the verified number to run it again.
