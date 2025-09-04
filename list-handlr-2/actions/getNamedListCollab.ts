"use server";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { ApiData } from "@/DTO/apiData";
import { formatDate } from "@/Helpers/formatDate";
import { CollabData } from "@/DTO/collabData";
import { getCollabDataForNamedList } from "./baseDbQueries";

export async function getNamedListCollab(listName: {
  listName: string;
}): Promise<ApiData<CollabData>> {
  const { isAuthenticated } = getKindeServerSession();
  const isUserAuthenticated = await isAuthenticated();

  if (!isUserAuthenticated && process.env.NEXT_PUBLIC_AUTH_ACTIVE === "true") {
    return Promise.reject(new Error("User is not authenticated."));
  }

  // URL decode the listName parameter
  const decodedListName = decodeURIComponent(listName.listName);

  const namedListCollabData = await getCollabDataForNamedList(decodedListName);

  const result: ApiData<CollabData> = {
    timeStamp:
      formatDate(namedListCollabData.namedList?.last_item_update) || "",
    rows: namedListCollabData.listItems.map((item) => ({
      user_id: item.user_id,
      id: item.id,
      list_id: item.list_id,
    })),
  };

  return new Promise((resolve) => {
    resolve(result);
  });
}
