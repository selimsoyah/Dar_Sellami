"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '../../../lib/useAdminAuth';
import AdminDashboard from '../../components/AdminDashboard';

export default function AdminDashboardPage() {
  const { isAdmin, loading } = useAdminAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/admin/login');
    }
  }, [isAdmin, loading, router]);

  if (loading) {
    return (
      <div className="admin-dashboard-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="admin-dashboard-container">
        <div className="admin-access-denied">
          <h2>Access Denied</h2>
          <p>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
}