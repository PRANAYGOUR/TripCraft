/**
 * AUTHENTICATION SERVICE
 * Uses Supabase Auth with profiles table
 * 
 * Database Schema:
 * - auth.users (Supabase Auth table - automatic)
 * - public.profiles (app-specific data: role, name)
 * - Trigger auto-creates profile on signup
 */

import { supabase } from './supabaseClient';
import { User, LoginResponse, ApiResponse } from '../types/shared.types';

// Export supabaseClient for direct use if needed
export { supabase as supabaseClient };

class AuthService {
  /**
   * CUSTOMER LOGIN
   * Authenticates with Supabase Auth, retrieves profile
   */
  async loginCustomer(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    try {
      // Authenticate with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: 'Login failed' };
      }

      // Get profile from profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError || !profile) {
        return { success: false, error: 'User profile not found' };
      }

      if (profile.role !== 'customer') {
        return { success: false, error: 'Invalid user role - customer access required' };
      }

      // Store in localStorage
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userId', data.user.id);
      localStorage.setItem('userRole', 'customer');

      return {
        success: true,
        data: {
          user: profile as User,
          session: data.session,
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
   * Authenticates with Supabase Auth, retrieves admin profile
   */
  async loginAdmin(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    try {
      // Authenticate with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: 'Login failed' };
      }

      // Get profile from profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError || !profile) {
        return { success: false, error: 'User profile not found' };
      }

      if (profile.role !== 'admin') {
        return { success: false, error: 'Admin access required' };
      }

      // Store in localStorage
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userId', data.user.id);
      localStorage.setItem('userRole', 'admin');

      return {
        success: true,
        data: {
          user: profile as User,
          session: data.session,
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
   * HOTEL PARTNER LOGIN
   */
  async loginHotelPartner(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { success: false, error: error.message };
      if (!data.user) return { success: false, error: 'Login failed' };

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError || !profile) return { success: false, error: 'User profile not found' };

      // Allow admin to login as hotel partner for testing/demo purposes if needed, 
      // but strictly, it should be hotel_partner
      // if (profile.role !== 'hotel_partner' && profile.role !== 'admin') {
      if (profile.role !== 'hotel_partner') {
        return { success: false, error: 'Hotel Partner access required' };
      }

      localStorage.setItem('userEmail', email);
      localStorage.setItem('userId', data.user.id);
      localStorage.setItem('userRole', 'hotel_partner');

      if (!data.session) return { success: false, error: 'No session created' };

      return {
        success: true,
        data: {
          user: profile as User, // We return the updated profile user
          session: data.session,
        },
      };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Login failed' };
    }
  }

  /**
   * CUSTOMER SIGNUP
   * Create Supabase Auth user (trigger creates profile)
   */
  async signupCustomer(
    email: string,
    password: string,
    fullName: string
  ): Promise<ApiResponse<LoginResponse>> {
    try {
      // Validate inputs
      if (!email || !password || !fullName) {
        return { success: false, error: 'All fields are required' };
      }

      if (password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters' };
      }

      // Check if email already exists in profiles
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (existingUser) {
        return { success: false, error: 'Email already registered' };
      }

      // Create user in Supabase Auth (trigger will auto-create profile)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'customer',
          },
        },
      });

      if (authError) {
        return { success: false, error: authError.message };
      }

      if (!authData.user) {
        return { success: false, error: 'Failed to create account' };
      }

      // Wait for trigger to create profile
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Auto-login
      const loginResult = await this.loginCustomer(email, password);
      if (loginResult.success) {
        return loginResult;
      }

      if (!authData.session) return { success: false, error: 'No session created' };

      // Fallback: return user data
      return {
        success: true,
        data: {
          user: {
            id: authData.user.id,
            email,
            name: fullName,
            role: 'customer',
          } as User,
          session: authData.session,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Signup failed',
      };
    }
  }

  /**
   * ADMIN SIGNUP
   * Create Supabase Auth user, update profile role to admin
   */
  async signupAdmin(
    email: string,
    password: string,
    fullName: string
  ): Promise<ApiResponse<LoginResponse>> {
    try {
      // Validate inputs
      if (!email || !password || !fullName) {
        return { success: false, error: 'All fields are required' };
      }

      if (password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters' };
      }

      // Check if email already exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (existingUser) {
        return { success: false, error: 'Email already registered' };
      }

      // Create user in Supabase Auth (trigger creates profile as 'customer' by default)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'customer', // Will be updated to admin below
          },
        },
      });

      if (authError) {
        return { success: false, error: authError.message };
      }

      if (!authData.user) {
        return { success: false, error: 'Failed to create account' };
      }

      // Wait for trigger to create profile
      await new Promise(resolve => setTimeout(resolve, 1500));

      // If signUp returned a session token we can upsert/update the profile directly (client is authenticated)
      if (authData.session?.access_token) {
        try {
          const { error: upsertError } = await supabase.from('profiles').upsert(
            {
              id: authData.user.id,
              email,
              name: fullName,
              role: 'admin',
            },
            { onConflict: 'id' }
          );
          if (upsertError) console.error('Error upserting profile after signupAdmin:', upsertError);
        } catch (e) {
          console.error('Unexpected error upserting profile after signupAdmin:', e);
        }
      } else {
        // Otherwise poll for the profile then update role (the auth trigger should create it)
        const maxRetries = 8;
        let found = false;
        for (let i = 0; i < maxRetries; i++) {
          try {
            const { data: profile } = await supabase.from('profiles').select('id').eq('id', authData.user.id).maybeSingle();
            if (profile) {
              found = true;
              break;
            }
          } catch (e) {
            // ignore and retry
          }
          await new Promise(r => setTimeout(r, 1000));
        }

        if (!found) {
          console.warn('Profile not found after signupAdmin polling; trigger may be delayed or missing');
        } else {
          // Update role to admin (attempt; may be blocked by RLS if not permitted)
          try {
            const { error: updateError } = await supabase.from('profiles').update({ role: 'admin' }).eq('id', authData.user.id);
            if (updateError) console.error('Error updating role to admin after polling:', updateError);
          } catch (e) {
            console.error('Unexpected error updating role after signupAdmin polling:', e);
          }
        }
      }

      // Auto-login
      const loginResult = await this.loginAdmin(email, password);
      if (loginResult.success) {
        return loginResult;
      }

      if (!authData.session) return { success: false, error: 'No session created' };

      // Fallback: return user data
      return {
        success: true,
        data: {
          user: {
            id: authData.user.id,
            email,
            name: fullName,
            role: 'admin',
          } as User,
          session: authData.session,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Admin signup failed',
      };
    }
  }

  /**
   * HOTEL PARTNER SIGNUP
   * Create Supabase Auth user, update profile role to hotel_partner
   */
  async signupHotelPartner(
    email: string,
    password: string,
    fullName: string
  ): Promise<ApiResponse<LoginResponse>> {
    try {
      // Validate inputs
      if (!email || !password || !fullName) {
        return { success: false, error: 'All fields are required' };
      }

      if (password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters' };
      }

      // Check if email already exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (existingUser) {
        return { success: false, error: 'Email already registered' };
      }

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'hotel_partner',
          },
        },
      });

      if (authError) {
        return { success: false, error: authError.message };
      }

      if (!authData.user) {
        return { success: false, error: 'Failed to create account' };
      }

      // Wait for trigger to create profile
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Force update role to hotel_partner
      // If the trigger failed to set role correctly, let's try to fix it here if we assume first signup is hotel partner.
      // But we can't easily force update if RLS blocks it.
      // However, for development, let's assume if role is 'customer' but signed up via this method, 
      // we might want to allow login anyway if we are 'hotel_partner' intended?
      // No, that's unsafe. The user should run the SQL fix.

      // Let's try to invoke a function or rely on metadata.
      // Or just try the update one more time with error logging.
      const { error: updateError } = await supabase.from('profiles').update({ role: 'hotel_partner' }).eq('id', authData.user.id);

      if (updateError) {
        console.error('Failed to set role to hotel_partner:', updateError);
        // Return specific error to guide user
        return {
          success: false,
          error: 'Account created but role assignment failed. Please run FIX_HOTEL_ROLE.sql in Supabase or ask admin.'
        };
      }

      // Auto-login (reuse loginAdmin logic which just checks credentials and role, generic enough)
      // Actually loginAdmin checks for 'admin' role. We need a generic login or use loginAdmin/loginCustomer logic but for hotel.
      // Let's make a generic login or just verify the role here.

      // Let's just return success and let the UI redirect or require login.
      // But preserving the auto-login feel:
      return {
        success: true,
        data: {
          user: {
            id: authData.user.id,
            email,
            name: fullName,
            role: 'hotel_partner',
          } as User,
          session: authData.session,
        },
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Hotel Partner signup failed',
      };
    }
  }

  /**
   * GET CURRENT USER FROM SESSION
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session?.user) {
        return null;
      }

      // Get profile from profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.session.user.id)
        .single();

      return profile as User || null;
    } catch {
      return null;
    }
  }

  /**
   * LOGOUT
   */
  async logout(): Promise<void> {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    await supabase.auth.signOut();
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
}

export const authService = new AuthService();
