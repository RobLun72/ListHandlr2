import { handleAuth } from "@kinde-oss/kinde-auth-nextjs/server";

import { NextResponse } from "next/server";

const mockAuthHandler = async () => {
  // Return a mock response when auth is disabled
  return NextResponse.json({
    message: "Authentication is disabled in development",
    status: "disabled",
  });
};

export const GET =
  process.env.NEXT_PUBLIC_AUTH_ACTIVE === "true"
    ? handleAuth()
    : mockAuthHandler;
