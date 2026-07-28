import { NamedDateListData } from "@/DTO/oneDateListData";
import { DrivingJournalItemData } from "@/DTO/drivingJournalItemData";
import { DrivingJournalListResponse } from "@/db/queries/drivingJournal/drivingJournalDbInterfaces";
import { namedDateListsDb } from "./apiCallHelper";

let currentDrivingJournalItemId = 2000;

export const handleGetDrivingJournalList = async (
  listName: string,
): Promise<DrivingJournalListResponse> => {
  const listData = namedDateListsDb.allDrivingJournalLists.findFirst({
    where: { name: { equals: listName } },
  });

  if (!listData) {
    throw new Error(`Driving Journal list "${listName}" not found`);
  }

  return {
    drivingJournalList: {
      id: listData.id,
      index: 0,
      list_name: listName,
      list_type: "DrivingJournal",
      user_id: "",
      last_update: new Date(),
      last_item_update: listData.data
        ? new Date(listData.data.timeStamp)
        : new Date(),
    },
    listItems: [
      ...(listData.data?.rows ?? []).map((item) => ({
        id: item.id,
        list_id: listData.id,
        index: item.index,
        start_odometer: item.startOdometer,
        end_odometer: item.endOdometer,
        distance: item.distance,
        notes: item.notes || null,
        item_date: item.date,
      })),
    ],
  };
};

export const handleAddDrivingJournalItem = async (
  row: NamedDateListData<DrivingJournalItemData>,
  listId: number,
): Promise<void> => {
  const listData = namedDateListsDb.allDrivingJournalLists.findFirst({
    where: { id: { equals: listId } },
  });
  if (!listData) return;

  const newItem = namedDateListsDb.drivingJournalItem.create({
    id: currentDrivingJournalItemId++,
    index: row.index,
    date:
      row.date instanceof Date
        ? row.date
        : new Date(row.date as unknown as string),
    startOdometer: row.itemData.startOdometer,
    endOdometer: row.itemData.endOdometer,
    distance: row.itemData.distance,
    notes: row.itemData.notes ?? "",
  });

  const updatedRows = [...(listData.data?.rows ?? []), newItem];
  namedDateListsDb.drivingJournalList.update({
    where: { listId: { equals: listData.id } },
    data: { rows: updatedRows, timeStamp: new Date().toISOString() },
  });
};

export const handleEditDrivingJournalItem = async (
  row: NamedDateListData<DrivingJournalItemData>,
): Promise<void> => {
  namedDateListsDb.drivingJournalItem.update({
    where: { id: { equals: row.id } },
    data: {
      index: row.index,
      date:
        row.date instanceof Date
          ? row.date
          : new Date(row.date as unknown as string),
      startOdometer: row.itemData.startOdometer,
      endOdometer: row.itemData.endOdometer,
      distance: row.itemData.distance,
      notes: row.itemData.notes ?? "",
    },
  });
};

export const handleDeleteDrivingJournalItem = async (
  row: NamedDateListData<DrivingJournalItemData>,
): Promise<void> => {
  namedDateListsDb.drivingJournalItem.delete({
    where: { id: { equals: row.id } },
  });
};

export const handleEditDrivingJournalListUpdated = async (
  listId: number,
): Promise<void> => {
  const listData = namedDateListsDb.allDrivingJournalLists.findFirst({
    where: { id: { equals: listId } },
  });
  if (listData?.data) {
    namedDateListsDb.drivingJournalList.update({
      where: { listId: { equals: listData.id } },
      data: { timeStamp: new Date().toISOString() },
    });
  }
};

export const handleRegisterDrivingJournalList = (
  id: number,
  listName: string,
): void => {
  const existing = namedDateListsDb.allDrivingJournalLists.findFirst({
    where: { name: { equals: listName } },
  });
  if (existing) return;

  const newList = namedDateListsDb.drivingJournalList.create({
    listId: id,
    timeStamp: new Date().toISOString(),
    rows: [],
  });
  namedDateListsDb.allDrivingJournalLists.create({
    name: listName,
    id,
    data: newList,
  });
};
