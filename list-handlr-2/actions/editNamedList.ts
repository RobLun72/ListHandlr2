"use server";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { ApiResponse, ApiData } from "@/DTO/apiData";
import { OneListPostData, NamedListData } from "@/DTO/oneListData";
import { formatDate } from "@/Helpers/formatDate";
import { DbFactory } from "../db/queries/DbFactory";
import {
  DbQueriesInterface,
  NamedListItem,
  NamedListResponse,
} from "../db/queries/DbInterfaces";

function formatAllLists(
  timestamp: string,
  data: NamedListItem[]
): ApiData<NamedListData> {
  return {
    timeStamp: timestamp,
    rows: data.map((item) => ({
      index: item.index,
      text: item.text,
      done: item.done === "true",
      link: item.link,
      id: item.id,
      isDeleted: false,
    })),
  };
}

function checkValidTimestamp(
  namedListData: NamedListResponse,
  dataToPost: OneListPostData
) {
  const maxStamp = formatDate(namedListData.namedList.last_item_update!) || "";

  if (maxStamp !== dataToPost.item.timeStamp) {
    const responseLists: ApiResponse<ApiData<NamedListData>> = {
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
): Promise<ApiResponse<ApiData<NamedListData>>> {
  const namedListData = await db.getListDataForNamedList(name);
  const maxStamp = formatDate(namedListData.namedList.last_item_update!) || "";

  return {
    message: "",
    data: formatAllLists(maxStamp, namedListData.listItems),
  };
}

async function deleteListItem(row: NamedListData, db: DbQueriesInterface) {
  await db.deleteListItemToDb(row);
}
async function addListItem(
  row: NamedListData,
  listId: number,
  db: DbQueriesInterface
) {
  await db.addListItemToDb(row, listId);
}
async function editListItem(
  row: NamedListData,
  namedListData: NamedListResponse,
  db: DbQueriesInterface
) {
  const existingItem = namedListData.listItems.find(
    (item) => item.id === row.id
  )!;
  const rowDone = row.done ? "true" : "false";
  if (
    existingItem.index !== row.index ||
    existingItem.text !== row.text ||
    existingItem.done !== rowDone ||
    existingItem.link !== row.link
  ) {
    await db.editListItemToDb(row, namedListData.namedList.id);
  }
}

async function editListLastUpdated(listId: number, db: DbQueriesInterface) {
  await db.editListLastUpdatedToDb(listId);
}

export async function editNamedList(
  dataToPost: OneListPostData
): Promise<ApiResponse<ApiData<NamedListData>>> {
  const { isAuthenticated } = getKindeServerSession();
  const isUserAuthenticated = await isAuthenticated();

  if (!isUserAuthenticated && process.env.NEXT_PUBLIC_AUTH_ACTIVE === "true") {
    return Promise.reject(new Error("User is not authenticated."));
  }
  // URL decode the listName parameter
  const decodedListName = decodeURIComponent(dataToPost.listName);

  const db = DbFactory.createDbQueries();

  let result: ApiResponse<ApiData<NamedListData>>;
  const namedListData = await db.getListDataForNamedList(decodedListName);
  const allItemsAreNew = dataToPost.item.rows.every((item) => item.id === 0);

  const invalidTimestamp = allItemsAreNew
    ? undefined
    : checkValidTimestamp(namedListData, dataToPost);
  if (invalidTimestamp !== undefined) {
    result = invalidTimestamp;
  } else {
    for (const item of dataToPost.item.rows) {
      if (item.isDeleted) {
        // delete item
        await deleteListItem(item, db);
      }
      if (item.id === 0) {
        // add item
        await addListItem(item, namedListData.namedList.id, db);
      }
      if (item.id > 0) {
        // edit item

        await editListItem(item, namedListData, db);
      }
    }

    await editListLastUpdated(namedListData.namedList.id, db);

    result = await formatNamedListResponse(decodedListName, db);
  }

  return new Promise((resolve) => {
    resolve(result);
  });
}
