import type { UserModel } from '@/core/models/UserModel';
import { persistenceManager } from '@/tests/PersistenceManager';

export function normalizeInstitutionalEmail(email?: string): string {
  return email?.trim().toLowerCase() ?? '';
}

export function validateInstitutionalEmail(email: string): boolean {
  return email.endsWith('@collegelacite.ca') || email.endsWith('@la-citec.ca');
}

export function findSigninUser(email: string): UserModel | null {
  const users = persistenceManager.readAll<UserModel>('users');
  return users.find((user) => user.email.toLowerCase() === email) ?? null;
}
