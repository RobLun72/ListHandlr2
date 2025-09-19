import { ListData } from "@/DTO/listsData";
import {
  handleAllListsServerDBGet,
  handleDBAddList,
  handleDBDeleteList,
  handleDBEditList,
} from "@/MSW/RequestHelpers/allListsHelper";
import { IlistsDbQueries, AllListRecord } from "./listsDbInterfaces";

export class ListsMockDbQueries implements IlistsDbQueries {
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
}
