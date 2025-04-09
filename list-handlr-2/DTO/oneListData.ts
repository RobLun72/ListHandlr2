import { ApiData } from "./apiData";
import { DraggableItem } from "./draggableItem";

export interface NamedListData extends DraggableItem {
  text: string;
  done: boolean;
  link: string;
}

export interface OneListPostData {
  saveType: string;
  listName: string;
  item: ApiData<NamedListData>;
}
