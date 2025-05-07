import { chainMiddleware } from "./Middleware/chainMiddleware";
import { withXUrlHeader } from "./Middleware/withXUrlHeader";
import { withKindeAuth } from "./Middleware/withAuth";

export default chainMiddleware([withXUrlHeader, withKindeAuth]);

export const config = {
  matcher: [
    // Run on everything but Next internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
