"use server";

import { headers } from "next/headers";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { ApiResponse, ApiData } from "@/DTO/apiData";
import { OneListPostData, NamedListData } from "@/DTO/oneListData";

export async function editNamedList(
  dataToPost: OneListPostData
): Promise<ApiResponse<ApiData<NamedListData>>> {
  const { isAuthenticated } = getKindeServerSession();
  const isUserAuthenticated = await isAuthenticated();

  if (!isUserAuthenticated && process.env.NEXT_PUBLIC_AUTH_ACTIVE === "true") {
    return Promise.reject(new Error("User is not authenticated."));
  }

  const headerList = await headers();
  const pathname = headerList.get("x-current-path");
  console.log("Editing named list:", dataToPost, pathname);
  const envVariable = process.env.NEXT_PUBLIC_BACK_END_URL;

  const data = await fetch(`${envVariable}`, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify(dataToPost),
  });
  const result: ApiResponse<ApiData<NamedListData>> = await data.json();

  return new Promise((resolve) => {
    //setTimeout(() => {
    resolve(result);
    //}, 500);
  });
}
