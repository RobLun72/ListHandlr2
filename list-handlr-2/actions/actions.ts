"use server";

import { headers } from "next/headers";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function runServerAction(message: string): Promise<{
  message: string;
}> {
  const { isAuthenticated } = getKindeServerSession();
  const isUserAuthenticated = await isAuthenticated();

  if (!isUserAuthenticated && process.env.NEXT_PUBLIC_AUTH_ACTIVE === "true") {
    return Promise.reject(new Error("User is not authenticated."));
  }

  const headerList = await headers();
  const pathname = headerList.get("x-current-path");
  console.log(
    "serverAction called with message:",
    message,
    "pathname:",
    pathname
  );

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        message:
          "serverAction resolved with message:" +
          message +
          " from: " +
          pathname,
      });
    }, 500);
  });
}
