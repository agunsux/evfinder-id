# Sign‑Up, Email Verification & Password Reset Fix Plan

## Goal Description

The user reports that:
- Google login works.
- Sign‑up works but **no verification email** is received.
- "Forgot password" and email verification links are **not sent**.

We need to ensure that the email flow works reliably using Firebase Auth (client‑side) and the custom Hostinger SMTP backend.

## User Review Required

> [!IMPORTANT]
> The plan includes **breaking changes** to `src/lib/authService.js` (signup & reset logic) and a small tweak to the backend URL handling. Please confirm:
> - You want to always send a Firebase verification email **before** trying the custom backend.
> - You are okay with using `window.location.origin` as a fallback for `VITE_BACKEND_URL`.
> - SMTP credentials are correctly set in your hosting environment (Hostinger). If not, the fallback to Firebase will be used.

## Open Questions

> [!WARNING]
> - Do you want to keep the custom backend verification endpoint (`/api/auth/resend-verification`) **as a fallback**, or should we deprecate it entirely?
> - Are there any specific email template customizations required for the Firebase‑sent emails?

## Proposed Changes

---
### Component: Frontend Auth Service (`src/lib/authService.js`)

#### [MODIFY] `authService.js`
- Refactor `signup` to:
  1. Create the user.
  2. **Immediately** call `sendEmailVerification(userCredential.user)` (Firebase) and await it.
  3. After the Firebase email is sent, **optionally** call the custom backend `resendVerificationEmail(email)` for a second copy (fallback).
- Simplify error handling: surface Firebase errors directly, log backend failures only.
- Update `resetPassword` to try the backend first, then fall back to Firebase's `sendPasswordResetEmail` if the backend call fails.
- Improve `resendVerificationEmail` base URL resolution:
  ```js
  const base = import.meta.env.VITE_BACKEND_URL || (typeof window !== 'undefined' ? window.location.origin : '')
  ```
- Add explicit TypeScript‑style JSDoc comments for clarity.

---
### Component: Server API (`server.js`)

#### [MODIFY] `server.js`
- Ensure CORS headers allow requests from the Vite dev origin.
- Add a tiny validation to return **400** if `email` is missing (already present).
- No functional change required, but we will add a console.log confirming the email link generation succeeded.

---
### Component: Environment

#### [MODIFY] `.env` (or Vite env files)
- Recommend adding `VITE_BACKEND_URL` set to the deployed backend URL (e.g., `https://api.shinerva.id`).
- Ensure `SMTP_USER`, `SMTP_PASS`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_FROM_NAME`, `SMTP_FROM_EMAIL` are defined on the Hostinger server.

## Verification Plan

### Automated Tests
- Run the Vite dev server locally.
- Execute the signup flow with a test email and verify that **both** a Firebase verification email and, if configured, a Hostinger email are received.
- Trigger `resetPassword` and confirm receipt of the reset email.

### Manual Verification
- Deploy the changes to a staging Vercel preview.
- Perform sign‑up, email verification, and password reset from a real email address.
- Check the server logs for successful link generation.

---
