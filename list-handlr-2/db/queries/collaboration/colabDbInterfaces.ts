import { NamedListRecord } from "../oneList/oneListDbInterfaces";

export interface IColabDbQueries {
  // collaboration related
  getCollabDataForNamedList(listName: string): Promise<NamedListCollabResponse>;
  deleteCollabsToDb(list_id: number): Promise<void>;
  addCollabItemToDb(userId: string, listId: number): Promise<void>;
  editCollabListLastUpdatedToDb(listId: number): Promise<void>;
}

export interface NamedListCollab {
  id: number;
  list_id: number;
  user_id: string;
}

export interface NamedListCollabResponse {
  namedList: NamedListRecord;
  listItems: NamedListCollab[];
}
