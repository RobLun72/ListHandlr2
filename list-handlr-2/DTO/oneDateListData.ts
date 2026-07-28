import { ApiData } from "./apiData";
import { DateItem } from "./dateItem";

export interface NamedDateListData<T> extends DateItem {
  itemData: T;
  id: number;
}

export interface OneDateListPostData<T> {
  saveType: string;
  listName: string;
  item: ApiData<NamedDateListData<T>>;
}
