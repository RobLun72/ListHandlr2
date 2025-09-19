import { handleNamedListServerDBGet } from "@/MSW/RequestHelpers/namedListHelper";
import { IColabDbQueries, NamedListCollabResponse } from "./colabDbInterfaces";

export class ColabMockDbQueries implements IColabDbQueries {
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
