"use client";

import { useEffect, useState, Suspense } from "react";
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

function CartContent() {
  const searchParams = useSearchParams();
  const [cartItems, setCartItems] = useState<Record<string, number>>({});
  const [cartWithQuantities, setCartWithQuantities] = useState<CartItemWithQuantity[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showDeliveryOptions, setShowDeliveryOptions] = useState(false);
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup' | null>(null);

  // 💰 Delivery fee constant
  const DELIVERY_FEE = 8.00;

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
      // Clear cart from localStorage after successful order
      localStorage.removeItem('cart');
      window.location.href = "/";
    }
    setLoading(false);
  };

  // Calculate totals with delivery fee
  const subtotal = cartWithQuantities.reduce((sum, item) =>
    sum + (Number(item.product.price) * item.quantity), 0
  );

  const deliveryFee = deliveryType === 'delivery' ? DELIVERY_FEE : 0;
  const total = subtotal + deliveryFee;

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
              <div className="price-breakdown">
                <div className="price-line">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>

                {/* Show delivery fee when delivery is selected */}
                {deliveryType === 'delivery' && (
                  <div className="price-line delivery-fee">
                    <span>🚚 Delivery Fee:</span>
                    <span>${DELIVERY_FEE.toFixed(2)}</span>
                  </div>
                )}

                {deliveryType === 'pickup' && (
                  <div className="price-line pickup-notice">
                    <span>🏪 Pickup:</span>
                    <span className="free-text">FREE</span>
                  </div>
                )}

                <div className="price-line total-line">
                  <span><strong>Total:</strong></span>
                  <span><strong>${total.toFixed(2)}</strong></span>
                </div>
              </div>
            </div>

            <div className="cart-actions">
              {!showDeliveryOptions && !showForm && (
                <button
                  onClick={() => setShowDeliveryOptions(true)}
                  className="place-order-btn"
                  disabled={loading}
                >
                  Place Order
                </button>
              )}

              <Link
                href="/"
                className="continue-shopping-btn"
                onClick={() => {
                  // Ensure cart data is saved to localStorage before navigating
                  localStorage.setItem('cart', JSON.stringify(cartItems));
                }}
              >
                Continue Shopping
              </Link>
            </div>

            {/* Delivery Options Selection */}
            {showDeliveryOptions && !showForm && (
              <div className="delivery-options-container">
                <h3>How would you like to receive your order?</h3>

                {/* 💰 Delivery Fee Notice */}
                <div className="delivery-fee-notice">
                  <div className="fee-info">
                    <span className="fee-icon">💰</span>
                    <span>Delivery service includes a $8.00 fee</span>
                  </div>
                </div>

                <div className="delivery-options">
                  <button
                    className="delivery-option-btn delivery-btn"
                    onClick={() => {
                      setDeliveryType('delivery');
                      setShowForm(true);
                      setShowDeliveryOptions(false);
                    }}
                  >
                    <div className="option-icon">🚚</div>
                    <div className="option-content">
                      <h4>Get it Delivered</h4>
                      <p>We'll deliver to your address</p>
                      <div className="fee-badge">+ $8.00 delivery fee</div>
                    </div>
                  </button>

                  <button
                    className="delivery-option-btn pickup-btn"
                    onClick={() => {
                      setDeliveryType('pickup');
                      setShowForm(true);
                      setShowDeliveryOptions(false);
                    }}
                  >
                    <div className="option-icon">🏪</div>
                    <div className="option-content">
                      <h4>Come Take it in Person</h4>
                      <p>Pick up from our location</p>
                      <div className="free-badge">FREE - No delivery fee</div>
                    </div>
                  </button>
                </div>

                <button
                  className="back-btn"
                  onClick={() => setShowDeliveryOptions(false)}
                >
                  ← Back
                </button>
              </div>
            )}

            {showForm && deliveryType && (
              <div className="form-container">
                {/* 💰 Show current total with delivery fee */}


                <button
                  className="back-btn"
                  onClick={() => {
                    setShowForm(false);
                    setShowDeliveryOptions(true);
                    setDeliveryType(null);
                  }}
                >
                  ← Back to Options
                </button>

                <OrderForm
                      cartItems={cartWithQuantities}
                      deliveryType={deliveryType}
                      total={total} // This should already be there from earlier
                      onSuccess={() => {
                        alert("✅ Order placed successfully!");
                        localStorage.removeItem('cart');
                        window.location.href = "/";
                      }}
                    />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function CartPage() {
  return (
    <Suspense fallback={
      <div className="cart-page-container">
        <div className="container">
          <h1>Your Cart</h1>
          <p>Loading...</p>
        </div>
      </div>
    }>
      <CartContent />
    </Suspense>
  );
}