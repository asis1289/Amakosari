import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { UserProvider, useUser } from "../UserContext";
import { CartProvider } from "@/components/CartContext";
import { WishlistProvider } from "@/components/WishlistContext";
import AppProviders from "./components/AppProviders";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "आमाको Saaरी - Nepali Cultural Dresses",
  description: "आमाको Saaरी: Authentic Nepali saaris and cultural dresses. Handcrafted, traditional, and modern styles for every woman.",
  keywords: "Nepali saari, आमाको Saaरी, traditional dress, Nepali clothing, saari, kurta, daura suruwal, gunyo cholo, wedding dress",
  authors: [{ name: "आमाको Saaरी" }],
  openGraph: {
    title: "आमाको Saaरी - Nepali Cultural Dresses",
    description: "आमाको Saaरी: Authentic Nepali saaris and cultural dresses. Handcrafted, traditional, and modern styles for every woman.",
    type: "website",
    locale: "ne_NP",
  },
};

function Providers({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  if (loading) return null; // Optionally show a loader
  return (
    <CartProvider user={user}>
      <WishlistProvider user={user}>
        {children}
      </WishlistProvider>
    </CartProvider>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${geistMono.variable} antialiased`}>
        <UserProvider>
          <AppProviders>
            <div className="min-h-screen flex flex-col">
              <Navigation />
              <main className="flex-grow">
                {children}
              </main>
              <Footer />
            </div>
          </AppProviders>
        </UserProvider>
      </body>
    </html>
  );
}
