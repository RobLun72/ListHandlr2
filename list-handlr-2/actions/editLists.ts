"use server";

import { headers } from "next/headers";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { AllListsPostData, ListData } from "@/DTO/listsData";
import { ApiResponse, ApiData } from "@/DTO/apiData";

export async function editLists(
  dataToPost: AllListsPostData
): Promise<ApiResponse<ApiData<ListData>>> {
  const { isAuthenticated } = getKindeServerSession();
  const isUserAuthenticated = await isAuthenticated();

  if (!isUserAuthenticated && process.env.NEXT_PUBLIC_AUTH_ACTIVE === "true") {
    return Promise.reject(new Error("User is not authenticated."));
  }

  const headerList = await headers();
  const pathname = headerList.get("x-current-path");
  console.log("Editing list:", dataToPost, pathname);
  const envVariable = process.env.NEXT_PUBLIC_BACK_END_URL;

  const data = await fetch(`${envVariable}`, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify(dataToPost),
  });
  const result: ApiResponse<ApiData<ListData>> = await data.json();

  return new Promise((resolve) => {
    //setTimeout(() => {
    resolve(result);
    //}, 500);
  });
}
