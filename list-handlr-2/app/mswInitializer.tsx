"use client";

import { useEffect } from "react";

export function MSWInitializer() {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      import("../MSW").then(({ setupMocks }) => setupMocks());
    }
  }, []);

  return null; // This component doesn't render anything
}
