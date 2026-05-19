# Security Specification: Shinerva TTS

## 1. Data Invariants
- Users can only read and write their own profile document (`/users/{userId}`).
- Users can only read and write their own history entries (`/users/{userId}/history/{historyId}`).
- `createdAt` and `ownerId` must be immutable.
- `monthly_chars` and `tier` can only be modified by admins (simulated via `exists(/databases/$(database)/documents/admins/$(request.auth.uid))`).
- Global config `/config/voices` is readable by authenticated users and writable only by admins.

## 2. Dirty Dozen Payloads (Vulnerabilities to Prevent)
1.  **Identity Theft**: User A tries to read User B's profile. (`get /users/userB`)
2.  **Credit Injection**: User A tries to update their own `monthly_chars` to 1,000,000.
3.  **Tier Escalation**: User A tries to change their `tier` to 'ENTERPRISE'.
4.  **Shadow Update**: Adding `isAdmin: true` to a profile update.
5.  **History Forgery**: User A tries to write a history entry into User B's collection.
6.  **Config Vandalism**: Normal user tries to modify `/config/voices`.
7.  **ID Poisoning**: Using a 1MB string as a userId.
8.  **Type Mismatch**: Writing a string into the `monthly_chars` (number) field.
9.  **Orphaned History**: Creating a history entry for a non-existent user.
10. **Timestamp Hijacking**: Manually setting a future `createdAt` date.
11. **Email Spoofing**: Trying to access admin data with an unverified email matching the admin email.
12. **Blanket Read Scam**: Trying to list ALL users.

## 3. Test Runner
(Omitted for brevity in this step, but conceptually included in the rules generation)
