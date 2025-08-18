"use client";

import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { verifyPassword } from './password-utils';

interface AuthResult {
  success: boolean;
  error?: { message: string };
  user?: { email: string; id: string };
}

export const useAdminAuth = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  const checkAuthState = () => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('adminUser');
      const loginTime = localStorage.getItem('adminLoginTime');
      
      if (storedUser && loginTime) {
        const loginTimestamp = parseInt(loginTime);
        const currentTime = Date.now();
        const sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours
        
        // Check if session has expired
        if (currentTime - loginTimestamp > sessionTimeout) {
          console.log('⏰ Admin session expired');
          localStorage.removeItem('adminUser');
          localStorage.removeItem('adminLoginTime');
          setIsAdmin(false);
          setUser(null);
        } else {
          const parsedUser = JSON.parse(storedUser);
          console.log('✅ Admin session restored:', parsedUser.email);
          setUser(parsedUser);
          setIsAdmin(true);
        }
      } else {
        console.log('❌ No admin session found');
        setIsAdmin(false);
        setUser(null);
      }
    }
  };

  useEffect(() => {
    setMounted(true);
    checkAuthState();
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    try {
      // Add this right at the beginning of the signIn function, after the console.log statements:

      // Try a direct count query first
      console.log('🔍 Testing basic table access...');
      const { count, error: countError } = await supabase
        .from('admin_users')
        .select('*', { count: 'exact', head: true });

      console.log('📊 Total rows in admin_users table:', count);
      console.log('📊 Count query error:', countError);

      // Try accessing with service role if possible
      console.log('🔍 Testing with raw SQL-like query...');
      const { data: rawData, error: rawError } = await supabase
        .rpc('get_admin_user', { user_email: email.toLowerCase() });

      console.log('📊 Raw query result:', rawData);
      console.log('📊 Raw query error:', rawError);
      console.log('🔐 Attempting admin sign in with email:', email);
      console.log('🔑 Password length:', password.length);
      
      // First, let's check what's in the admin_users table
      console.log('🔍 Checking all admin users in database...');
      const { data: allAdmins, error: allError } = await supabase
        .from('admin_users')
        .select('id, email, is_active, created_at');

      console.log('📊 All admin users in database:', allAdmins);
      console.log('📊 Database error (if any):', allError);

      if (allError) {
        console.error('❌ Database connection error:', allError);
        return {
          success: false,
          error: { message: 'Database connection error: ' + allError.message }
        };
      }

      // Now try to find the specific user
      console.log('🔍 Searching for specific user with email:', email.toLowerCase());
      const { data: adminUsers, error } = await supabase
        .from('admin_users')
        .select('id, email, password_hash, is_active')
        .eq('email', email.toLowerCase())
        .eq('is_active', true);

      console.log('📋 Query result for specific user:', adminUsers);
      console.log('📋 Query error (if any):', error);

      if (error) {
        console.error('❌ Database query error:', error);
        return {
          success: false,
          error: { message: 'Database query error: ' + error.message }
        };
      }

      if (!adminUsers || adminUsers.length === 0) {
        console.error('❌ No admin user found with email:', email);
        console.log('🔍 Available emails in database:', allAdmins?.map(u => u.email));
        return {
          success: false,
          error: { message: 'Invalid email or password' }
        };
      }

      if (adminUsers.length > 1) {
        console.error('❌ Multiple admin users found with same email');
        return {
          success: false,
          error: { message: 'Database integrity error. Please contact administrator.' }
        };
      }

      const adminUser = adminUsers[0];
      console.log('👤 Admin user found:', { id: adminUser.id, email: adminUser.email, is_active: adminUser.is_active });
      console.log('🔑 Password hash from database:', adminUser.password_hash.substring(0, 20) + '...');
      
      // Verify password using bcrypt
      console.log('🔐 Verifying password...');
      const isValidPassword = await verifyPassword(password, adminUser.password_hash);
      console.log('🔐 Password verification result:', isValidPassword);
      
      if (!isValidPassword) {
        console.error('❌ Invalid password');
        // Let's also test the hash manually
        console.log('🧪 Testing password verification...');
        const bcrypt = require('bcryptjs');
        const manualTest = await bcrypt.compare(password, adminUser.password_hash);
        console.log('🧪 Manual bcrypt test result:', manualTest);
        
        return {
          success: false,
          error: { message: 'Invalid email or password' }
        };
      }

      console.log('✅ Password verified, logging in admin user');
      
      // Create user object without sensitive data
      const userObj = {
        id: adminUser.id,
        email: adminUser.email
      };

      // Store in localStorage with timestamp
      localStorage.setItem('adminUser', JSON.stringify(userObj));
      localStorage.setItem('adminLoginTime', Date.now().toString());
      
      setUser(userObj);
      setIsAdmin(true);
      
      console.log('✅ Admin login successful! State updated.');
      
      return {
        success: true,
        user: userObj
      };
      
    } catch (error) {
      console.error('💥 Sign in error:', error);
      return {
        success: false,
        error: { message: 'An unexpected error occurred during sign in' }
      };
    }
  };

  const signOut = async (): Promise<void> => {
    console.log('🚪 Admin signing out...');
    
    // Clear localStorage
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminLoginTime');
    
    // Clear state
    setUser(null);
    setIsAdmin(false);
    
    console.log('✅ Admin signed out successfully');
  };

  const signUp = async (email: string, password: string): Promise<AuthResult> => {
    // For security, admin registration should be done manually or through a separate secure process
    return {
      success: false,
      error: { message: 'Admin registration is not available through this interface' }
    };
  };

  return {
    user,
    isAdmin,
    loading: loading || !mounted,
    signIn,
    signOut,
    signUp,
  };
};