"use server";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { ApiResponse, ApiData } from "@/DTO/apiData";
import { listsCollaborationsTable, listsTable } from "@/db/schema";
import { formatDate } from "@/Helpers/formatDate";
import { db } from "@/db/index";
import { eq } from "drizzle-orm";
import { CollabData, CollabPostData } from "@/DTO/collabData";
import {
  getCollabDataForNamedList,
  NamedListCollab,
  NamedListCollabResponse,
} from "./baseDbQueries";

function formatAllLists(
  timestamp: string,
  data: NamedListCollab[]
): ApiData<CollabData> {
  return {
    timeStamp: timestamp,
    rows: data.map((item) => ({
      user_id: item.user_id,
      id: item.id,
      list_id: item.list_id,
    })),
  };
}

function checkValidTimestamp(
  namedListData: NamedListCollabResponse,
  dataToPost: CollabPostData
) {
  const maxStamp = formatDate(namedListData.namedList.last_item_update!) || "";

  if (maxStamp !== dataToPost.item.timeStamp) {
    const responseLists: ApiResponse<ApiData<CollabData>> = {
      message: "Timestamp mismatch",
      data: formatAllLists(maxStamp, namedListData.listItems),
    };
    return responseLists;
  }

  return undefined;
}

async function formatNamedListResponse(
  name: string
): Promise<ApiResponse<ApiData<CollabData>>> {
  const namedListData = await getCollabDataForNamedList(name);
  const maxStamp = formatDate(namedListData.namedList.last_item_update!) || "";

  return {
    message: "",
    data: formatAllLists(maxStamp, namedListData.listItems),
  };
}

async function deleteCollabs(list_id: number) {
  await db
    .delete(listsCollaborationsTable)
    .where(eq(listsCollaborationsTable.list_id, list_id));
}

async function addCollabItem(userId: string, listId: number) {
  await db.insert(listsCollaborationsTable).values({
    list_id: listId,
    user_id: userId,
  });
}

async function editListLastUpdated(listId: number) {
  await db
    .update(listsTable)
    .set({ last_item_update: new Date() })
    .where(eq(listsTable.id, listId));
}

export async function editNamedListCollab(
  dataToPost: CollabPostData
): Promise<ApiResponse<ApiData<CollabData>>> {
  const { isAuthenticated } = getKindeServerSession();
  const isUserAuthenticated = await isAuthenticated();

  if (!isUserAuthenticated && process.env.NEXT_PUBLIC_AUTH_ACTIVE === "true") {
    return Promise.reject(new Error("User is not authenticated."));
  }

  let result: ApiResponse<ApiData<CollabData>>;
  const namedListData = await getCollabDataForNamedList(dataToPost.listName);

  const invalidTimestamp = checkValidTimestamp(namedListData, dataToPost);
  if (invalidTimestamp !== undefined) {
    result = invalidTimestamp;
  } else {
    await deleteCollabs(namedListData.namedList.id);
    for (const item of dataToPost.item.rows) {
      // add item
      await addCollabItem(item, namedListData.namedList.id);
    }

    await editListLastUpdated(namedListData.namedList.id);

    result = await formatNamedListResponse(dataToPost.listName);
  }

  return new Promise((resolve) => {
    resolve(result);
  });
}
