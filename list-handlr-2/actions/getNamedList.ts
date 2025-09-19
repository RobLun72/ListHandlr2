"use server";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { ApiData } from "@/DTO/apiData";
import { NamedListData } from "@/DTO/oneListData";
import { formatDate } from "@/Helpers/formatDate";
import { OneListDbFactory } from "@/db/queries/oneList/oneListDbFactory";

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

  const db = OneListDbFactory.createDbQueries();
  const namedListData = await db.getListDataForNamedList(decodedListName);

  const result: ApiData<NamedListData> = {
    timeStamp: formatDate(namedListData.namedList?.last_item_update) || "",
    rows: namedListData.listItems.map((item) => ({
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
