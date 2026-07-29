"use server";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { ApiResponse, ApiData } from "@/DTO/apiData";
import { NamedDateListData, OneDateListPostData } from "@/DTO/oneDateListData";
import { DrivingJournalItemData } from "@/DTO/drivingJournalItemData";
import { formatDate } from "@/Helpers/formatDate";
import { DrivingJournalDbFactory } from "@/db/queries/drivingJournal/drivingJournalDbFactory";
import {
  IDrivingJournalDbQueries,
  DrivingJournalItemRecord,
  DrivingJournalListResponse,
} from "@/db/queries/drivingJournal/drivingJournalDbInterfaces";

function formatAllItems(
  timestamp: string,
  data: DrivingJournalItemRecord[],
): ApiData<NamedDateListData<DrivingJournalItemData>> {
  return {
    timeStamp: timestamp,
    rows: data.map((item) => ({
      index: item.index,
      date: new Date(item.item_date),
      itemData: {
        startOdometer: item.start_odometer,
        endOdometer: item.end_odometer,
        distance: item.distance,
        notes: item.notes || undefined,
      },
      id: item.id,
      isDeleted: false,
    })),
  };
}

function checkValidTimestamp(
  listData: DrivingJournalListResponse,
  dataToPost: OneDateListPostData<DrivingJournalItemData>,
) {
  const maxStamp =
    formatDate(listData.drivingJournalList.last_item_update) || "";

  if (maxStamp !== dataToPost.item.timeStamp) {
    const response: ApiResponse<
      ApiData<NamedDateListData<DrivingJournalItemData>>
    > = {
      message: "Timestamp mismatch",
      data: formatAllItems(maxStamp, listData.listItems),
    };
    return response;
  }

  return undefined;
}

async function formatDrivingJournalResponse(
  listName: string,
  db: IDrivingJournalDbQueries,
): Promise<ApiResponse<ApiData<NamedDateListData<DrivingJournalItemData>>>> {
  const listData = await db.getListDataForDrivingJournal(listName);
  const maxStamp =
    formatDate(listData.drivingJournalList.last_item_update) || "";

  return {
    message: "",
    data: formatAllItems(maxStamp, listData.listItems),
  };
}

async function deleteJournalItem(
  row: NamedDateListData<DrivingJournalItemData>,
  db: IDrivingJournalDbQueries,
) {
  await db.deleteDrivingJournalItemToDb(row);
}

async function addJournalItem(
  row: NamedDateListData<DrivingJournalItemData>,
  listId: number,
  db: IDrivingJournalDbQueries,
) {
  await db.addDrivingJournalItemToDb(row, listId);
}

async function editJournalItem(
  row: NamedDateListData<DrivingJournalItemData>,
  listData: DrivingJournalListResponse,
  db: IDrivingJournalDbQueries,
) {
  const existingItem = listData.listItems.find((item) => item.id === row.id)!;
  if (
    existingItem.index !== row.index ||
    new Date(existingItem.item_date).getTime() !==
      new Date(row.date).getTime() ||
    existingItem.start_odometer !== row.itemData.startOdometer ||
    existingItem.end_odometer !== row.itemData.endOdometer ||
    existingItem.distance !== row.itemData.distance ||
    (existingItem.notes ?? undefined) !== row.itemData.notes
  ) {
    await db.editDrivingJournalItemToDb(row);
  }
}

async function editListLastUpdated(
  listId: number,
  db: IDrivingJournalDbQueries,
) {
  await db.editListLastUpdatedToDb(listId);
}

export async function editDrivingJournalList(
  dataToPost: OneDateListPostData<DrivingJournalItemData>,
): Promise<ApiResponse<ApiData<NamedDateListData<DrivingJournalItemData>>>> {
  const { isAuthenticated } = getKindeServerSession();
  const isUserAuthenticated = await isAuthenticated();

  if (!isUserAuthenticated && process.env.NEXT_PUBLIC_AUTH_ACTIVE === "true") {
    return Promise.reject(new Error("User is not authenticated."));
  }

  const decodedListName = decodeURIComponent(dataToPost.listName);
  const db = DrivingJournalDbFactory.createDbQueries();

  let result: ApiResponse<ApiData<NamedDateListData<DrivingJournalItemData>>>;
  const listData = await db.getListDataForDrivingJournal(decodedListName);

  const allItemsAreNew = dataToPost.item.rows.every((item) => item.id === 0);

  const invalidTimestamp = allItemsAreNew
    ? undefined
    : checkValidTimestamp(listData, dataToPost);

  if (invalidTimestamp !== undefined) {
    result = invalidTimestamp;
  } else {
    for (const item of dataToPost.item.rows) {
      if (item.isDeleted) {
        await deleteJournalItem(item, db);
      }
      if (item.id === 0) {
        await addJournalItem(item, listData.drivingJournalList.id, db);
      }
      if (item.id > 0) {
        await editJournalItem(item, listData, db);
      }
    }

    await editListLastUpdated(listData.drivingJournalList.id, db);
    result = await formatDrivingJournalResponse(decodedListName, db);
  }

  return new Promise((resolve) => {
    resolve(result);
  });
}
