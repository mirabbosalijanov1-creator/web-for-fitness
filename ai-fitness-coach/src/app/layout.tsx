import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { AppProviders } from "@/components/layout/AppProviders";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PulseForge | AI Fitness Coach",
  description:
    "Collect data once, let free AI models build and adapt your weekly training plan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-slate-950">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50 antialiased`}
      >
        <AppProviders>
          <SiteHeader />
          <main className="min-h-[calc(100vh-160px)]">{children}</main>
          <SiteFooter />
        </AppProviders>
      </body>
    </html>
  );
}
