import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

/**
 * ADMIN DASHBOARD — Root Layout
 *
 * Font strategy:
 *   DM Sans         → --font-dm-sans  → picked up by --font-sans in globals.css
 *   JetBrains Mono  → --font-jetbrains-mono → picked up by --font-mono
 *
 * DM Sans chosen for admin: excellent legibility at small sizes,
 * clear table column readability, strong hierarchy in dense UIs.
 */

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
  // All weights used in admin dashboard typography
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
  // Used for: order IDs, SKUs, product codes, numeric data
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | PC Store Admin",
    default: "PC Store Admin Dashboard",
  },
  description: "Back-office administration dashboard — manage orders, products, inventory, and customers.",
  robots: {
    index: false,  // Admin must not be indexed by search engines
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
