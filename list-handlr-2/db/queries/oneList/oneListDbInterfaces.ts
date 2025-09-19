import { NamedListData } from "@/DTO/oneListData";

export interface IOneListDbQueries {
  // named list related
  getListDataForNamedList(listName: string): Promise<NamedListResponse>;
  addListItemToDb(row: NamedListData, listId: number): Promise<void>;
  editListItemToDb(row: NamedListData, listId: number): Promise<void>;
  deleteListItemToDb(row: NamedListData): Promise<void>;
  editListLastUpdatedToDb(listId: number): Promise<void>;
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

export interface NamedListResponse {
  namedList: NamedListRecord;
  listItems: NamedListItem[];
}
