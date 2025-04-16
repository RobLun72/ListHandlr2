import { factory, manyOf, oneOf, primaryKey } from "@mswjs/data";
import { allNamedLists } from "../MockedData/namedLists";

export const db = factory({
  // Create a "lists" model,
  allNamedLists: {
    name: primaryKey(String),
    data: oneOf("namedList"), // A list can have many items
  },
  namedList: {
    timestamp: primaryKey(String),
    rows: manyOf("listItems"), // A list can have many items
  },
  listItems: {
    // ...with these properties and value getters.
    id: primaryKey(Number),
    index: Number,
    text: String,
    link: String,
    done: Boolean,
  },
});

export const setupNamedListsDb = () => {
  let itemId = 1;

  allNamedLists.forEach((item) => {
    const namedList = db.namedList.create({
      timestamp: item.data.timeStamp,
      rows: item.data.rows.map((item) => {
        return db.listItems.create({
          id: itemId++,
          index: item.index,
          text: item.text,
          link: item.link,
          done: item.done,
        });
      }),
    });

    db.allNamedLists.create({
      name: item.name,
      data: namedList,
    });
  });

  return db;
};
