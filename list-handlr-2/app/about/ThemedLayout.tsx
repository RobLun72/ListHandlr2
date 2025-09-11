"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

interface ThemedLayoutProps {
  children: React.ReactNode;
}

export function ThemedLayout({ children }: ThemedLayoutProps) {
  const { theme } = useTheme();

  return (
    <>
      <div
        className={cn(
          `border-4 border-solid`,
          theme === "appBlue" ? "border-appBlue" : "border-appGreen"
        )}
        style={{
          marginTop: "10px",
          marginLeft: "1px",
          width: "100%",
          minHeight: "80vh",
        }}
      >
        {children}
      </div>
    </>
  );
}
