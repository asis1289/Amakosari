"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

type CartItem = { productId: string; quantity: number };
type CartContextType = {
  cartCount: number;
  refreshCart: () => void;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};

export const CartProvider: React.FC<{ user: any; children: React.ReactNode }> = ({ user, children }) => {
  const [cartCount, setCartCount] = useState(0);

  const getGuestCartCount = () => {
    let cart: CartItem[] = JSON.parse(localStorage.getItem("guestCart") || "[]");
    // Remove items with quantity <= 0
    cart = cart.filter(item => item.quantity > 0);
    if (cart.length === 0) {
      localStorage.removeItem("guestCart");
      return 0;
    }
    return cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  };

  // Fetch cart count on mount and when user changes
  const refreshCart = async () => {
    if (user) {
      // Registered user: fetch from API
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3001/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCartCount(data.items?.length || 0);
      } else {
        setCartCount(0);
      }
    } else {
      setCartCount(getGuestCartCount());
    }
  };

  useEffect(() => {
    refreshCart();
    // Listen for cart updates (custom event)
    const handler = () => refreshCart();
    window.addEventListener("cartUpdated", handler);
    window.addEventListener("storage", (e) => {
      if (e.key === "guestCart") refreshCart();
    });
    return () => {
      window.removeEventListener("cartUpdated", handler);
    };
  }, [user]);

  // Add to cart logic
  const addToCart = async (productId: string, quantity = 1) => {
    if (user) {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3001/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, quantity }),
      });
      if (!res.ok) throw new Error("Failed to add to cart");
    } else {
      // Guest: localStorage
      let cart: CartItem[] = JSON.parse(localStorage.getItem("guestCart") || "[]");
      const idx = cart.findIndex((item) => item.productId === productId);
      if (idx > -1) cart[idx].quantity += quantity;
      else cart.push({ productId, quantity });
      localStorage.setItem("guestCart", JSON.stringify(cart));
    }
    window.dispatchEvent(new Event("cartUpdated"));
    refreshCart();
  };

  // Clear cart logic for guest
  const clearCart = () => {
    if (!user) {
      localStorage.removeItem("guestCart");
      setCartCount(0);
      window.dispatchEvent(new Event("cartUpdated"));
    }
  };

  return (
    <CartContext.Provider value={{ cartCount, refreshCart, addToCart }}>
      {children}
    </CartContext.Provider>
  );
}; 