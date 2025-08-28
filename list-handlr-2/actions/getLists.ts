"use server";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { ListData } from "@/DTO/listsData";
import { ApiData } from "@/DTO/apiData";
import { db } from "@/db/index";
import { listsTable } from "@/db/schema";
import { max } from "@/Helpers/sortAndFilter";
import { formatDate } from "@/Helpers/formatDate";

export async function getLists(): Promise<ApiData<ListData>> {
  const { isAuthenticated } = getKindeServerSession();
  const isUserAuthenticated = await isAuthenticated();

  if (!isUserAuthenticated && process.env.NEXT_PUBLIC_AUTH_ACTIVE === "true") {
    return Promise.reject(new Error("User is not authenticated."));
  }

  const allLists = await db.select().from(listsTable).orderBy(listsTable.index);
  const maxStamp = formatDate(max(allLists, "last_update")!.last_update!) || "";

  const result: ApiData<ListData> = {
    timeStamp: maxStamp,
    rows: allLists.map((list) => ({
      index: list.index,
      listName: list.list_name,
      id: list.id,
    })),
  };

  return new Promise((resolve) => {
    resolve(result);
  });
}
