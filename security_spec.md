# Security Specification: Shinerva AI Voice SaaS

## 1. Data Invariants
- **User Integrity:** A user (identified by `request.auth.uid`) can ONLY read, create, or update a document in `users/{uid}` IF `request.auth.uid == uid`.
- **Generation Isolation:** A user can ONLY create, read, or list documents in `users/{uid}/tts_generations/{genId}` IF `request.auth.uid == uid`.
- **Atomic Credit Updates:** Credit balance (`creditBalance`) MUST be updated via a cloud function or atomic transaction within the `creditTransactions` collection, NOT directly via `update` on the `users` document.
- **Role Isolation:** PII and role-based data must be kept in separate subcollections or fields which only admins can read. NO client-side read allowed for these fields.

## 2. "Dirty Dozen" Payloads
1. **ID Injection:** Attempting to `create` at `/users/malicious_uid` while `request.auth.uid` is `legit_uid`.
2. **Quota Tampering:** `update` on `users/{legit_uid}` setting `creditBalance` to `999999`.
3. **Ghost Collection Write:** `write` to `/users/{legit_uid}/admin_settings/config`.
4. **Unauthenticated Access:** Request `list` on `/users/{legit_uid}/tts_generations` where `auth` is null.
5. **Cross-User Access:** Request `get` on `/users/{other_uid}/tts_generations/{genId}`.
6. **Immutable Field Manipulation:** `update` on `users/{legit_uid}` changing `createdAt`.
7. **Schema Poisoning:** `create` at `tts_generations` with `text` as a 10MB string.
8. **Shadow Field Injection:** `create` at `/users/{legit_uid}` with `isAdmin: true` added.
9. **Role Escalation:** `update` on `users/{legit_uid}` changing `plan` to `ENTERPRISE`.
10. **Timestamp Spoofing:** `create` at `tts_generations` with `createdAt` = 1 year ago.
11. **System Field Injection:** `update` at `tts_generations` with system_generated_tip field injected.
12. **Malformed ID:** `create` at `/users/!!!_MALFORMED_!!!`.

## 3. The Test Runner
A `firestore.rules.test.ts` file should be populated with the above 12 cases.
