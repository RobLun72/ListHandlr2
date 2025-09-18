import type {
  AllListRecord,
  DbQueriesInterface,
  NamedListCollabResponse,
} from "./DbInterfaces";
import { ListData } from "@/DTO/listsData";
import { NamedListData } from "@/DTO/oneListData";
import {
  handleAllListsServerDBGet,
  handleDBAddList,
  handleDBDeleteList,
  handleDBEditList,
} from "@/MSW/RequestHelpers/allListsHelper";
import {
  handleDBAddListItem,
  handleDBDeleteListItem,
  handleDBEditListItem,
  handleDBEditListLastUpdated,
  handleNamedListServerDBGet,
} from "@/MSW/RequestHelpers/namedListHelper";

export class MockDbQueries implements DbQueriesInterface {
  // all lists related
  async getAllListsForUser(userId: string): Promise<AllListRecord[]> {
    return await handleAllListsServerDBGet(userId);
  }
  async addListToDb(item: ListData, userId: string): Promise<void> {
    await new Promise((r) => setTimeout(r, 100)); //make sure it takes some time
    await handleDBAddList(item, userId);
  }
  async editListToDb(item: ListData): Promise<void> {
    await new Promise((r) => setTimeout(r, 100)); //make sure it takes some time
    await handleDBEditList(item);
  }
  async deleteListToDb(item: ListData): Promise<void> {
    await new Promise((r) => setTimeout(r, 100)); //make sure it takes some time
    await handleDBDeleteList(item);
  }
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
  // collaboration related
  async getCollabDataForNamedList(
    listName: string
  ): Promise<NamedListCollabResponse> {
    return {
      namedList: await handleNamedListServerDBGet(listName).then(
        (res) => res.namedList
      ),
      listItems: [],
    };
  }
  async deleteCollabsToDb(list_id: number): Promise<void> {
    // await new Promise((r) => setTimeout(r, 100)); //make sure it takes some time
    // await handleDBDeleteCollabs(list_id);
    console.log("Mock deleteCollabsToDb called", list_id);
    return;
  }
  async addCollabItemToDb(userId: string, listId: number): Promise<void> {
    // await new Promise((r) => setTimeout(r, 100)); //make sure it takes some time
    // await handleDBAddCollabItem(userId, listId);
    console.log("Mock addCollabItemToDb called", userId, listId);
    return;
  }
  async editCollabListLastUpdatedToDb(listId: number): Promise<void> {
    // await new Promise((r) => setTimeout(r, 100)); //make sure it takes some time
    // await handleDBEditCollabListLastUpdated(listId);
    console.log("Mock editCollabListLastUpdatedToDb called", listId);
    return;
  }
}
