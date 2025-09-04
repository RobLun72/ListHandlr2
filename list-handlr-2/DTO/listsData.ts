import { ApiData } from "./apiData";
import { DraggableItem } from "./draggableItem";

export interface ListData extends DraggableItem {
  listName: string;
  id: number;
}

export interface AllListsPostData {
  saveType: string;
  user_id: string;
  listName?: string;
  newListName?: string;
  item: ApiData<ListData>;
}
