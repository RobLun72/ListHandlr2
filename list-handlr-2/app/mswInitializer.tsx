"use client";

import { useEffect } from "react";

export function MSWInitializer() {
  useEffect(() => {
    if (
      process.env.NODE_ENV === "development" &&
      process.env.NEXT_PUBLIC_ENABLE_MSW_MOCKING === "true"
    ) {
      import("../MSW").then(({ setupMocks }) => setupMocks());
    }
  }, []);

  return null; // This component doesn't render anything
}
