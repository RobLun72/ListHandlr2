import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";

export default function middleware(req: Request) {
  return withAuth(req, {
    // Middleware still runs on all routes, but doesn't protect the routes in the array}
    publicPaths:
      process.env.NEXT_PUBLIC_AUTH_ACTIVE === "true"
        ? ["/", "/about"]
        : ["/", "/lists", "/about"],
  });
}

export const config = {
  matcher: [
    // Run on everything but Next internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
