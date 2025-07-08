"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

type WishlistContextType = {
  wishlist: string[];
  refreshWishlist: () => void;
  toggleWishlist: (productId: string) => Promise<void>;
};

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
};

export const WishlistProvider: React.FC<{ user: any; children: React.ReactNode }> = ({ user, children }) => {
  const [wishlist, setWishlist] = useState<string[]>([]);

  const refreshWishlist = async () => {
    if (!user) {
      setWishlist([]);
      return;
    }
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:3001/api/wishlist", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setWishlist(data.wishlistItems?.map((item: any) => item.product.id) || []);
    } else {
      setWishlist([]);
    }
  };

  useEffect(() => {
    refreshWishlist();
    const handler = () => refreshWishlist();
    window.addEventListener("wishlistUpdated", handler);
    return () => window.removeEventListener("wishlistUpdated", handler);
  }, [user]);

  const toggleWishlist = async (productId: string) => {
    if (!user) throw new Error("Login required");
    const isInWishlist = wishlist.includes(productId);
    const url = isInWishlist
      ? `http://localhost:3001/api/wishlist/remove/${productId}`
      : `http://localhost:3001/api/wishlist/add/${productId}`;
    const method = isInWishlist ? "DELETE" : "POST";
    const token = localStorage.getItem("token");
    const res = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to update wishlist");
    window.dispatchEvent(new Event("wishlistUpdated"));
    refreshWishlist();
  };

  return (
    <WishlistContext.Provider value={{ wishlist, refreshWishlist, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}; 