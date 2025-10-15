import { db } from "@/db/index";
import { eq } from "drizzle-orm";
import { listsTable, listItemsTable } from "@/db/schema";
import { NamedListData } from "@/DTO/oneListData";
import type {
  IOneListDbQueries,
  NamedListResponse,
} from "./oneListDbInterfaces";

export class OneListRealDbQueries implements IOneListDbQueries {
  // one list related
  async getListDataForNamedList(listName: string): Promise<NamedListResponse> {
    const namedList = await db
      .select()
      .from(listsTable)
      .where(eq(listsTable.list_name, listName));

    const listItems = await db
      .select()
      .from(listItemsTable)
      .where(eq(listItemsTable.list_id, namedList[0]?.id))
      .orderBy(listItemsTable.index);

    return {
      namedList: namedList[0],
      listItems: listItems,
    };
  }
  async addListItemToDb(row: NamedListData, listId: number): Promise<void> {
    await db.insert(listItemsTable).values({
      list_id: listId,
      index: row.index,
      text: row.text,
      done: row.done ? "true" : "false",
      link: row.link,
    });
  }
  async editListItemToDb(row: NamedListData, listId: number): Promise<void> {
    await db
      .update(listItemsTable)
      .set({
        list_id: listId,
        index: row.index,
        text: row.text,
        done: row.done ? "true" : "false",
        link: row.link,
      })
      .where(eq(listItemsTable.id, row.id));
  }
  async deleteListItemToDb(row: NamedListData): Promise<void> {
    await db.delete(listItemsTable).where(eq(listItemsTable.id, row.id));
  }
  async editListLastUpdatedToDb(listId: number): Promise<void> {
    await db
      .update(listsTable)
      .set({ last_item_update: new Date() })
      .where(eq(listsTable.id, listId));
  }
}
