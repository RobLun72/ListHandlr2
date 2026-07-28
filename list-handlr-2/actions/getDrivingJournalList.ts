"use server";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { ApiData } from "@/DTO/apiData";
import { NamedDateListData } from "@/DTO/oneDateListData";
import { DrivingJournalItemData } from "@/DTO/drivingJournalItemData";
import { formatDate } from "@/Helpers/formatDate";
import { DrivingJournalDbFactory } from "@/db/queries/drivingJournal/drivingJournalDbFactory";

export async function getDrivingJournalList(params: {
  listName: string;
}): Promise<ApiData<NamedDateListData<DrivingJournalItemData>>> {
  const { isAuthenticated } = getKindeServerSession();
  const isUserAuthenticated = await isAuthenticated();

  if (!isUserAuthenticated && process.env.NEXT_PUBLIC_AUTH_ACTIVE === "true") {
    return Promise.reject(new Error("User is not authenticated."));
  }

  // URL decode the listName parameter
  const decodedListName = decodeURIComponent(params.listName);

  const db = DrivingJournalDbFactory.createDbQueries();
  const drivingJournalData =
    await db.getListDataForDrivingJournal(decodedListName);

  const result: ApiData<NamedDateListData<DrivingJournalItemData>> = {
    timeStamp:
      formatDate(drivingJournalData.drivingJournalList?.last_item_update) || "",
    rows: drivingJournalData.listItems.map((item) => ({
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

  return new Promise((resolve) => {
    resolve(result);
  });
}
