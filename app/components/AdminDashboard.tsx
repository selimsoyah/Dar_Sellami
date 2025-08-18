"use client";

import { useState, useEffect } from 'react';
import { useAdminAuth } from '../../lib/useAdminAuth';
import { supabase } from '../../lib/supabase';
import { ADMIN_CONFIG } from '../../lib/admin-config';

type Order = {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  address?: string;
  governorate?: string;
  delivery_type: 'delivery' | 'pickup';
  pickup_time?: string;
  notes?: string;
  items: any[];
  created_at: string;
};

const AdminDashboard = () => {
  const { user, signOut } = useAdminAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    deliveryOrders: 0,
    pickupOrders: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setOrders(data);
      calculateStats(data);
    }
    
    if (error) {
      console.error('Error fetching orders:', error);
    }
    
    setLoading(false);
  };

  const calculateStats = (ordersData: Order[]) => {
    const totalOrders = ordersData.length;
    const deliveryOrders = ordersData.filter(order => order.delivery_type === 'delivery').length;
    const pickupOrders = ordersData.filter(order => order.delivery_type === 'pickup').length;
    
    // Calculate total revenue from items
    const totalRevenue = ordersData.reduce((sum, order) => {
      if (order.items && Array.isArray(order.items)) {
        const orderTotal = order.items.reduce((orderSum: number, item: any) => {
          return orderSum + (item.price * item.quantity);
        }, 0);
        return sum + orderTotal;
      }
      return sum;
    }, 0);

    setStats({
      totalOrders,
      deliveryOrders,
      pickupOrders,
      totalRevenue,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getOrderTotal = (items: any[]) => {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <h2>Loading admin dashboard...</h2>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div className="admin-header-content">
          <h1>📊 {ADMIN_CONFIG.dashboard.title}</h1>
          <div className="admin-user-info">
            <span>👨‍💼 {user?.email}</span>
            <button onClick={handleSignOut} className="admin-signout-btn">
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="admin-stats">
        <div className="stat-card">
          <h3>📋 Total Orders</h3>
          <p className="stat-number">{stats.totalOrders}</p>
        </div>
        <div className="stat-card">
          <h3>🚚 Delivery Orders</h3>
          <p className="stat-number">{stats.deliveryOrders}</p>
        </div>
        <div className="stat-card">
          <h3>🏪 Pickup Orders</h3>
          <p className="stat-number">{stats.pickupOrders}</p>
        </div>
        <div className="stat-card">
          <h3>💰 Total Revenue</h3>
          <p className="stat-number">${stats.totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      <div className="admin-content">
        <div className="orders-section">
          <div className="section-header">
            <h2>📦 Recent Orders</h2>
            <button onClick={fetchOrders} className="refresh-btn">
              🔄 Refresh
            </button>
          </div>

          <div className="orders-list">
            {orders.length === 0 ? (
              <div className="no-orders">
                <p>No orders found.</p>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <div className="order-info">
                      <h3>{order.first_name} {order.last_name}</h3>
                      <span className={`order-type ${order.delivery_type}`}>
                        {order.delivery_type === 'delivery' ? '🚚 Delivery' : '🏪 Pickup'}
                      </span>
                    </div>
                    <div className="order-meta">
                      <span className="order-date">{formatDate(order.created_at)}</span>
                      <span className="order-total">
                        ${getOrderTotal(order.items).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="order-details">
                    <div className="customer-details">
                      <p><strong>📞 Phone:</strong> {order.phone}</p>
                      {order.delivery_type === 'delivery' && (
                        <>
                          <p><strong>📍 Address:</strong> {order.address}</p>
                          <p><strong>🏛️ Governorate:</strong> {order.governorate}</p>
                        </>
                      )}
                      {order.delivery_type === 'pickup' && order.pickup_time && (
                        <p><strong>⏰ Pickup Time:</strong> {formatDate(order.pickup_time)}</p>
                      )}
                      {order.notes && (
                        <p><strong>📝 Notes:</strong> {order.notes}</p>
                      )}
                    </div>

                    {order.items && order.items.length > 0 && (
                      <div className="order-items">
                        <h4>📋 Items:</h4>
                        <ul>
                          {order.items.map((item, index) => (
                            <li key={index}>
                              {item.quantity}x {item.name} - ${(item.price * item.quantity).toFixed(2)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
