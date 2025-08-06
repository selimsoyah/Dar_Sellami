"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Link from "next/link";

// Placeholder images
const placeholderImages = [
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTh0zj5jWM4qNJ-JJmStkvYLoptwW4cAtxVlQ&s",
"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTh0zj5jWM4qNJ-JJmStkvYLoptwW4cAtxVlQ&s",
"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTh0zj5jWM4qNJ-JJmStkvYLoptwW4cAtxVlQ&s",
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
  const [cart, setCart] = useState<string[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from("products").select("*");
      if (data) setProducts(data);
    };
    fetchProducts();
  }, []);

  const addToCart = (id: string) => {
    setCart([...cart, id]);
  };

  const totalItems = cart.length;

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
                query: { cart: cart.join(",") },
              }}
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

            </div>
            <div className="hero-image">
              <img
                src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=2787&auto=format&fit=crop"
                alt="Fresh, healthy meal"
              />
            </div>
          </div>
        </section>

        <section className="featured-meals-section">
          <div className="container">
            <h2>Featured Meals</h2>
            <p className="featured-subtitle">
              Discover our most popular chef-crafted dishes
            </p>
            <div className="meal-cards-container">
              {products.length > 0
                ? products.slice(0, 4).map((p, index) => (
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
                          <span className="meal-price">${p.price}</span>
                          <div className="cart-controls">
                            <button
                              className="add-to-cart-btn"
                              onClick={() => addToCart(p.id)}
                            >
                              Add to cart
                            </button>
                            {cart.filter((id) => id === p.id).length > 0 && (
                              <span className="cart-quantity">
                                In cart: {cart.filter((id) => id === p.id).length}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                : Object.keys(placeholderDescriptions)
                    .slice(0, 4)
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
                            <span className="meal-price">${Math.floor(Math.random() * 10 + 15)}.99</span>
                            <div className="cart-controls">
                              <button
                                className="add-to-cart-btn"
                                onClick={() => addToCart(`product-id-${index}`)}
                              >
                                Add to cart
                              </button>
                              {cart.filter((id) => id === `product-id-${index}`).length > 0 && (
                                <span className="cart-quantity">
                                  In cart: {cart.filter((id) => id === `product-id-${index}`).length}
                                </span>
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
            <div className="logo">FreshMeals</div>
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