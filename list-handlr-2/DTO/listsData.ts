import { ApiData } from "./apiData";
import { DraggableItem } from "./draggableItem";

export interface ListData extends DraggableItem {
  listName: string;
}

export interface AllListsPostData {
  saveType: string;
  listName?: string;
  newListName?: string;
  item: ApiData<ListData>;
}
