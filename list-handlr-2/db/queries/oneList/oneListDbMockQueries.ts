import { NamedListData } from "@/DTO/oneListData";

import {
  handleDBAddListItem,
  handleDBDeleteListItem,
  handleDBEditListItem,
  handleDBEditListLastUpdated,
  handleNamedListServerDBGet,
} from "@/MSW/RequestHelpers/namedListHelper";
import { IOneListDbQueries } from "./oneListDbInterfaces";

export class OneListMockDbQueries implements IOneListDbQueries {
  // one list related
  async getListDataForNamedList(listName: string) {
    return handleNamedListServerDBGet(listName);
  }
  async addListItemToDb(row: NamedListData, listId: number): Promise<void> {
    await handleDBAddListItem(row, listId);
  }
  async editListItemToDb(row: NamedListData, listId: number): Promise<void> {
    await handleDBEditListItem(row, listId);
  }
  async deleteListItemToDb(row: NamedListData): Promise<void> {
    await handleDBDeleteListItem(row);
  }
  async editListLastUpdatedToDb(listId: number): Promise<void> {
    await new Promise((r) => setTimeout(r, 100)); //make sure it takes some time
    await handleDBEditListLastUpdated(listId);
  }
}
