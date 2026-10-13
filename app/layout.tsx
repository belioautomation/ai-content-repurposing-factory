import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import DashboardSidebar from "../components/DashboardSidebar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Content Repurposing Factory | ContentFlow",
  description:
    "Repurpose your content into platform-specific drafts using AI and n8n automation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#080d17] text-slate-100">
        <DashboardSidebar />
        <div className="min-w-0 lg:ml-64">{children}</div>
      </body>
    </html>
  );
}
