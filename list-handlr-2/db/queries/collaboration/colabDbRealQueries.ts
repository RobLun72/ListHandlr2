import { db } from "@/db/index";
import { eq } from "drizzle-orm";
import { listsTable, listsCollaborationsTable } from "@/db/schema";

import { IColabDbQueries } from "./colabDbInterfaces";

export class ColabRealDbQueries implements IColabDbQueries {
  // collaboration related
  async getCollabDataForNamedList(listName: string) {
    const namedList = await db
      .select()
      .from(listsTable)
      .where(eq(listsTable.list_name, listName));

    const listItems = await db
      .select()
      .from(listsCollaborationsTable)
      .where(eq(listsCollaborationsTable.list_id, namedList[0]?.id))
      .orderBy(listsCollaborationsTable.user_id);

    return {
      namedList: namedList[0],
      listItems: listItems,
    };
  }
  async deleteCollabsToDb(list_id: number): Promise<void> {
    await db
      .delete(listsCollaborationsTable)
      .where(eq(listsCollaborationsTable.list_id, list_id));
  }
  async addCollabItemToDb(userId: string, listId: number): Promise<void> {
    await db.insert(listsCollaborationsTable).values({
      list_id: listId,
      user_id: userId,
    });
  }
  async editCollabListLastUpdatedToDb(listId: number): Promise<void> {
    await db
      .update(listsTable)
      .set({ last_item_update: new Date() })
      .where(eq(listsTable.id, listId));
  }
}
