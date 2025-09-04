import { ApiData } from "./apiData";

export interface CollabData {
  user_id: string;
  list_id: number;
  id: number;
}

export interface CollabPostData {
  listName: string;
  item: ApiData<string>;
}
