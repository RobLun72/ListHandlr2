import { ApiData } from "../DTO/apiData";
import { DraggableItem } from "../DTO/draggableItem";

export function FixFirstPostIndex<T extends ApiData<DraggableItem>>(data: T) {
  if (data && data.rows.length > 0 && data.rows[0].index.toString() == "") {
    data.rows[0].index = 0;
  }

  return data;
}
