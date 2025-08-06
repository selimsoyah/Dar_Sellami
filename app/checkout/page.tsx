'use client';
import { useCartStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const cart = useCartStore((state) => state.cart);
  const clearCart = useCartStore((state) => state.clearCart);
  const router = useRouter();

  const handleOrder = async () => {
    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }

    // Structure cart data into something meaningful
    const structuredItems = cart.map((item) => ({
      product_id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    }));

    const { error } = await supabase.from('orders').insert([
      {
        items: structuredItems, // this will store a full array of objects in Supabase
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error('Order error:', error.message);
      alert('Order failed');
      return;
    }

    clearCart();
    alert('Order placed successfully!');
    router.push('/');
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Checkout</h1>
      <button
        onClick={handleOrder}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Place Order
      </button>
    </div>
  );
}
