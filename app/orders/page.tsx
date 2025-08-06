// app/orders/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from "../../lib/supabase";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
      } else {
        setOrders(data || []);
      }
      setLoading(false);
    }

    fetchOrders();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">All Orders</h1>
      {loading ? (
        <p>Loading...</p>
      ) : orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order.id} className="border p-4 rounded">
              <p className="text-sm text-gray-500">Order ID: {order.id}</p>
              <p className="text-sm text-gray-500">
                Placed: {new Date(order.created_at).toLocaleString()}
              </p>
              <p className="mt-2 font-medium">Items:</p>
              <ul className="ml-4 list-disc">
                {order.items.map((item: any, idx: number) => (
                  <li key={idx}>
                    Product ID: {item.id} — Quantity: {item.quantity}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
