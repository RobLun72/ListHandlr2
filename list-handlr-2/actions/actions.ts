"use server";

import { headers } from "next/headers";

export async function runServerAction(message: string): Promise<{
  message: string;
}> {
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
