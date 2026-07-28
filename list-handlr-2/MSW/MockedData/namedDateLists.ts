import { NamedDateListData } from "@/DTO/oneDateListData";
import { ApiData } from "../../DTO/apiData";
import { DrivingJournalItemData } from "@/DTO/drivingJournalItemData";

export const driveLista: ApiData<NamedDateListData<DrivingJournalItemData>> = {
  timeStamp: "2024-04-01T15:28:52.230Z",
  rows: [
    {
      index: 0,
      date: new Date("2024-04-01T15:28:52.230Z"),
      itemData: {
        startOdometer: "1000",
        endOdometer: "1100",
        distance: 100,
        notes: "Test note 1",
      },
      id: 1,
    },
    {
      index: 1,
      date: new Date("2024-04-02T15:28:52.230Z"),
      itemData: {
        startOdometer: "1100",
        endOdometer: "1200",
        distance: 100,
        notes: "Test note 2",
      },
      id: 2,
    },
    {
      index: 2,
      date: new Date("2024-04-03T15:28:52.230Z"),
      itemData: {
        startOdometer: "1200",
        endOdometer: "1300",
        distance: 100,
        notes: "Test note 3",
      },
      id: 3,
    },
  ],
};

export interface MockedNamedDateList {
  name: string;
  id: number;
  data: ApiData<NamedDateListData<DrivingJournalItemData>>;
}

export const allNamedDateLists: MockedNamedDateList[] = [
  { name: "Drive", id: 1, data: driveLista },
];
