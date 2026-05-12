# Security Spec for Shinerva AI

## Data Invariants
1.  **Identity:** Users can only read and write their own profile data.
2.  **Integrity:** Users cannot modify their own `tier`, `signup_bonus_chars`, `monthly_chars`, or `earned_chars`. These are governed by the system or admins.
3.  **Relational Sync:** History items can only be created by the owner of the parent user document.
4.  **Admin:** Admins (identified by `admins` collection) have full access to configuration and can manage user statuses (like `social_bonus_status`).
5.  **OTP:** OTPs are writeable only by the system (for now mocked as public or restricted by server-side logic, but we'll secure the path).

## The Dirty Dozen Payloads

| ID | Collection | Operation | Payload | Intent | Expected |
|:---|:---|:---|:---|:---|:---|
| D1 | /users/{u1} | write | `{ tier: 'ENTERPRISE' }` | Self-upgrade to paid tier | DENY |
| D2 | /users/{u1} | write | `{ signup_bonus_chars: 999999 }` | Giving self unlimited credits | DENY |
| D3 | /users/{u2} | read | N/A | Reading another user's profile | DENY |
| D4 | /users/{u1}/history/{h1} | create | `{ userId: 'u2' }` | Creating history record for another user | DENY |
| D5 | /config/voice | write | `{ tiers: { Standard: 0 } }` | Setting cost to zero for everyone | DENY |
| D6 | /users/{u1} | update | `{ social_bonus_status: 'approved' }` | Self-approving social bonus | DENY |
| D7 | /users/{u1} | create | `{ referral_code: 'EVIL' }` | Setting custom ID without validation | Valid ID check should fail if too long or bad chars |
| D8 | /users/{u1} | update | `{ name: 'A'.repeat(2000) }` | Resource exhaustion with huge string | DENY |
| D9 | /users/{u1}/history/{h1} | create | `{ credits_used: -100 }` | Negative cost generation | DENY |
| D10 | /otps/{p1} | read | N/A | Reading OTP of another phone | DENY |
| D11 | /users/{u1} | update | `{ used_chars: 0 }` | Resetting usage count | DENY |
| D12 | /users/{u1} | update | `{ email: 'admin@shinerva.id' }` | Email spoofing in profile | DENY |

## Test Runner
Wait for implementation of `firestore.rules`.
