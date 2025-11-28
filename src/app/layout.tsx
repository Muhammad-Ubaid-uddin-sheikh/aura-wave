import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import AppProvider from "@/context/AppProvider";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  title: "Aura Wave",
  description: "Aura Wave – Bold Timepiece for Fearless Style — Engineered for presence, built for durability. Available now in Pakistan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Favicon */}
        <link rel="icon" href="/assets/favicon-icon.svg" />
      </head>
      <body
        className={`antialiased font-poppinsRegular`}
      >
        <AppProvider>
        <Toaster/>
        {children}
        </AppProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
