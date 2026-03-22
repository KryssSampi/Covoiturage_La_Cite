import { staticDb } from '@/tests/db/StaticDb';
import type { UserModel } from '@/core/models/UserModel';

/**
 * UserService — Service d'accès aux données utilisateur
 */
export const UserService = {
  async getAll(): Promise<UserModel[]> {
    return staticDb.getAll('users');
  },

  async getById(id: string): Promise<UserModel | null> {
    return staticDb.getById('users', id);
  },

  async getByEmail(email: string): Promise<UserModel | null> {
    const users = await staticDb.getAll('users');
    return users.find((u) => u.email === email) ?? null;
  },

  async getDrivers(): Promise<UserModel[]> {
    const users = await staticDb.getAll('users');
    return users.filter((u) => u.role === 'driver' || u.canBeDriver);
  },

  /** Charge plusieurs utilisateurs par leurs ids */
  async getManyByIds(ids: string[]): Promise<UserModel[]> {
    const users = await staticDb.getAll('users');
    return users.filter((u) => ids.includes(u.id));
  },

  /** Nom complet d'un utilisateur */
  getFullName(user: UserModel): string {
    return `${user.firstName} ${user.lastName}`;
  },

  /** Génère un identifiant unique */
  generateId(): string {
    const year = new Date().getFullYear();
    const rand = Math.floor(10000 + Math.random() * 90000);
    return `USR-${year}-${rand}`;
  },
};
