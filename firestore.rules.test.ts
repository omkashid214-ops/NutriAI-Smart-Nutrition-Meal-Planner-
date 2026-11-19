/**
 * NutriAI Firestore Security Rules Test Specification (Dirty Dozen Suite)
 * Run with Firebase Emulator Suite & @firebase/rules-unit-testing.
 */

export interface SecurityTestCase {
  id: number;
  name: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  path: string;
  auth: { uid: string; email_verified: boolean } | null;
  payload?: Record<string, unknown>;
  expected: 'PERMISSION_DENIED' | 'ALLOW';
}

export const dirtyDozenSecurityCases: SecurityTestCase[] = [
  {
    id: 1,
    name: 'Cross-User PII Read',
    operation: 'get',
    path: '/users/userA',
    auth: { uid: 'userB', email_verified: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Unverified Email Profile Create',
    operation: 'create',
    path: '/users/userA',
    auth: { uid: 'userA', email_verified: false },
    payload: { uid: 'userA', fullName: 'Aarav', email: 'a@example.com' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Identity Spoofing on Profile Create',
    operation: 'create',
    path: '/users/userA',
    auth: { uid: 'userA', email_verified: true },
    payload: { uid: 'userB', fullName: 'Spoofed' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Shadow Field Injection on Profile',
    operation: 'create',
    path: '/users/userA',
    auth: { uid: 'userA', email_verified: true },
    payload: { uid: 'userA', fullName: 'Aarav', isAdmin: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Biometric Overflow / Value Poisoning',
    operation: 'update',
    path: '/users/userA',
    auth: { uid: 'userA', email_verified: true },
    payload: { age: -10, fullName: 'A'.repeat(200) },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Client-Forged Timestamp',
    operation: 'create',
    path: '/users/userA',
    auth: { uid: 'userA', email_verified: true },
    payload: { uid: 'userA', createdAt: '2020-01-01T00:00:00Z' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Immutable Field Tampering on Update',
    operation: 'update',
    path: '/users/userA',
    auth: { uid: 'userA', email_verified: true },
    payload: { uid: 'userC', createdAt: '2020-01-01T00:00:00Z' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Orphaned Meal Log (Master Gate Bypass)',
    operation: 'create',
    path: '/users/noProfileUser/mealLogs/log1',
    auth: { uid: 'noProfileUser', email_verified: true },
    payload: { id: 'log1', userId: 'noProfileUser', mealSlot: 'breakfast' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Cross-User Meal Log Injection',
    operation: 'create',
    path: '/users/userA/mealLogs/log1',
    auth: { uid: 'userB', email_verified: true },
    payload: { id: 'log1', userId: 'userB', mealSlot: 'lunch' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Path ID Poisoning',
    operation: 'create',
    path: '/users/userA/mealLogs/invalid$id!chars',
    auth: { uid: 'userA', email_verified: true },
    payload: { id: 'invalid$id!chars', userId: 'userA' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Invalid Enum / Macro Poisoning',
    operation: 'create',
    path: '/users/userA/mealLogs/log2',
    auth: { uid: 'userA', email_verified: true },
    payload: { id: 'log2', userId: 'userA', mealSlot: 'midnight', calories: 99999 },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Blanket Collection Scraping',
    operation: 'list',
    path: '/users',
    auth: { uid: 'userB', email_verified: true },
    expected: 'PERMISSION_DENIED',
  },
];
