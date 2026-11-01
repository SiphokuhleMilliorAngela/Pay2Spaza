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
