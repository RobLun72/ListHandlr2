"use server";

//import { headers } from "next/headers";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { ListData } from "@/DTO/listsData";
import { ApiData } from "@/DTO/apiData";

export async function getLists(): Promise<ApiData<ListData>> {
  const { isAuthenticated } = getKindeServerSession();
  const isUserAuthenticated = await isAuthenticated();

  if (!isUserAuthenticated && process.env.NEXT_PUBLIC_AUTH_ACTIVE === "true") {
    return Promise.reject(new Error("User is not authenticated."));
  }

  //const headerList = await headers();
  //const pathname = headerList.get("x-current-path");

  const envVariable = process.env.BACK_END_URL;
  const baseQuery = "?type=Lists";

  //console.log("Getting list:", `${envVariable}${baseQuery}`, pathname);

  const data = await fetch(`${envVariable}${baseQuery}`);
  const result: ApiData<ListData> = await data.json();

  return new Promise((resolve) => {
    //setTimeout(() => {
    resolve(result);
    //}, 500);
  });
}
