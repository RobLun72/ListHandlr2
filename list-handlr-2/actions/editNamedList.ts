"use server";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { ApiResponse, ApiData } from "@/DTO/apiData";
import { OneListPostData, NamedListData } from "@/DTO/oneListData";
import { formatDate } from "@/Helpers/formatDate";
import { DbFactory } from "./dbHandling/baseDbFactory";
import {
  NamedListItem,
  NamedListResponse,
} from "./dbHandling/baseDbInterfaces";

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
  name: string
): Promise<ApiResponse<ApiData<NamedListData>>> {
  const db = DbFactory.createDbQueries();
  const namedListData = await db.getListDataForNamedList(name);
  const maxStamp = formatDate(namedListData.namedList.last_item_update!) || "";

  return {
    message: "",
    data: formatAllLists(maxStamp, namedListData.listItems),
  };
}

async function deleteListItem(row: NamedListData) {
  const db = DbFactory.createDbQueries();
  await db.deleteListItemToDb(row);
}
async function addListItem(row: NamedListData, listId: number) {
  const db = DbFactory.createDbQueries();
  await db.addListItemToDb(row, listId);
}
async function editListItem(
  row: NamedListData,
  namedListData: NamedListResponse
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
    const db = DbFactory.createDbQueries();
    await db.editListItemToDb(row, namedListData.namedList.id);
  }
}

async function editListLastUpdated(listId: number) {
  const db = DbFactory.createDbQueries();
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

  let result: ApiResponse<ApiData<NamedListData>>;
  const db = DbFactory.createDbQueries();
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
        await deleteListItem(item);
      }
      if (item.id === 0) {
        // add item
        await addListItem(item, namedListData.namedList.id);
      }
      if (item.id > 0) {
        // edit item

        await editListItem(item, namedListData);
      }
    }

    await editListLastUpdated(namedListData.namedList.id);

    result = await formatNamedListResponse(decodedListName);
  }

  return new Promise((resolve) => {
    resolve(result);
  });
}
