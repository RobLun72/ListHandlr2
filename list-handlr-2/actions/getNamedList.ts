"use server";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { ApiData } from "@/DTO/apiData";
import { NamedListData } from "@/DTO/oneListData";
import { db } from "@/db/index";
import { listItemsTable, listsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { formatDate } from "@/Helpers/formatDate";

export async function getNamedList(listName: {
  listName: string;
}): Promise<ApiData<NamedListData>> {
  const { isAuthenticated } = getKindeServerSession();
  const isUserAuthenticated = await isAuthenticated();

  if (!isUserAuthenticated && process.env.NEXT_PUBLIC_AUTH_ACTIVE === "true") {
    return Promise.reject(new Error("User is not authenticated."));
  }

  // URL decode the listName parameter
  const decodedListName = decodeURIComponent(listName.listName);

  const namedList = await db
    .select()
    .from(listsTable)
    .where(eq(listsTable.list_name, decodedListName));

  const listItems = await db
    .select()
    .from(listItemsTable)
    .where(eq(listItemsTable.list_id, namedList[0]?.id))
    .orderBy(listItemsTable.index);

  const result: ApiData<NamedListData> = {
    timeStamp: formatDate(namedList[0]?.last_item_update) || "",
    rows: listItems.map((item) => ({
      index: item.index,
      text: item.text,
      done: item.done === "true",
      link: item.link,
      id: item.id,
      isDeleted: false,
    })),
  };

  return new Promise((resolve) => {
    resolve(result);
  });
}
