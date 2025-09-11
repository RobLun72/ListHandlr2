"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { AppMenu } from "./menu";
import { Toaster } from "@/components/ui/sonner";
import { MSWInitializer } from "./mswInitializer";
import { cn } from "@/lib/utils";

interface ThemedLayoutProps {
  children: React.ReactNode;
}

export function ThemedLayout({ children }: ThemedLayoutProps) {
  const { theme } = useTheme();

  return (
    <>
      {/* Initialize MSW */}
      <MSWInitializer />
      <div
        className={cn(
          `w-full`,
          theme === "appBlue" ? "bg-appBlue" : "bg-appGreen"
        )}
      >
        <div className="flex flex-col justify-center items-center">
          <AppMenu />
        </div>
      </div>
      <div className="flex flex-col justify-center items-center px-1 w-full">
        {children}
        <Toaster />
      </div>
    </>
  );
}
