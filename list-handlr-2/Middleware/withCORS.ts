import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

import { MiddlewareFactory } from "./types";

export const withCORS: MiddlewareFactory = (next) => {
  return async (request: NextRequest, event: NextFetchEvent) => {
    const origin = request.headers.get("origin");

    // Define allowed origins dynamically
    const allowedOrigins =
      process.env.NODE_ENV === "production"
        ? [
            "https://list-handlr2.vercel.app/*",
            "https://listhandlr.kinde.com/*",
          ]
        : ["http://localhost:3000", "http://localhost:3001"];

    const isAllowedOrigin = origin && allowedOrigins.includes(origin);

    // Handle preflight requests
    if (request.method === "OPTIONS") {
      return new NextResponse<unknown>(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": isAllowedOrigin ? origin : "null",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Allow-Credentials": "true",
          "Access-Control-Max-Age": "86400",
        },
      });
    }
    // Continue with the request and add CORS headers to the response
    const response = await next(request, event);

    if (isAllowedOrigin) {
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Access-Control-Allow-Credentials", "true");
    }

    return response;
  };
};
