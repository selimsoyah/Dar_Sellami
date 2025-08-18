"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '../../lib/useAdminAuth';

export default function AdminPage() {
  const { isAdmin, loading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (isAdmin) {
        // User is authenticated, redirect to dashboard
        router.push('/admin/dashboard');
      } else {
        // User is not authenticated, redirect to login
        router.push('/admin/login');
      }
    }
  }, [isAdmin, loading, router]);

  // Show loading state while determining where to redirect
  return (
    <div className="admin-loading-container">
      <div className="loading-spinner">
        <p>🔄 Loading admin panel...</p>
      </div>
    </div>
  );
}