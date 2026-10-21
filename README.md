# Pay2Spaza 🇿🇦

> **Inclusive payments for Mzansi spaza shops, even when connectivity is unreliable.**

Pay2Spaza is an **offline-first, open payment solution** designed for South African spaza shops and their customers.

The solution combines **camera-based QR payments, USSD, SMS, and offline transaction recording** with **Open Payments and Interledger** to create a payment experience that remains usable in township and rural environments where mobile-data connectivity may be limited or unreliable.

## Our Goal

> **Make digital payments accessible, secure, and practical for both spaza shop owners and customers, regardless of the phone they use or the quality of their internet connection.**

---

## 💡 The Problem

Spaza shops play an important role in South African communities, but many merchants and customers still depend heavily on cash.

Digital-payment adoption can be difficult because of:

- Unreliable mobile-data connectivity
- High data costs
- Limited access to smartphones
- Dependence on cash
- Payment transaction fees
- Delayed payment confirmation
- Fraud and fake proof-of-payment scams
- Merchant impersonation
- SIM-swap and account-takeover risks
- Fragmented payment experiences

Most digital-payment solutions assume that the customer and merchant are continuously connected to the internet.

**Pay2Spaza is designed around the opposite assumption: connectivity may disappear at any time.**

---

## 🚀 Our Solution

Pay2Spaza provides multiple ways for customers to initiate payments.

### 📷 Camera and QR Payments

Customers with smartphones can scan a verified Pay2Spaza merchant QR code using their phone camera.

The customer can:

1. Scan the merchant QR code.
2. View the verified shop name.
3. Enter or confirm the amount.
4. Approve the payment.
5. Receive a digital receipt.

```text
┌──────────────────────────┐
│        Pay2Spaza         │
│                          │
│    ✓ VERIFIED MERCHANT   │
│                          │
│        [ QR CODE ]       │
│                          │
│ Merchant: SPZ12345       │
│                          │
│      Scan to Pay         │
└──────────────────────────┘
```

### 📱 USSD Payments

Customers without mobile data, including feature-phone users, can initiate payments through USSD.

```text
*120*321#

1. Pay Spaza
2. Check Payment
3. Transaction History
4. Help
```

A customer could enter:

```text
Merchant Code: SPZ12345
Amount: R50.00
```

Pay2Spaza displays the verified merchant name before the customer confirms the transaction.

### 💬 SMS Notifications

SMS can support:

- Payment notifications
- Transaction receipts
- Payment-status updates
- Low-connectivity communication

```text
Pay2Spaza

Payment Confirmed ✅

Merchant: Thuba's Spaza
Amount: R50.00
Transaction: P2S-82931

Thank you for using Pay2Spaza.
```

> **Security note:** SMS is mainly used for notifications and confirmations. It is not treated as the primary secure payment-authorisation mechanism.

---

## 🌐 Offline-First Design

Pay2Spaza distinguishes between three connectivity states:

| State | Connectivity | Example | Pay2Spaza behaviour |
|---|---|---|---|
| 🟢 Connected | Internet available | Wi-Fi or mobile data | Payment can be authorised and settled |
| 🟠 Low connectivity | No mobile data | USSD or SMS available | Payment can be processed through cellular signalling |
| ⚫ Fully offline | No internet or cellular network | No available network | Transaction is securely recorded locally and synchronised later |

### ⚠️ Offline Does Not Mean Settled

A key Pay2Spaza principle is:

> **Never tell a merchant that money has been received when settlement has not actually happened.**

When both devices are completely offline, Pay2Spaza creates a:

```text
PENDING — NOT SETTLED
```

Once connectivity returns, the transaction follows one of these status paths:

```text
PENDING → SYNCING → VALIDATING → CONFIRMED
```

or:

```text
PENDING → SYNCING → VALIDATING → REJECTED
```

This helps protect merchants from fake payment confirmations.

---

## 🏗️ How Pay2Spaza Works

```text
                 CUSTOMER
                     │
        ┌────────────┼────────────┐
        │            │            │
      Camera        USSD         SMS
       / QR
        │            │            │
        └────────────┼────────────┘
                     │
                     ▼
              Pay2Spaza Platform
                     │
          ┌──────────┴──────────┐
          │                     │
     Fraud & Security      Transaction
        Controls              Engine
          │                     │
          └──────────┬──────────┘
                     │
                     ▼
              Open Payments
                     │
                     ▼
                Interledger
                     │
                     ▼
          Wallet / Payment Provider
                     │
                     ▼
                 SPAZA SHOP
```

---

## 📷 Camera-Based Payment Flow

Each verified merchant receives a Pay2Spaza QR code.

A basic QR code can contain or reference:

```json
{
  "merchantId": "SPZ12345",
  "walletAddress": "merchant-wallet-reference",
  "currency": "ZAR"
}
```

A dynamic QR code could additionally contain:

```json
{
  "merchantId": "SPZ12345",
  "amount": 50.00,
  "currency": "ZAR",
  "transactionId": "P2S-82931",
  "nonce": "unique-value",
  "expiresAt": "timestamp"
}
```

> Sensitive information should not be stored directly inside the QR code.

---

## ✅ Merchant Verification

One of Pay2Spaza's most important features is ensuring that customers know who they are paying.

Before confirming a payment, the customer sees:

```text
Pay2Spaza

✓ VERIFIED MERCHANT

Thuba's Spaza
Merchant ID: SPZ12345

Amount: R50.00

[ Confirm Payment ]
```

This helps reduce:

- Fake merchant accounts
- QR-code replacement scams
- Merchant impersonation
- Payments sent to incorrect accounts

---

## 🛡️ Fraud Prevention

Pay2Spaza uses multiple layers of fraud protection.

### Merchant Controls

- Merchant identity verification
- Mobile-number verification
- Unique merchant ID
- Device binding
- Verified merchant profile
- Controlled payout-account changes
- Duplicate merchant detection

### Transaction Controls

Every transaction can contain:

- Transaction ID
- Merchant ID
- Customer ID
- Device ID
- Timestamp
- Amount
- Currency
- Nonce
- Digital signature
- Transaction status

### 🔁 Replay Protection

Every transaction receives a unique combination:

```text
Transaction ID + Nonce
```

If someone attempts to submit the same transaction again:

```text
Transaction Received
        ↓
Check Transaction ID
        ↓
Check Nonce
        ↓
Duplicate Detected
        ↓
REJECT TRANSACTION
```

### 💰 Transaction Limits

Offline transactions should have stricter limits.

Prototype example:

```text
Maximum offline transaction: R200
Maximum offline transactions: 5 before synchronisation
```

> These are prototype values only. Production limits would require proper risk modelling, testing, and approval.

---

## 📴 Offline Transaction Flow

When two smartphones have no connectivity:

```text
Customer
   │
   │ Scan Merchant QR
   ▼
Merchant Device
   │
   ▼
Create Payment Request
   │
   ▼
Customer Signs Transaction
   │
   ▼
Merchant Confirms Receipt
   │
   ▼
Encrypted Local Storage
   │
   ▼
PENDING — NOT SETTLED
```

When connectivity returns:

```text
Connectivity Restored
        │
        ▼
Synchronise Transaction
        │
        ▼
Verify Digital Signature
        │
        ▼
Check Nonce
        │
        ▼
Check Duplicate Transaction
        │
        ▼
Apply Fraud Rules
        │
        ▼
Submit Payment
        │
        ▼
CONFIRMED or REJECTED
```

---

## 🔗 Open Payments

Pay2Spaza uses **Open Payments** as the standardised API layer between the Pay2Spaza platform and participating wallet or account providers.

Open Payments can support concepts such as:

- Wallet addresses
- Payment authorisation
- Incoming payments
- Quotes
- Outgoing payments
- Permission-based payment flows

**Official documentation:** [openpayments.dev](https://openpayments.dev/)

---

## 🌍 Interledger and Rafiki

Interledger provides an interoperability layer that can enable value to move between different payment systems or wallets.

For the hackathon, Pay2Spaza can demonstrate this using an Interledger and Rafiki sandbox environment.

```text
Customer Wallet
      │
      ▼
Open Payments
      │
      ▼
Interledger
      │
      ▼
Rafiki
      │
      ▼
Merchant Wallet
```

**Official resources:**

- [Interledger](https://interledger.org/)
- [Rafiki](https://rafiki.dev/)

---

## 🛠️ Technology Stack

### Mobile Application

- React Native
- Expo Development Build
- TypeScript or JavaScript
- SQLite

Used for:

- Camera scanning
- Merchant QR generation
- Offline transaction storage
- Transaction history
- Synchronisation
- Customer receipts

### Backend

- Node.js
- Express.js

Responsibilities:

- Authentication
- Merchant management
- Transaction orchestration
- Fraud rules
- Synchronisation
- Open Payments integration
- Reconciliation

### Database

#### Local Database

- SQLite

Used for:

- Offline transactions
- Pending synchronisation
- Local transaction history

#### Server Database

- PostgreSQL

Used for:

- Merchant profiles
- Customer profiles
- Transactions
- Payment statuses
- Fraud events
- Audit logs
- Reconciliation

### ☁️ Cloud

Microsoft Azure can host the Pay2Spaza platform.

Potential services:

- Azure App Service
- Azure Functions
- Azure Database for PostgreSQL
- Azure Key Vault
- Azure Monitor

### 📡 USSD and SMS Integration

A potential gateway is **Africa's Talking** or another supported South African SMS and USSD provider.

```text
Feature Phone
      │
      ▼
Mobile Network
      │
      ▼
USSD / SMS Gateway
      │
      ▼
Pay2Spaza API
      │
      ▼
Payment Provider
```

---

## Hackathon MVP Scope

The hackathon MVP focuses on features that can realistically be demonstrated.

### ✅Build Now

#### Merchant

- Merchant registration
- Merchant verification
- Merchant QR generation
- Merchant transaction history
- Offline transaction queue

#### Customer

- Scan merchant QR code
- Verify merchant name
- Enter payment amount
- Confirm payment
- View transaction status
- Receive digital receipt

#### Payments

- Open Payments sandbox integration
- Interledger and Rafiki test integration
- Simulated wallet balances
- Connected QR payment
- Offline transaction recording
- Transaction synchronisation

#### Low Connectivity

- USSD payment simulation
- SMS payment notifications

#### Security

- Device binding
- Transaction IDs
- Nonces
- Digital signatures
- Replay protection
- Transaction limits
- Rules-based fraud detection

### Optional Hackathon Feature: Bluetooth Low Energy

Two smartphones could exchange a signed payment intent using Bluetooth Low Energy.

```text
Customer Phone
      │
      │ Bluetooth
      ▼
Merchant Phone
      │
      ▼
Signed Transaction
      │
      ▼
Local Storage
      │
      ▼
PENDING
```

> BLE should only be attempted once the main QR-payment journey is working.

---

## Future Features

The longer-term Pay2Spaza vision could include:

- NFC payments
- PayShap integration
- Request-to-Pay
- Multiple wallet providers
- Interoperable national QR
- Advanced merchant verification
- Hardware-backed device keys
- Fraud graph analysis
- AI-assisted fraud investigation
- Merchant analytics
- Cash-in and cash-out networks
- Multi-bank integration
- Cross-border Interledger payments

---

## What We Are Not Building Yet

To keep the MVP realistic, the following are intentionally excluded:

- ❌ Guaranteed real-money offline settlement
- ❌ NFC payment-card emulation
- ❌ AI-controlled payment approval
- ❌ Credit or lending
- ❌ Production banking integration
- ❌ Cross-border settlement
- ❌ Production biometric identity verification

---

## Why Not AI First?

Azure OpenAI was considered for fraud detection. For the MVP, Pay2Spaza uses rules-based fraud detection.

```javascript
if (transaction.nonceAlreadyUsed) {
  rejectTransaction("Possible replay attack");
}

if (transaction.amount > offlineLimit) {
  rejectTransaction("Offline transaction limit exceeded");
}

if (merchant.deviceRecentlyChanged) {
  flagTransaction("Merchant device changed");
}
```

This approach is:

- Easier to explain
- Easier to test
- More predictable
- Better suited to limited hackathon data

AI and machine learning can later support fraud investigators once Pay2Spaza has sufficient transaction data.

---

## Example Transaction Object

```json
{
  "transactionId": "P2S-82931",
  "merchantId": "SPZ12345",
  "customerId": "CUS45678",
  "amount": 50.00,
  "currency": "ZAR",
  "channel": "QR",
  "nonce": "8f92a1c7",
  "status": "PENDING",
  "offline": true,
  "createdAt": "2026-10-19T14:30:00Z"
}
```

---

## Transaction Statuses

| Status | Meaning |
|---|---|
| `LOCAL_PENDING` | Transaction exists only on the device |
| `SUBMITTED` | Transaction has reached the Pay2Spaza backend |
| `CONFIRMED` | Payment provider confirms successful payment |
| `REJECTED` | Payment failed validation or authorisation |
| `EXPIRED` | Offline payment request was not synchronised within the permitted period |

---

## Suggested Repository Structure

```text
pay2spaza/
│
├── mobile/
│   ├── src/
│   │   ├── screens/
│   │   ├── components/
│   │   ├── services/
│   │   ├── database/
│   │   ├── security/
│   │   └── sync/
│   └── app.json
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── fraud/
│   │   ├── payments/
│   │   ├── open-payments/
│   │   └── reconciliation/
│   └── server.js
│
├── database/
│   ├── migrations/
│   └── schema.sql
│
├── docs/
│   ├── architecture/
│   ├── api/
│   └── user-journeys/
│
├── tests/
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## Hackathon Demo Journey

### 1. Register the Spaza Shop

```text
Merchant Registration
        ↓
Identity Verification
        ↓
Device Binding
        ↓
Merchant Verified
        ↓
QR Generated
```

### 2. Customer Pays

```text
Open Camera
     ↓
Scan QR
     ↓
Verify Merchant
     ↓
Enter R50
     ↓
Confirm
     ↓
Open Payments
     ↓
Interledger
     ↓
CONFIRMED
```

### 3. Network Goes Down

```text
No Connectivity
      ↓
Customer Scans QR
      ↓
Transaction Signed
      ↓
Stored Locally
      ↓
PENDING
```

### 4. Connectivity Returns

```text
Network Restored
      ↓
Automatic Sync
      ↓
Fraud Checks
      ↓
Replay Check
      ↓
Payment Submitted
      ↓
CONFIRMED / REJECTED
```

### 5. Feature-Phone Customer

```text
Dial USSD
    ↓
Enter Merchant Code
    ↓
Enter Amount
    ↓
Verify Merchant
    ↓
Confirm
    ↓
Receive SMS Receipt
```

---

## Our Vision

Pay2Spaza is not trying to replace South Africa's banking infrastructure.

We want to create an inclusive payment experience that connects people to existing and emerging open-payment infrastructure.

> **One verified spaza payment identity. Multiple ways to pay. Built for the realities of Mzansi.**

Whether a customer has:

- A smartphone
- A feature phone
- Mobile data
- Only cellular signalling
- Temporarily no connectivity

Pay2Spaza aims to provide the safest available payment experience for that situation.

---

## Why Pay2Spaza?

- **📷 Camera-first payments:** Simple QR payments using devices customers already own.
- **📱 Financial inclusion:** Support for smartphone and feature-phone users.
- **📴 Offline resilience:** Transactions can be securely recorded when connectivity disappears.
- **🔗 Open Payments:** Open standards can connect Pay2Spaza to participating payment providers.
- **🌍 Interledger:** Provides an interoperability story across different wallets and payment systems.
- **🛡️ Merchant trust:** Verified merchant identities help customers know exactly who they are paying.
- **🇿🇦 Built for Mzansi:** Designed around the realities of South African township and rural communities.

---

## 👥 Team

- **Project:** Pay2Spaza
- **Challenge:** Open Payments Hackathon
- **Focus:** Financial Inclusion • Offline-First Payments • Open Payments • Interledger • Spaza Economy
- **Market:** South Africa 🇿🇦

---

## References

- [Open Payments](https://openpayments.dev/)
- [Interledger Protocol](https://interledger.org/)
- [Rafiki](https://rafiki.dev/)
- South African Reserve Bank: Payments Ecosystem Modernisation
- FinMark Trust: Township and informal-economy digital-payment research

---

## ⚠️ Disclaimer

Pay2Spaza is currently a hackathon prototype.

The MVP demonstrates payment initiation, offline transaction recording, synchronisation, fraud controls, and Open Payments and Interledger concepts.

It should not be interpreted as a production-ready banking, settlement, or offline stored-value system.

Real-money deployment would require appropriate regulated payment partners, security testing, compliance processes, consumer-protection controls, and integration with authorised payment infrastructure.

---

<div align="center">

## Pay2Spaza 🇿🇦

**One verified spaza payment identity. Multiple ways to pay.**  
**Built for the realities of Mzansi.**

</div>
