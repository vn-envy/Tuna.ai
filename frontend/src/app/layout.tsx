import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Tuna.ai | AI Travel Planning for Creators",
    template: "%s | Tuna.ai",
  },
  description:
    "Plan creator-ready trips with AI support for photogenic places, golden-hour itineraries, budgets, and partnership outreach.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
