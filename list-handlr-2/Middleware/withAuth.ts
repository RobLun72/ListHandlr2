import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";
import { MiddlewareFactory } from "./types";

export const withKindeAuth: MiddlewareFactory = (next) => {
  return async (request: NextRequest, event: NextFetchEvent) => {
    await next(request, event);

    return withAuth(request, {
      // Middleware still runs on all routes, but doesn't protect the routes in the array}
      publicPaths:
        process.env.NEXT_PUBLIC_AUTH_ACTIVE === "true"
          ? ["/", "/about"]
          : ["/", "/lists", "/about"],
    }) as Promise<NextResponse<unknown>>;
  };
};
