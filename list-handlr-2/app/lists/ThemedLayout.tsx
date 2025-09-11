"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ThemedLayoutProps {
  children: React.ReactNode;
}

export function ThemedLayout({ children }: ThemedLayoutProps) {
  const { theme } = useTheme();

  return (
    <>
      <div
        className="flex"
        style={{
          position: "relative",
          height: 80 + "px",
          width: "100%",
          paddingLeft: "1px",
        }}
      >
        <Image
          src={theme === "appBlue" ? "/todoBlue.png" : "/todoGreen.png"}
          alt="todo"
          width={0}
          height={0}
          sizes="100vw"
          style={{ width: "100%", height: "80" }}
        />
      </div>
      <div
        className={cn(
          `border-4 border-solid`,
          theme === "appBlue" ? "border-appBlue" : "border-appGreen"
        )}
        style={{
          marginTop: "-27px",
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
