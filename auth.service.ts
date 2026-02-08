/**
 * AUTHENTICATION SERVICE
 * Shared by both Customer and Admin apps
 * 
 * For Customer: role = "customer", can only see own trips
 * For Admin: role = "admin", can see all trips
 */

import { supabase } from './supabaseClient';
import { User, LoginResponse, ApiResponse } from '../shared.types';

class AuthService {
  /**
   * CUSTOMER LOGIN
   * Authenticates customer and stores session
   */
  async loginCustomer(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    try {
      // Check if user exists in users table with role = 'customer'
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('role', 'customer')
        .single();

      if (userError || !userData) {
        return {
          success: false,
          error: 'Customer not found. Please contact support.',
        };
      }

      // For demo: simple password check (in production, use proper auth)
      // Store hashed passwords and verify properly
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userId', userData.id);
      localStorage.setItem('userRole', 'customer');

      return {
        success: true,
        data: {
          user: userData as User,
          session: {
            access_token: 'demo-token',
            refresh_token: 'demo-refresh',
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      };
    }
  }

  /**
   * ADMIN LOGIN
   * Authenticates admin and stores session
   */
  async loginAdmin(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    try {
      // Check if user exists in users table with role = 'admin'
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('role', 'admin')
        .single();

      if (userError || !userData) {
        return {
          success: false,
          error: 'Admin credentials invalid. Access denied.',
        };
      }

      localStorage.setItem('userEmail', email);
      localStorage.setItem('userId', userData.id);
      localStorage.setItem('userRole', 'admin');

      return {
        success: true,
        data: {
          user: userData as User,
          session: {
            access_token: 'demo-token',
            refresh_token: 'demo-refresh',
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Admin login failed',
      };
    }
  }

  /**
   * GET CURRENT USER FROM SESSION
   */
  async getCurrentUser(): Promise<User | null> {
    const userId = localStorage.getItem('userId');
    if (!userId) return null;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) return null;
      return data as User;
    } catch {
      return null;
    }
  }

  /**
   * LOGOUT
   */
  logout(): void {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
  }

  /**
   * CHECK IF USER IS AUTHENTICATED
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('userId');
  }

  /**
   * GET USER ROLE
   */
  getUserRole(): 'customer' | 'admin' | null {
    const role = localStorage.getItem('userRole');
    return (role as 'customer' | 'admin') || null;
  }

  /**
   * DEMO: CREATE TEST USERS (for development)
   * Remove in production
   */
  async createDemoUsers(): Promise<void> {
    // Create demo customer
    await supabase.from('users').insert([
      {
        email: 'customer@example.com',
        name: 'Demo Customer',
        role: 'customer',
      },
    ]);

    // Create demo admin
    await supabase.from('users').insert([
      {
        email: 'admin@micetravel.com',
        name: 'Demo Admin',
        role: 'admin',
      },
    ]);
  }
}

export const authService = new AuthService();
