"use server";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { AllListsPostData, ListData } from "@/DTO/listsData";
import { ApiResponse, ApiData } from "@/DTO/apiData";
import { db } from "@/db/index";
import { listItemsTable, listsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { max } from "@/Helpers/sortAndFilter";
import { formatDate } from "@/Helpers/formatDate";

interface AllListRecord {
  id: number;
  index: number;
  list_name: string;
  last_update: Date;
  last_item_update: Date;
}

async function getAllListsFromDB(): Promise<AllListRecord[]> {
  const allLists = await db.select().from(listsTable).orderBy(listsTable.index);
  return allLists;
}

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

async function formatAllListsResponse(): Promise<
  ApiResponse<ApiData<ListData>>
> {
  const allLists = await getAllListsFromDB();
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

async function editList(item: ListData, allLists: AllListRecord[]) {
  const row = allLists.find((list) => list.id === item.id);
  if (!row) throw new Error("List not found");

  if (item.index !== row.index || item.listName !== row.list_name) {
    await db
      .update(listsTable)
      .set({
        index: item.index,
        list_name: item.listName,
        last_update: new Date(),
      })
      .where(eq(listsTable.id, item.id));
  }
}

async function addList(item: ListData) {
  await db.insert(listsTable).values({
    index: item.index,
    list_name: item.listName!,
    last_update: new Date(),
    last_item_update: new Date(),
  });
}

async function deleteList(item: ListData) {
  await db.delete(listItemsTable).where(eq(listItemsTable.list_id, item.id));

  await db.delete(listsTable).where(eq(listsTable.id, item.id));
}

export async function editLists(
  dataToPost: AllListsPostData
): Promise<ApiResponse<ApiData<ListData>>> {
  const { isAuthenticated } = getKindeServerSession();
  const isUserAuthenticated = await isAuthenticated();

  if (!isUserAuthenticated && process.env.NEXT_PUBLIC_AUTH_ACTIVE === "true") {
    return Promise.reject(new Error("User is not authenticated."));
  }

  let result: ApiResponse<ApiData<ListData>>;
  const allLists = await getAllListsFromDB();

  const invalidTimestamp = checkValidTimestamp(allLists, dataToPost);

  if (invalidTimestamp !== undefined) {
    result = invalidTimestamp;
  } else {
    dataToPost.item.rows.forEach(async (item) => {
      if (item.isDeleted) {
        // delete item
        await deleteList(item);
      }
      if (item.id === 0) {
        // add item
        await addList(item);
      }
      if (item.id > 0) {
        // edit item
        await editList(item, allLists);
      }
    });

    result = await formatAllListsResponse();
  }

  return new Promise((resolve) => {
    resolve(result);
  });
}
