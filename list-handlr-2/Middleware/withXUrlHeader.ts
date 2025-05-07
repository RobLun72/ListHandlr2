import { NextFetchEvent, NextRequest } from "next/server";

import { MiddlewareFactory } from "./types";

export const withXUrlHeader: MiddlewareFactory = (next) => {
  return async (request: NextRequest, event: NextFetchEvent) => {
    // Add a new header x-current-path which passes the path to downstream components
    const response = await next(request, event);
    response.headers.set("x-current-path", request.nextUrl.pathname);

    return response;
  };
};
