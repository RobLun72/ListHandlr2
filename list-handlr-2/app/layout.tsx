import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/contexts/UserContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ThemedLayout } from "./ThemedLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ListHandler2",
  description: "my list app",
  icons: {
    icon: "/listHandlr.png",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased  bg-appWhite min-w-[370px] md:min-w-6xl max-w-full`}
      >
        <UserProvider>
          <ThemeProvider>
            <ThemedLayout>{children}</ThemedLayout>
          </ThemeProvider>
        </UserProvider>
      </body>
    </html>
  );
}
