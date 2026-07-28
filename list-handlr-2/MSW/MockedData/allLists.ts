import { ListType } from "@/DTO/listTypes";
import { ApiData } from "../../DTO/apiData";
import { ListData } from "../../DTO/listsData";

export const allListsMockData: ApiData<ListData> = {
  timeStamp: "2024-04-03T12:36:01.046Z",
  rows: [
    {
      index: 0,
      listName: "testy",
      listType: ListType.SortableList,
      id: 1,
    },
    {
      index: 1,
      listName: "Matlista",
      listType: ListType.SortableList,
      id: 2,
    },
    {
      index: 2,
      listName: "Handla",
      listType: ListType.SortableList,
      id: 3,
    },
    {
      index: 3,
      listName: "testy da besty",
      listType: ListType.SortableList,
      id: 4,
    },
    {
      index: 4,
      listName: "Drive",
      listType: ListType.DrivingJournal,
      id: 5,
    },
  ],
};

export const userOneListsMockData: ApiData<ListData> = {
  timeStamp: "2024-04-03T12:36:01.046Z",
  rows: [
    {
      index: 0,
      listName: "testy",
      listType: ListType.SortableList,
      id: 1,
    },
    {
      index: 1,
      listName: "Handla",
      listType: ListType.SortableList,
      id: 3,
    },
  ],
};
