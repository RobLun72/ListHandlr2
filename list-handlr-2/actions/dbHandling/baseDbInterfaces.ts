import { ListData } from "@/DTO/listsData";
import { NamedListData } from "@/DTO/oneListData";

export interface DbQueriesInterface {
  // all lists related
  getAllListsForUser(userId: string): Promise<AllListRecord[]>;
  addListToDb(item: ListData, userId: string): Promise<void>;
  editListToDb(item: ListData): Promise<void>;
  deleteListToDb(item: ListData): Promise<void>;
  // named list related
  getListDataForNamedList(listName: string): Promise<NamedListResponse>;
  addListItemToDb(row: NamedListData, listId: number): Promise<void>;
  editListItemToDb(row: NamedListData, listId: number): Promise<void>;
  deleteListItemToDb(row: NamedListData): Promise<void>;
  editListLastUpdatedToDb(listId: number): Promise<void>;
  // collaboration related
  getCollabDataForNamedList(listName: string): Promise<NamedListCollabResponse>;
  deleteCollabsToDb(list_id: number): Promise<void>;
  addCollabItemToDb(userId: string, listId: number): Promise<void>;
  editCollabListLastUpdatedToDb(listId: number): Promise<void>;
}

export interface NamedListRecord {
  id: number;
  index: number;
  list_name: string;
  last_update: Date;
  last_item_update: Date;
  user_id: string | null;
}

export interface NamedListItem {
  id: number;
  list_id: number;
  index: number;
  text: string;
  done: string;
  link: string;
}

export interface NamedListCollab {
  id: number;
  list_id: number;
  user_id: string;
}

export interface NamedListResponse {
  namedList: NamedListRecord;
  listItems: NamedListItem[];
}

export interface NamedListCollabResponse {
  namedList: NamedListRecord;
  listItems: NamedListCollab[];
}

export interface AllListRecord {
  id: number;
  index: number;
  list_name: string;
  last_update: Date;
  last_item_update: Date;
}
