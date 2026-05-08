import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tuna — Plan once. Tuna keeps swimming.",
  description:
    "A migratory AI travel agent. Plan a trip once — Tuna keeps swimming, monitoring prices, schedules, weather, and advisories, and replans the moment something shifts.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
