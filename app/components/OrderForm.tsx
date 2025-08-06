"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

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
  onSuccess: () => void;
};

export default function OrderForm({ cartItems, onSuccess }: Props) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    governorate: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const { firstName, lastName, phone, address, governorate } = form;

    const payload = {
      first_name: firstName,
      last_name: lastName,
      phone,
      address,
      governorate,
      items: cartItems.map(item => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
      })),
    };

    const { error } = await supabase.from("orders").insert(payload);

    if (error) {
      alert("❌ Error placing order: " + error.message);
      console.error(error);
    } else {
      onSuccess();
    }

    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="order-form-container">
      <h2>Delivery Information</h2>

      <div className="form-grid">
        <div className="form-group">
          <input
            required
            name="firstName"
            placeholder="First Name"
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <input
            required
            name="lastName"
            placeholder="Last Name"
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="form-group">
        <input
          required
          name="phone"
          placeholder="Phone Number"
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <input
          required
          name="address"
          placeholder="Full Address"
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <select
          required
          name="governorate"
          onChange={handleChange}
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
          {/* Add others as needed */}
        </select>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="confirm-order-btn"
      >
        {submitting ? "Submitting..." : "Confirm Order"}
      </button>
    </form>
  );
}