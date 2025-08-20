"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { RESTAURANT_CONFIG } from "../../lib/restaurant-config";
import dynamic from 'next/dynamic';

// Dynamically import the map component to avoid SSR issues
const LocationMap = dynamic(() => import('./LocationMap'), { 
  ssr: false,
  loading: () => <div className="map-loading">Loading map...</div>
});

type CartItemWithQuantity = {
  product: {
    id: string;
    name: string;
    price: number;
  };
  quantity: number;
};

type Props = {
  cartItems: CartItemWithQuantity[];
  deliveryType: 'delivery' | 'pickup';
  total: number;
  onSuccess: () => void;
};

export default function OrderForm({ cartItems, deliveryType, total, onSuccess }: Props) {
  const [deliveryForm, setDeliveryForm] = useState({
  firstName: "",
  lastName: "",
  phone: "",
  email: "", // Add this new line
  address: "",
  governorate: "",
});

const [pickupForm, setPickupForm] = useState({
  firstName: "",
  lastName: "",
  phone: "",
  email: "", // Add this new line
  pickupTime: "",
  notes: "",
});
  
  
  const [submitting, setSubmitting] = useState(false);

  const handleDeliveryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setDeliveryForm({ ...deliveryForm, [e.target.name]: e.target.value });
  };

  const handlePickupChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setPickupForm({ ...pickupForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setSubmitting(true);

  let payload;
  let orderDetails;

  if (deliveryType === 'delivery') {
    const { firstName, lastName, phone, email, address, governorate } = deliveryForm;
    payload = {
      first_name: firstName,
      last_name: lastName,
      phone,
      email, // Include email in payload
      address,
      governorate,
      delivery_type: 'delivery',
      total_price: total,
      items: cartItems.map(item => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
      })),
    };
    
    // Create order details for email
    orderDetails = {
      firstName,
      lastName,
      email,
      phone,
      deliveryType: 'delivery',
      address,
      governorate,
      items: cartItems.map(item => ({
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
      })),
      total
    };
  } else {
    const { firstName, lastName, phone, email, pickupTime, notes } = pickupForm;
    payload = {
      first_name: firstName,
      last_name: lastName,
      phone,
      email, // Include email in payload
      pickup_time: pickupTime,
      notes,
      delivery_type: 'pickup',
      total_price: total,
      items: cartItems.map(item => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
      })),
    };
    
    // Create order details for email
    orderDetails = {
      firstName,
      lastName,
      email,
      phone,
      deliveryType: 'pickup',
      pickupTime,
      notes,
      items: cartItems.map(item => ({
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
      })),
      total
    };
  }

  // Insert order in database
  const { data: orderData, error } = await supabase
    .from("orders")
    .insert(payload)
    .select('id');

  if (error) {
    alert("❌ Error placing order: " + error.message);
    console.error(error);
    setSubmitting(false);
    return;
  }

  // If order created successfully, send email confirmation
  if (orderData && orderData[0]?.id) {
    const orderId = orderData[0].id;
    
    // Add order ID to email details
    orderDetails.orderId = orderId;
    
    try {
      // Send order confirmation emails
      const emailResponse = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderDetails }),
      });
      
      const emailResult = await emailResponse.json();
      
      if (!emailResult.success) {
        console.warn('Order created but email notification failed:', emailResult.message);
        // Continue with success flow even if email fails
      }
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Continue with success flow even if email fails
    }
    
    // Call the success callback regardless of email status
    onSuccess();
  } else {
    alert("✅ Order placed but couldn't retrieve order ID.");
    onSuccess();
  }
  
  setSubmitting(false);
};

  if (deliveryType === 'delivery') {
    return (
      <form onSubmit={handleSubmit} className="order-form-container">
        <h2>Delivery Information</h2>

        <div className="form-grid">
          <div className="form-group">
            <input
              required
              name="firstName"
              placeholder="First Name"
              onChange={handleDeliveryChange}
              value={deliveryForm.firstName}
            />
          </div>
          <div className="form-group">
            <input
              required
              name="lastName"
              placeholder="Last Name"
              onChange={handleDeliveryChange}
              value={deliveryForm.lastName}
            />
          </div>
        </div>
        <div className="form-group">
          <input
            required
            name="email"
            type="email"
            placeholder="Email (for order confirmation)"
            onChange={handleDeliveryChange}
            value={deliveryForm.email}
          />
        </div>
        <div className="form-group">
          <input
            required
            name="phone"
            placeholder="Phone Number"
            onChange={handleDeliveryChange}
            value={deliveryForm.phone}
          />
        </div>

        <div className="form-group">
          <input
            required
            name="address"
            placeholder="Full Address"
            onChange={handleDeliveryChange}
            value={deliveryForm.address}
          />
        </div>

        <div className="form-group">
          <select
            required
            name="governorate"
            onChange={handleDeliveryChange}
            value={deliveryForm.governorate}
          >
            <option value="">Select Governorate</option>
            <option value="Tunis">Tunis</option>
            <option value="Ariana">Ariana</option>
            <option value="Ben Arous">Ben Arous</option>
            <option value="Manouba">Manouba</option>
            <option value="Sfax">Sfax</option>
            <option value="Sousse">Sousse</option>
            <option value="Gabès">Gabès</option>
            <option value="Nabeul">Nabeul</option>
            <option value="Kairouan">Kairouan</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="confirm-order-btn"
        >
          {submitting ? "Submitting..." : "Confirm Delivery Order"}
        </button>
      </form>
    );
  }

  // Pickup Form
  return (
    <form onSubmit={handleSubmit} className="order-form-container">
      <h2>Pickup Information</h2>

      <div className="form-grid">
        <div className="form-group">
          <input
            required
            name="firstName"
            placeholder="First Name"
            onChange={handlePickupChange}
            value={pickupForm.firstName}
          />
        </div>
        <div className="form-group">
          <input
            required
            name="lastName"
            placeholder="Last Name"
            onChange={handlePickupChange}
            value={pickupForm.lastName}
          />
        </div>
      </div>
      <div className="form-group">
      <input
        required
        name="email"
        type="email"
        placeholder="Email (for order confirmation)"
        onChange={handlePickupChange}
        value={pickupForm.email}
      />
    </div>
      <div className="form-group">
        <input
          required
          name="phone"
          placeholder="Phone Number"
          onChange={handlePickupChange}
          value={pickupForm.phone}
        />
      </div>

      <div className="form-group">
        <input
          required
          name="pickupTime"
          type="datetime-local"
          onChange={handlePickupChange}
          value={pickupForm.pickupTime}
        />
        <label className="form-label">Preferred Pickup Time</label>
      </div>

      <div className="form-group">
        <textarea
          name="notes"
          placeholder="Special instructions or notes (optional)"
          rows={3}
          onChange={handlePickupChange}
          value={pickupForm.notes}
        />
      </div>

      <div className="pickup-location">
        <h4>📍 Pickup Location:</h4>
        <p>{RESTAURANT_CONFIG.address}</p>
        <p>📞 Phone: {RESTAURANT_CONFIG.phone}</p>
        <p>🕒 Hours: {RESTAURANT_CONFIG.hours}</p>
        
        {/* Interactive Map */}
        <div className="pickup-map">
          <LocationMap
            address={RESTAURANT_CONFIG.address}
            lat={RESTAURANT_CONFIG.coordinates.lat}
            lng={RESTAURANT_CONFIG.coordinates.lng}
            businessName={RESTAURANT_CONFIG.name}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="confirm-order-btn"
      >
        {submitting ? "Submitting..." : "Confirm Pickup Order"}
      </button>
    </form>
  );
}