"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabase";
import OrderForm from '../components/OrderForm';
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  price: number;
};

type CartItemWithQuantity = {
  product: Product;
  quantity: number;
};

export default function CartPage() {
  const searchParams = useSearchParams();
  const [cartItems, setCartItems] = useState<Record<string, number>>({});
  const [cartWithQuantities, setCartWithQuantities] = useState<CartItemWithQuantity[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Ensure component is mounted on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Parse cart from query string - now expects "id:qty,id:qty" format
  useEffect(() => {
    if (mounted && searchParams) {
      const cartParam = searchParams.get('cart');
      console.log('Cart param received:', cartParam); // Debug log
      
      if (cartParam && cartParam.trim() !== '') {
        const cartObject: Record<string, number> = {};
        const items = cartParam.split(",").filter(item => item.length > 0);
        
        console.log('Cart items to process:', items); // Debug log
        
        items.forEach(item => {
          const [id, qtyStr] = item.split(":");
          const quantity = parseInt(qtyStr) || 0;
          if (quantity > 0 && id) {
            cartObject[id] = quantity;
          }
        });
        
        console.log('Final cart object:', cartObject); // Debug log
        setCartItems(cartObject);
      }
    }
  }, [searchParams, mounted]);

  // Fetch product data and set up cart with quantities
  useEffect(() => {
    const fetchCartProducts = async () => {
      const productIds = Object.keys(cartItems);
      
      console.log('Product IDs to fetch:', productIds); // Debug log
      
      if (productIds.length === 0) {
        setCartWithQuantities([]);
        return;
      }

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .in("id", productIds);

      console.log('Fetched products:', data); // Debug log
      console.log('Fetch error:', error); // Debug log

      if (data) {
        const cartWithQty = data.map(product => ({
          product,
          quantity: cartItems[product.id] || 0
        }));
        
        console.log('Cart with quantities:', cartWithQty); // Debug log
        setCartWithQuantities(cartWithQty);
      }
    };

    fetchCartProducts();
  }, [cartItems]);

  const placeOrder = async () => {
    setLoading(true);
    
    // Create proper order payload with product details and quantities
    const orderPayload = {
      items: cartWithQuantities.map(item => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity
      })),
    };

    const { error } = await supabase.from("orders").insert(orderPayload);

    if (error) {
      alert("Error placing order: " + error.message);
    } else {
      alert("✅ Order placed successfully!");
      window.location.href = "/";
    }
    setLoading(false);
  };

  // Calculate total with quantities
  const total = cartWithQuantities.reduce((sum, item) => 
    sum + (Number(item.product.price) * item.quantity), 0
  );

  const totalItems = Object.values(cartItems).reduce((sum, quantity) => sum + quantity, 0);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="cart-page-container">
        <div className="container">
          <h1>Your Cart</h1>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page-container">
      <div className="container">
        <h1>Your Cart</h1>

        {cartWithQuantities.length === 0 ? (
          <div className="empty-cart-message">
            <p>No items in cart.</p>
            <Link href="/" className="back-to-products-link">
              ← Back to Products
            </Link>
          </div>
        ) : (
          <>
            <div className="cart-items-list">
              {cartWithQuantities.map((item) => (
                <div key={item.product.id} className="cart-item-card">
                  <div className="cart-item-info">
                    <span className="cart-item-name">{item.product.name}</span>
                    <span className="cart-item-quantity">x{item.quantity}</span>
                  </div>
                  <div className="cart-item-price-details">
                    <div className="cart-item-price-each">${item.product.price} each</div>
                    <div className="cart-item-total-price">${(Number(item.product.price) * item.quantity).toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <p className="total-items">Total Items: {totalItems}</p>
              <p className="total-amount">Total: ${total.toFixed(2)}</p>
            </div>

            <div className="cart-actions">
              <button
                onClick={() => setShowForm(true)}
                className="place-order-btn"
                disabled={loading}
              >
                {loading ? "Placing Order..." : "Place Order"}
              </button>
              
              <Link href="/" className="continue-shopping-btn">
                Continue Shopping
              </Link>
            </div>

            {showForm && (
              <OrderForm
                cartItems={cartWithQuantities}
                onSuccess={() => {
                  alert("✅ Order placed successfully!");
                  window.location.href = "/";
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}