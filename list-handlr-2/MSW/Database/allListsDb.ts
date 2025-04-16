import { factory, manyOf, primaryKey } from "@mswjs/data";
import { allListsMockData } from "../MockedData/allLists";

export const db = factory({
  // Create a "lists" model,
  allLists: {
    timeStamp: primaryKey(String),
    rows: manyOf("todoList"), // A list can have many items
  },

  todoList: {
    // ...with these properties and value getters.
    id: primaryKey(Number),
    index: Number,
    listName: String,
  },
});

export const setupListsDb = () => {
  let itemId = 1;
  const todoLists = allListsMockData.rows.map((item) => {
    return db.todoList.create({
      id: itemId++,
      index: item.index,
      listName: item.listName,
    });
  });

  db.allLists.create({
    timeStamp: allListsMockData.timeStamp,
    rows: todoLists,
  });

  return db;
};
