import { type Role } from '../types/user';

export type Permission =
  | 'dashboard:read'
  | 'product:create'
  | 'product:read'
  | 'product:update'
  | 'product:delete'
  | 'sale:create'
  | 'sale:read'
  | 'user:manage';

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  Admin: [
    'dashboard:read',
    'product:create',
    'product:read',
    'product:update',
    'product:delete',
    'sale:create',
    'sale:read',
    'user:manage',
  ],
  Manager: [
    'dashboard:read',
    'product:create',
    'product:read',
    'product:update',
    'product:delete',
    'sale:create',
    'sale:read',
  ],
  Employee: ['product:read', 'sale:create'],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
