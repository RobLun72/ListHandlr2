import { handleAuth } from "@kinde-oss/kinde-auth-nextjs/server";

export const GET =
  process.env.NEXT_PUBLIC_AUTH_ACTIVE === "true" ? handleAuth() : undefined;
