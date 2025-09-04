import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppMenu } from "./menu";
import { Toaster } from "@/components/ui/sonner";
import { MSWInitializer } from "./mswInitializer";
import { UserProvider } from "@/contexts/UserContext";

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
          {/* Initialize MSW */}
          <MSWInitializer />
          <div className="bg-appBlue w-full">
            <div className="flex flex-col justify-center items-center">
              <AppMenu />
            </div>
          </div>
          <div className="flex flex-col justify-center items-center px-1 w-full">
            {children}
            <Toaster />
          </div>
        </UserProvider>
      </body>
    </html>
  );
}
