import { ApiData } from "./apiData";
import { DraggableItem } from "./draggableItem";
import { ListType } from "./listTypes";

export interface ListData extends DraggableItem {
  listName: string;
  listType: ListType;
  id: number;
}

export interface AllListsPostData {
  saveType: string;
  user_id: string;
  listName?: string;
  newListName?: string;
  item: ApiData<ListData>;
}
