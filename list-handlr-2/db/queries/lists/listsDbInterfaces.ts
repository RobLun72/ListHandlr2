import { ListData } from "@/DTO/listsData";

export interface IlistsDbQueries {
  // all lists related
  getAllListsForUser(userId: string): Promise<AllListRecord[]>;
  addListToDb(item: ListData, userId: string): Promise<void>;
  editListToDb(item: ListData): Promise<void>;
  deleteListToDb(item: ListData): Promise<void>;
}

export interface AllListRecord {
  id: number;
  index: number;
  list_name: string;
  list_type: string;
  last_update: Date;
  last_item_update: Date;
}
