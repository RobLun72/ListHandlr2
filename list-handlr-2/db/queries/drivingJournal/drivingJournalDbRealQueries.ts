import { db } from "@/db/index";
import { eq } from "drizzle-orm";
import {
  listsTable,
  drivingJournalItemsTable,
  listsCollaborationsTable,
} from "@/db/schema";
import type {
  IDrivingJournalDbQueries,
  DrivingJournalListResponse,
  DrivingJournalListRecord,
  DrivingJournalItemRecord,
} from "./drivingJournalDbInterfaces";
import { sortAscending } from "@/Helpers/sortAndFilter";
import { NamedDateListData } from "@/DTO/oneDateListData";
import { DrivingJournalItemData } from "@/DTO/drivingJournalItemData";

export class DrivingJournalRealDbQueries implements IDrivingJournalDbQueries {
  async getListDataForDrivingJournal(
    listName: string,
  ): Promise<DrivingJournalListResponse> {
    const list = await db
      .select()
      .from(listsTable)
      .where(eq(listsTable.list_name, listName));

    if (list.length === 0) {
      throw new Error(`List "${listName}" not found`);
    }

    const listId = list[0].id;
    const listItems = await db
      .select()
      .from(drivingJournalItemsTable)
      .where(eq(drivingJournalItemsTable.list_id, listId));

    const sortedItems = sortAscending(listItems, "index");

    const drivingJournalList: DrivingJournalListRecord = {
      id: list[0].id,
      index: list[0].index,
      list_name: list[0].list_name,
      list_type: list[0].list_type,
      last_update: list[0].last_update,
      last_item_update: list[0].last_item_update,
      user_id: list[0].user_id,
    };

    return {
      drivingJournalList,
      listItems: sortedItems,
    };
  }

  async addDrivingJournalItemToDb(
    row: NamedDateListData<DrivingJournalItemData>,
    listId: number,
  ): Promise<void> {
    await db.insert(drivingJournalItemsTable).values({
      list_id: listId,
      index: row.index,
      start_odometer: row.itemData.startOdometer,
      end_odometer: row.itemData.endOdometer,
      distance: row.itemData.distance,
      notes: row.itemData.notes || null,
      item_date: new Date(row.date),
    });
  }

  async editDrivingJournalItemToDb(
    row: NamedDateListData<DrivingJournalItemData>,
    listId: number,
  ): Promise<void> {
    await db
      .update(drivingJournalItemsTable)
      .set({
        index: row.index,
        start_odometer: row.itemData.startOdometer,
        end_odometer: row.itemData.endOdometer,
        distance: row.itemData.distance,
        notes: row.itemData.notes || null,
        item_date: new Date(row.date),
      })
      .where(eq(drivingJournalItemsTable.id, row.id));
  }

  async deleteDrivingJournalItemToDb(
    row: NamedDateListData<DrivingJournalItemData>,
  ): Promise<void> {
    await db
      .delete(drivingJournalItemsTable)
      .where(eq(drivingJournalItemsTable.id, row.id));
  }

  async editListLastUpdatedToDb(listId: number): Promise<void> {
    await db
      .update(listsTable)
      .set({
        last_update: new Date(),
        last_item_update: new Date(),
      })
      .where(eq(listsTable.id, listId));
  }
}
