"use server";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { AllListsPostData, ListData } from "@/DTO/listsData";
import { ApiResponse, ApiData } from "@/DTO/apiData";
import { max } from "@/Helpers/sortAndFilter";
import { formatDate } from "@/Helpers/formatDate";
import { AllListRecord, DbQueriesInterface } from "../db/queries/DbInterfaces";
import { DbFactory } from "../db/queries/DbFactory";

function formatAllLists(
  timestamp: string,
  data: AllListRecord[]
): ApiData<ListData> {
  return {
    timeStamp: timestamp,
    rows: data.map((list) => ({
      index: list.index,
      listName: list.list_name,
      id: list.id,
    })),
  };
}

async function formatAllListsResponse(
  user_id: string,
  db: DbQueriesInterface
): Promise<ApiResponse<ApiData<ListData>>> {
  const allLists = await db.getAllListsForUser(user_id);

  const maxStamp = formatDate(max(allLists, "last_update")!.last_update!) || "";

  return {
    message: "",
    data: formatAllLists(maxStamp, allLists),
  };
}

function checkValidTimestamp(
  allLists: AllListRecord[],
  dataToPost: AllListsPostData
) {
  const maxStamp = formatDate(max(allLists, "last_update")!.last_update!) || "";

  if (maxStamp !== dataToPost.item.timeStamp) {
    const responseLists: ApiResponse<ApiData<ListData>> = {
      message: "Timestamp mismatch",
      data: formatAllLists(maxStamp, allLists),
    };
    return responseLists;
  }

  return undefined;
}

async function editList(
  item: ListData,
  allLists: AllListRecord[],
  db: DbQueriesInterface
) {
  const row = allLists.find((list) => list.id === item.id);
  if (!row) throw new Error("List not found");

  if (item.index !== row.index || item.listName !== row.list_name) {
    await db.editListToDb(item);
  }
}

async function addList(
  item: ListData,
  user_id: string,
  db: DbQueriesInterface
) {
  await db.addListToDb(item, user_id);
}

async function deleteList(item: ListData, db: DbQueriesInterface) {
  await db.deleteListToDb(item);
}

export async function editLists(
  dataToPost: AllListsPostData
): Promise<ApiResponse<ApiData<ListData>>> {
  const { isAuthenticated } = getKindeServerSession();
  const isUserAuthenticated = await isAuthenticated();

  if (!isUserAuthenticated && process.env.NEXT_PUBLIC_AUTH_ACTIVE === "true") {
    return Promise.reject(new Error("User is not authenticated."));
  }

  const db = DbFactory.createDbQueries();

  let result: ApiResponse<ApiData<ListData>>;
  const allLists = await db.getAllListsForUser(dataToPost.user_id);

  const invalidTimestamp = checkValidTimestamp(allLists, dataToPost);

  if (invalidTimestamp !== undefined) {
    result = invalidTimestamp;
  } else {
    for (const item of dataToPost.item.rows) {
      if (item.isDeleted) {
        // delete item
        await deleteList(item, db);
      }
      if (item.id === 0) {
        // add item
        await addList(item, dataToPost.user_id, db);
      }
      if (item.id > 0) {
        // edit item
        await editList(item, allLists, db);
      }
    }

    result = await formatAllListsResponse(dataToPost.user_id, db);
  }

  return new Promise((resolve) => {
    resolve(result);
  });
}
