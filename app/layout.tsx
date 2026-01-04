import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ArcanusLoader from "@/components/ui/ArcanusLoader";
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
  title: "Arcanus",
  description: "A simple, private chatroom app.",
  icons: {
    icon: "/favicon-v2.ico",
  },
  verification: {
    google: "UrqQlbrKgPXsxDjV-0cleR7W7eoSW7J9v1pmY6iHSQU",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ArcanusLoader />
        {children}
      </body>
    </html>
  );
}
