"use server";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { ApiResponse, ApiData } from "@/DTO/apiData";
import { NamedDateListData } from "@/DTO/oneDateListData";
import { DrivingJournalItemData } from "@/DTO/drivingJournalItemData";
import { OneDateListPostData } from "@/DTO/oneDateListData";
import { formatDate } from "@/Helpers/formatDate";
import { DrivingJournalDbFactory } from "@/db/queries/drivingJournal/drivingJournalDbFactory";
import { max } from "@/Helpers/sortAndFilter";

export async function editDrivingJournalList(
  dataToPost: OneDateListPostData<DrivingJournalItemData>,
): Promise<ApiResponse<ApiData<NamedDateListData<DrivingJournalItemData>>>> {
  const { isAuthenticated } = getKindeServerSession();
  const isUserAuthenticated = await isAuthenticated();

  if (!isUserAuthenticated && process.env.NEXT_PUBLIC_AUTH_ACTIVE === "true") {
    return Promise.reject(new Error("User is not authenticated."));
  }

  const db = DrivingJournalDbFactory.createDbQueries();

  try {
    for (const item of dataToPost.item.rows) {
      if (item.isDeleted) {
        // delete item
        await db.deleteDrivingJournalItemToDb(item);
      } else if (item.id === 0) {
        // add item - need to find the list ID first
        const decodedListName = decodeURIComponent(dataToPost.listName);
        const listData = await db.getListDataForDrivingJournal(decodedListName);
        await db.addDrivingJournalItemToDb(
          item,
          listData.drivingJournalList.id,
        );
      } else if (item.id > 0) {
        // edit item - need to find the list ID first
        const decodedListName = decodeURIComponent(dataToPost.listName);
        const listData = await db.getListDataForDrivingJournal(decodedListName);
        await db.editDrivingJournalItemToDb(
          item,
          listData.drivingJournalList.id,
        );
      }
    }

    // Update the list's last_item_update timestamp
    const decodedListName = decodeURIComponent(dataToPost.listName);
    const updatedListData =
      await db.getListDataForDrivingJournal(decodedListName);
    await db.editListLastUpdatedToDb(updatedListData.drivingJournalList.id);

    const result: ApiResponse<
      ApiData<NamedDateListData<DrivingJournalItemData>>
    > = {
      message: "",
      data: {
        timeStamp:
          formatDate(updatedListData.drivingJournalList?.last_item_update) ||
          "",
        rows: updatedListData.listItems.map((item) => ({
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
      },
    };

    return new Promise((resolve) => {
      resolve(result);
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return {
      message: errorMessage,
      data: { timeStamp: "", rows: [] },
    };
  }
}
