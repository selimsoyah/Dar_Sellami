"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Link from "next/link";

// Placeholder images
const placeholderImages = [
  "meals/Bolgnaise.png",
  "meals/Bolgnaise.png",
  "meals/Bolgnaise.png",
  "meals/Bolgnaise.png",
  "meals/Bolgnaise.png",
  "meals/Bolgnaise.png",
  "meals/Bolgnaise.png",
  "meals/Bolgnaise.png",
  "meals/Bolgnaise.png",
  "meals/Bolgnaise.png",
  "meals/Bolgnaise.png",
  "meals/Bolgnaise.png",
  "meals/Bolgnaise.png",
  "meals/Bolgnaise.png",
  "meals/Bolgnaise.png",
];
 
  


// Placeholder product descriptions
const placeholderDescriptions = {
  "Mediterranean Grilled Chicken": "Char-marinated chicken with roasted vegetables",
  "Salmon Teriyaki Bowl": "Salmon fillet with jasmine rice and steamed broccoli",
  "Vegetarian Buddha Bowl": "Assorted fresh vegetables and brown rice",
  "Beef Stir Fry": "Tender beef with stir-fried vegetables and brown rice",
};

type Product = {
  id: string;
  name: string;
  price: number;
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [tempInputValues, setTempInputValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from("products").select("*");
      if (data) setProducts(data);
    };
    fetchProducts();
  }, []);

  const addToCart = (id: string, quantity: number = 1) => {
    setCart(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + quantity
    }));
    // Clear temp input value when adding
    setTempInputValues(prev => {
      const newTemp = { ...prev };
      delete newTemp[id];
      return newTemp;
    });
  };

  const incrementQuantity = (id: string) => {
    setCart(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }));
    // Clear temp input value
    setTempInputValues(prev => {
      const newTemp = { ...prev };
      delete newTemp[id];
      return newTemp;
    });
  };

  const decrementQuantity = (id: string) => {
    const currentQty = cart[id] || 0;
    if (currentQty > 1) {
      setCart(prev => ({
        ...prev,
        [id]: currentQty - 1
      }));
    } else {
      // Remove from cart if quantity becomes 0
      removeFromCart(id);
    }
    // Clear temp input value
    setTempInputValues(prev => {
      const newTemp = { ...prev };
      delete newTemp[id];
      return newTemp;
    });
  };

  const updateCartQuantity = (id: string, value: string) => {
    // Store the temporary input value
    setTempInputValues(prev => ({
      ...prev,
      [id]: value
    }));
    
    // If it's a valid number, update the cart
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      if (numValue <= 0) {
        const newCart = { ...cart };
        delete newCart[id];
        setCart(newCart);
        // Also clear temp input
        setTempInputValues(prev => {
          const newTemp = { ...prev };
          delete newTemp[id];
          return newTemp;
        });
      } else {
        setCart(prev => ({
          ...prev,
          [id]: numValue
        }));
      }
    }
  };

  const getCartQuantity = (id: string) => {
    // Return temp input value if exists, otherwise cart quantity
    return tempInputValues[id] !== undefined ? tempInputValues[id] : (cart[id] || 0);
  };

  const removeFromCart = (id: string) => {
    const newCart = { ...cart };
    delete newCart[id];
    setCart(newCart);
    // Also clear temp input
    setTempInputValues(prev => {
      const newTemp = { ...prev };
      delete newTemp[id];
      return newTemp;
    });
  };

  const hasItemInCart = (id: string) => {
    return cart[id] !== undefined && cart[id] > 0;
  };

  const totalItems = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);

  return (
    <div className="home-container">
      <header className="header">
        <div className="container">
          <div className="logo">
            <img src="/Logo.jpg" alt="FreshMeals Logo" style={{ height: 70 }} />
          </div>
          <nav className="navigation">
            <a href="#">Home</a>
            <a href="#">Menu</a>
            <a href="#">About</a>
            <a href="#">Contact</a>
          </nav>
          <div className="cart-icon">
            <Link
              href={{
                pathname: "/cart",
                query: { 
                  cart: Object.entries(cart)
                    .filter(([id, qty]) => qty > 0)
                    .map(([id, qty]) => `${id}:${qty}`)
                    .join(",") 
                },
              }}
              className={totalItems > 0 ? "cart-link cart-has-items" : "cart-link"}
            >
              🛒 Cart ({totalItems})
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="hero-section">
          <div className="container">
            <div className="hero-content">
              <h1 style={{ color: "#fdba74" }}>
                Fresh, Healthy
                
                <br />
                Meals Delivered Daily
              </h1>
              <p>
                Chef-prepared, nutritionally balanced meals delivered fresh to
                your door. No cooking, no cleanup. Just delicious food.
              </p>
              <button 
                style={{ display: 'flex', justifyContent:'space-between', alignItems: 'center' }}
                className="order_now_btn "
                onClick={() => document.getElementById('featured-meals')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Order Now ! 
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  style={{ marginLeft: '8px'}}
                >
                  <polyline  points="6,9 12,15 18,9"></polyline>
                </svg>
              </button>

            </div>
            <div className="hero-image">
              <img
                src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=2787&auto=format&fit=crop"
                alt="Fresh, healthy meal"
              />
            </div>
          </div>
        </section>

        <section className="featured-meals-section" id="featured-meals">
          <div className="container">
            <h2>Featured Meals</h2>
            <p className="featured-subtitle">
              Discover our most popular chef-crafted dishes
            </p>
            <div className="meal-cards-container">
              {products.length > 0
                ? products.map((p, index) => (
                    <div key={p.id} className="meal-card">
                      <img
                        src={placeholderImages[index]}
                        alt={p.name}
                        className="meal-image"
                      />
                      <div className="meal-details">
                        <h3>{p.name}</h3>
                        <p className="meal-description">
                          {placeholderDescriptions[p.name as keyof typeof placeholderDescriptions]}
                        </p>
                        <div className="meal-action">
                          <span className="meal-price">TND {p.price}</span>
                          <div className="cart-controls">
                            {!hasItemInCart(p.id) ? (
                              // Show "Add to Cart" button when item is not in cart
                              <button
                                className="add-to-cart-btn"
                                onClick={() => addToCart(p.id, 1)}
                              >
                                Add to Cart
                              </button>
                            ) : (
                              // Show quantity controls when item is in cart
                              <div className="quantity-controls">
                                <button
                                  className="quantity-btn minus-btn"
                                  onClick={() => decrementQuantity(p.id)}
                                  title="Decrease quantity"
                                >
                                  −
                                </button>
                                <div className="quantity-display">
                                  {getCartQuantity(p.id)}
                                </div>
                                <button
                                  className="quantity-btn plus-btn"
                                  onClick={() => incrementQuantity(p.id)}
                                  title="Increase quantity"
                                >
                                  +
                                </button>
                                <button
                                  className="remove-btn"
                                  onClick={() => removeFromCart(p.id)}
                                  title="Remove from cart"
                                >
                                  ✕
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                : Object.keys(placeholderDescriptions)
                    .map((name, index) => (
                      <div key={index} className="meal-card">
                        <img
                          src={placeholderImages[index]}
                          alt={name}
                          className="meal-image"
                        />
                        <div className="meal-details">
                          <h3>{name}</h3>
                          <p className="meal-description">
                            {placeholderDescriptions[name as keyof typeof placeholderDescriptions]}
                          </p>
                          <div className="meal-action">
                            <span className="meal-price">TND{Math.floor(Math.random() * 10 + 15)}.99</span>
                            <div className="cart-controls">
                              {!hasItemInCart(`product-id-${index}`) ? (
                                // Show "Add to Cart" button when item is not in cart
                                <button
                                  className="add-to-cart-btn"
                                  onClick={() => addToCart(`product-id-${index}`, 1)}
                                >
                                  Add to Cart
                                </button>
                              ) : (
                                // Show quantity controls when item is in cart
                                <div className="quantity-controls">
                                  <button
                                    className="quantity-btn minus-btn"
                                    onClick={() => decrementQuantity(`product-id-${index}`)}
                                    title="Decrease quantity"
                                  >
                                    −
                                  </button>
                                  <div className="quantity-display">
                                    {getCartQuantity(`product-id-${index}`)}
                                  </div>
                                  <button
                                    className="quantity-btn plus-btn"
                                    onClick={() => incrementQuantity(`product-id-${index}`)}
                                    title="Increase quantity"
                                  >
                                    +
                                  </button>
                                  <button
                                    className="remove-btn"
                                    onClick={() => removeFromCart(`product-id-${index}`)}
                                    title="Remove from cart"
                                  >
                                    ✕
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
            </div>
          </div>
        </section>

        <section className="how-it-works-section">
          <div className="container">
            <h2>How it Works</h2>
            <p className="how-it-works-subtitle">
              Three simple steps to fresh, healthy meals
            </p>
            <div className="steps-container">
              <div className="step-card">
                <span className="step-icon">🛒</span>
                <h3>1. Choose Your Meals</h3>
                <p>
                  Browse our menu and select from dozens of chef-prepared options
                  that fit your taste and dietary needs.
                </p>
              </div>
              <div className="step-card">
                <span className="step-icon">🧑‍🍳</span>
                <h3>2. We Prepare Fresh</h3>
                <p>
                  Our chefs prepare your meals using the freshest ingredients,
                  with no preservatives or artificial additives.
                </p>
              </div>
              <div className="step-card">
                <span className="step-icon">📦</span>
                <h3>3. Delivered To You</h3>
                <p>
                  Enjoy fresh, ready-to-eat meals delivered right to your
                  doorstep on your schedule.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footer-column">
            <div className="logo">
              <img src="/Logo_Footer.png" alt="FreshMeals Logo" style={{ height: 100 }} />
            </div>
            <p>Fresh, healthy meals delivered to your door.</p>
          </div>
          <div className="footer-column">
            <h4>Quick Links</h4>
            <ul>
              <li>
                <a href="#">Home</a>
              </li>
              <li>
                <a href="#">Menu</a>
              </li>
              <li>
                <a href="#">About</a>
              </li>
              <li>
                <a href="#">Contact</a>
              </li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Support</h4>
            <ul>
              <li>
                <a href="#">FAQ</a>
              </li>
              <li>
                <a href="#">Shipping</a>
              </li>
              <li>
                <a href="#">Returns</a>
              </li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Contact Info</h4>
            <p>Phone: +216 XXX XXX XXX</p>
            <p>Email: info@freshmeals.tn</p>
          </div>
        </div>
      </footer>
      <div className="copyright">
        <div className="container">
          © 2024 FreshMeals. All rights reserved.
        </div>
      </div>
    </div>
  );
}