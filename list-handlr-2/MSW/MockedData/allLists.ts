import { ApiData } from "../../DTO/apiData";
import { ListData } from "../../DTO/listsData";

export const allListsMockData: ApiData<ListData> = {
  timeStamp: "2024-04-03T12:36:01.046Z",
  rows: [
    {
      index: 0,
      listName: "testy",
      id: 1,
    },
    {
      index: 1,
      listName: "Matlista",
      id: 2,
    },
    {
      index: 2,
      listName: "Handla",
      id: 3,
    },
  ],
};

export const userOneListsMockData: ApiData<ListData> = {
  timeStamp: "2024-04-03T12:36:01.046Z",
  rows: [
    {
      index: 0,
      listName: "testy",
      id: 1,
    },
    {
      index: 1,
      listName: "Handla",
      id: 3,
    },
  ],
};
