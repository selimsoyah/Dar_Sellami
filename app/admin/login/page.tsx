"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '../../../lib/useAdminAuth';
import AdminLogin from '../../components/AdminLogin';

export default function AdminLoginPage() {
  const { isAdmin, loading } = useAdminAuth();
  const router = useRouter();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (!loading && isAdmin) {
      router.push('/admin/dashboard');
    }
  }, [isAdmin, loading, router]);

  const handleLoginSuccess = () => {
    console.log('🎉 Login success callback triggered');
    router.push('/admin/dashboard');
  };

  if (loading) {
    return (
      <div className="admin-login-container">
        <div className="admin-login-card">
          <div className="loading-spinner">Loading...</div>
        </div>
      </div>
    );
  }

  // Don't render login form if already authenticated
  if (isAdmin) {
    return (
      <div className="admin-login-container">
        <div className="admin-login-card">
          <div className="loading-spinner">Redirecting to dashboard...</div>
        </div>
      </div>
    );
  }

  return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
}