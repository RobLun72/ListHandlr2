"use server";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { ApiResponse, ApiData } from "@/DTO/apiData";
import { formatDate } from "@/Helpers/formatDate";
import { CollabData, CollabPostData } from "@/DTO/collabData";
import {
  DbQueriesInterface,
  NamedListCollab,
  NamedListCollabResponse,
} from "../db/queries/DbInterfaces";
import { DbFactory } from "../db/queries/DbFactory";

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
  name: string,
  db: DbQueriesInterface
): Promise<ApiResponse<ApiData<CollabData>>> {
  const namedListData = await db.getCollabDataForNamedList(name);
  const maxStamp = formatDate(namedListData.namedList.last_item_update!) || "";

  return {
    message: "",
    data: formatAllLists(maxStamp, namedListData.listItems),
  };
}

async function deleteCollabs(list_id: number, db: DbQueriesInterface) {
  await db.deleteCollabsToDb(list_id);
}

async function addCollabItem(
  userId: string,
  listId: number,
  db: DbQueriesInterface
) {
  await db.addCollabItemToDb(userId, listId);
}

async function editCollabListLastUpdated(
  listId: number,
  db: DbQueriesInterface
) {
  await db.editCollabListLastUpdatedToDb(listId);
}

export async function editNamedListCollab(
  dataToPost: CollabPostData
): Promise<ApiResponse<ApiData<CollabData>>> {
  const { isAuthenticated } = getKindeServerSession();
  const isUserAuthenticated = await isAuthenticated();

  if (!isUserAuthenticated && process.env.NEXT_PUBLIC_AUTH_ACTIVE === "true") {
    return Promise.reject(new Error("User is not authenticated."));
  }

  // URL decode the listName parameter
  const decodedListName = decodeURIComponent(dataToPost.listName);

  const db = DbFactory.createDbQueries();

  let result: ApiResponse<ApiData<CollabData>>;
  const namedListData = await db.getCollabDataForNamedList(decodedListName);

  const invalidTimestamp = checkValidTimestamp(namedListData, dataToPost);
  if (invalidTimestamp !== undefined) {
    result = invalidTimestamp;
  } else {
    await deleteCollabs(namedListData.namedList.id, db);
    for (const item of dataToPost.item.rows) {
      // add item
      await addCollabItem(item, namedListData.namedList.id, db);
    }

    await editCollabListLastUpdated(namedListData.namedList.id, db);

    result = await formatNamedListResponse(decodedListName, db);
  }

  return new Promise((resolve) => {
    resolve(result);
  });
}
