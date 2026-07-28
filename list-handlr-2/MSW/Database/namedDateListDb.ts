import { factory, manyOf, oneOf, primaryKey } from "@mswjs/data";
import { allNamedDateLists } from "../MockedData/namedDateLists";

export const db = factory({
  allDrivingJournalLists: {
    name: primaryKey(String),
    id: Number,
    data: oneOf("drivingJournalList"),
  },
  drivingJournalList: {
    listId: primaryKey(Number),
    timeStamp: String,
    rows: manyOf("drivingJournalItem"),
  },
  drivingJournalItem: {
    id: primaryKey(Number),
    index: Number,
    date: () => new Date(),
    startOdometer: String,
    endOdometer: String,
    distance: Number,
    notes: String,
  },
});

export const setupNamedDateListsDb = () => {
  let itemId = 1;

  allNamedDateLists.forEach((list) => {
    const drivingJournalList = db.drivingJournalList.create({
      listId: list.id,
      timeStamp: list.data.timeStamp,
      rows: list.data.rows.map((item, index) => {
        return db.drivingJournalItem.create({
          id: itemId++,
          index,
          date: item.date instanceof Date ? item.date : new Date(item.date),
          startOdometer: item.itemData.startOdometer,
          endOdometer: item.itemData.endOdometer,
          distance: item.itemData.distance,
          notes: item.itemData.notes ?? "",
        });
      }),
    });

    db.allDrivingJournalLists.create({
      name: list.name,
      id: list.id,
      data: drivingJournalList,
    });
  });

  return db;
};
