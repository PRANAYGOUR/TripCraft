import { AdminUser } from '../types/admin';
import { adminUsers } from '../data/mockData';

/**
 * Simple authentication utilities for admin users
 * In production, this would use proper JWT tokens and secure authentication
 */

const AUTH_STORAGE_KEY = 'admin_auth_token';
const USER_STORAGE_KEY = 'admin_user';

export function login(email: string, password: string): AdminUser | null {
  const user = adminUsers.find(
    u => u.email === email && u.password === password && u.role === 'admin'
  );
  
  if (user) {
    // Store auth info in localStorage (in production, use secure tokens)
    localStorage.setItem(AUTH_STORAGE_KEY, 'authenticated');
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }));
    return user;
  }
  
  return null;
}

export function logout(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
}

export function isAuthenticated(): boolean {
  return localStorage.getItem(AUTH_STORAGE_KEY) === 'authenticated';
}

export function getCurrentUser(): AdminUser | null {
  const userStr = localStorage.getItem(USER_STORAGE_KEY);
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
}
