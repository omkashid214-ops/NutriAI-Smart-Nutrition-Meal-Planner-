# NutriAI Security Specification (Phase 0: Payload-First Security TDD)

## 1. Data Invariants
1. **Strict Owner Isolation (PII Protection)**: A user document `/users/{userId}` contains PII (`email`, biometric measurements) and MUST ONLY be read or written by the authenticated user where `request.auth.uid == userId` and `request.auth.token.email_verified == true`.
2. **Master Gate Relational Sync**: A `MealLogEntry` at `/users/{userId}/mealLogs/{logId}` cannot be created or updated unless the parent `/users/{userId}` document exists and belongs to `request.auth.uid`.
3. **Zero Shadow Fields**: Both `UserProfile` and `MealLogEntry` enforce strict key allowlists (`hasAll` + `hasOnly` on create, `affectedKeys().hasOnly(...)` on update).
4. **Immutable Ownership & Timestamps**: `uid` / `userId` and `createdAt` cannot be modified after creation. `createdAt == request.time` on create; `updatedAt == request.time` on create and update.
5. **Path Variable Hardening & Volumetric Bounds**: All document IDs (`userId`, `logId`) match `^[a-zA-Z0-9_\-]+$` with max length 128. Every string has an explicit `.size()` ceiling and numeric biometrics/macros stay within physiological bounds.

## 2. The "Dirty Dozen" Adversarial Payloads (Must All Return PERMISSION_DENIED)
1. **Cross-User PII Read**: Authenticated User B attempts `get('/users/userA')`.
2. **Unverified Email Write**: Authenticated user with `email_verified: false` attempts to create `/users/{uid}`.
3. **Identity Spoofing on Profile Create**: User A attempts to write `/users/userA` with `uid: "userB"`.
4. **Shadow Field Injection on Profile**: User A creates `/users/userA` adding `"isAdmin": true` or `"role": "superadmin"`.
5. **Biometric Overflow / Value Poisoning**: User A updates `fullName` to a 500-character string or `age` to `-5` or `"twenty"`.
6. **Client-Forged Timestamp**: User A creates `/users/userA` with a backdated `createdAt` instead of `request.time`.
7. **Immutable Field Tampering**: User A updates `/users/userA` attempting to alter `createdAt` or `uid`.
8. **Orphaned Meal Log (Master Gate Bypass)**: User A attempts to create `/users/userA/mealLogs/log1` before `/users/userA` exists.
9. **Cross-User Meal Log Injection**: User B attempts to create `/users/userA/mealLogs/log1` with `userId: "userB"`.
10. **Path ID Poisoning**: User A attempts to create `/users/userA/mealLogs/bad$id!with/junk` or a 200-char ID.
11. **Invalid Enum / Macro Poisoning**: User A creates a meal log with `mealSlot: "midnight_feast"` or `calories: 999999`.
12. **Blanket Collection Scraping**: Authenticated User B attempts `list('/users')` or `list('/users/userA/mealLogs')`.
