"use client";
import { useUser } from "@/UserContext";
import { CartProvider } from "@/components/CartContext";
import { WishlistProvider } from "@/components/WishlistContext";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  if (loading) return null; // Or a loader
  return (
    <CartProvider user={user}>
      <WishlistProvider user={user}>
        {children}
      </WishlistProvider>
    </CartProvider>
  );
} 