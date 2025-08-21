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

async function saveIndexes(rows: ListData[]) {
  for (const item of rows) {
    await db
      .update(listsTable)
      .set({
        index: item.index,
        last_update: new Date(),
      })
      .where(eq(listsTable.list_name, item.listName));
  }
}

async function sortList(item: { rows: ListData[] }) {
  await saveIndexes(item.rows);

  return await formatAllListsResponse();
}

async function editList(item: { listName: string; newListName: string }) {
  await db
    .update(listsTable)
    .set({ list_name: item.newListName, last_update: new Date() })
    .where(eq(listsTable.list_name, item.listName));

  return await formatAllListsResponse();
}
async function addList(item: {
  newListName: string;
  allLists: AllListRecord[];
}) {
  const maxIndex = max(item.allLists, "index")!.index!;
  await db.insert(listsTable).values({
    index: maxIndex + 1,
    list_name: item.newListName!,
    last_update: new Date(),
    last_item_update: new Date(),
  });

  return await formatAllListsResponse();
}

async function deleteList(item: { listName: string; rows: ListData[] }) {
  const namedList = await db
    .select()
    .from(listsTable)
    .where(eq(listsTable.list_name, item.listName));

  await db
    .delete(listItemsTable)
    .where(eq(listItemsTable.list_id, namedList[0]?.id));
  await db.delete(listsTable).where(eq(listsTable.id, namedList[0]?.id));

  return await sortList({ rows: item.rows });
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
    if (dataToPost.saveType === "editList") {
      result = await editList({
        listName: dataToPost.listName!,
        newListName: dataToPost.newListName!,
      });
    }
    if (dataToPost.saveType === "addList") {
      result = await addList({
        newListName: dataToPost.newListName!,
        allLists,
      });
    }
    if (dataToPost.saveType === "deleteList") {
      result = await deleteList({
        listName: dataToPost.listName!,
        rows: dataToPost.item.rows,
      });
    } else {
      result = await sortList({ rows: dataToPost.item.rows });
    }
  }

  return new Promise((resolve) => {
    resolve(result);
  });
}
