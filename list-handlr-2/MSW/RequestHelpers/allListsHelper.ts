import { AllListsPostData, ListData } from "@/DTO/listsData";
import { ListType } from "@/DTO/listTypes";
import { ApiData, ApiResponse } from "@/DTO/apiData";
import { filter, sortAscending } from "@/Helpers/sortAndFilter";
import { allListsDb, namedListsDb } from "./apiCallHelper";
import { handleRegisterDrivingJournalList } from "./drivingJournalHelper";

const toApiListData = (
  entity: ReturnType<typeof allListsDb.allLists.getAll>[0],
): ApiData<ListData> => ({
  timeStamp: entity.timeStamp,
  rows: entity.rows.map((r) => ({
    index: r.index,
    listName: r.listName,
    listType: r.listType as ListType,
    id: r.id,
  })),
});

let currentAllListId = 100;

// export const handleAllListsGet = async (
//   request: StrictRequest<DefaultBodyType>
// ) => {
//   const url = new URL(request.url);
//   const type = url.searchParams.get("type");

//   if (type === "Lists") {
//     const lists = allListsDb.allLists.getAll();

//     return HttpResponse.json({
//       timeStamp: lists[0].timeStamp,
//       rows: sortAscending(lists[0].rows, "index"),
//     });
//   }
// };

export const handleAllListsServerGet = async (user: string) => {
  if (user == "userWithFeverLists") {
    const allLists = allListsDb.allLists.getAll();
    const lists = allLists[0].rows.filter((l) => l.listName !== "Matlista");

    return {
      timeStamp: allLists[0].timeStamp,
      rows: sortAscending(lists, "index"),
    };
  } else {
    const lists = allListsDb.allLists.getAll();

    return {
      timeStamp: lists[0].timeStamp,
      rows: sortAscending(lists[0].rows, "index"),
    };
  }
};

export const handleAllListsServerDBGet = async (user_id: string) => {
  const allLists = allListsDb.allLists.getAll();
  let lists = allLists[0].rows;
  if (user_id == "userWithFeverLists") {
    const allLists = allListsDb.allLists.getAll();
    lists = allLists[0].rows.filter((l) => l.listName !== "Matlista");
  }
  lists = sortAscending(lists, "index");

  return lists.map((list) => {
    return {
      id: list.id,
      index: list.index,
      list_name: list.listName,
      list_type: list.listType || "SortableList",
      user_id: user_id,
      last_update: allLists[0].timeStamp
        ? new Date(allLists[0].timeStamp)
        : new Date(),
      last_item_update: new Date(),
    };
  });
};

export const handleDBAddList = async (item: ListData, user_id: string) => {
  if (!user_id) {
    throw new Error("No user_id provided");
  }

  const newId = currentAllListId++;
  const newList = allListsDb.todoList.create({
    id: newId,
    index: 0,
    listName: item.listName!,
    listType: item.listType!,
  });

  const allLists = allListsDb.allLists.getAll()[0];

  if (item.listType === "DrivingJournal") {
    handleRegisterDrivingJournalList(newId, item.listName!);
  }

  const resultingList = [...(allLists.rows ?? []), newList];

  allListsDb.allLists.update({
    where: {},
    data: {
      rows: resultingList,
      timeStamp: new Date().toLocaleDateString(),
    },
  });
};

export const handleDBEditList = async (item: ListData) => {
  allListsDb.todoList.update({
    where: { id: { equals: item.id } },
    data: {
      index: item.index,
      listName: item.listName,
      listType: item.listType,
    },
  });

  allListsDb.allLists.update({
    where: {},
    data: {
      timeStamp: new Date().toLocaleDateString(),
    },
  });
};

export const handleDBDeleteList = async (item: ListData) => {
  allListsDb.todoList.delete({
    where: { id: { equals: item.id } },
  });

  allListsDb.allLists.update({
    where: {},
    data: {
      timeStamp: new Date().toLocaleDateString(),
    },
  });
};

// export const handleAllListsPost = async (data: AllListsPostData) => {
//   if (data.saveType === "editList") {
//     const responseLists: ApiResponse<ApiData<ListData>> = editList(data);

//     await new Promise((r) => setTimeout(r, 200));

//     return HttpResponse.json(responseLists);
//   }
//   if (data.saveType === "addList") {
//     const responseLists: ApiResponse<ApiData<ListData>> = addList(data);

//     await new Promise((r) => setTimeout(r, 200));

//     return HttpResponse.json(responseLists);
//   }
//   if (data.saveType === "deleteList") {
//     const responseLists: ApiResponse<ApiData<ListData>> = deleteList(data);

//     await new Promise((r) => setTimeout(r, 200));

//     return HttpResponse.json(responseLists);
//   } else {
//     const responseLists: ApiResponse<ApiData<ListData>> = sortList(data);

//     await new Promise((r) => setTimeout(r, 200));

//     return HttpResponse.json(responseLists);
//   }
// };

export const handleAllListsServerPost = async (data: AllListsPostData) => {
  await new Promise((r) => setTimeout(r, 200));

  if (data.saveType === "editList") {
    const responseLists: ApiResponse<ApiData<ListData>> = editList(data);

    return responseLists;
  }
  if (data.saveType === "addList") {
    const responseLists: ApiResponse<ApiData<ListData>> = addList(data);

    return responseLists;
  }
  if (data.saveType === "deleteList") {
    const responseLists: ApiResponse<ApiData<ListData>> = deleteList(data);

    return responseLists;
  } else {
    const responseLists: ApiResponse<ApiData<ListData>> = sortList(data);

    return responseLists;
  }
};

const editList = (data: AllListsPostData) => {
  const lists = allListsDb.allLists.getAll();
  if (lists[0].timeStamp !== data.item.timeStamp) {
    const responseLists: ApiResponse<ApiData<ListData>> = {
      message: "Timestamp mismatch",
      data: toApiListData(allListsDb.allLists.getAll()[0]),
    };
    return responseLists;
  } else {
    namedListsDb.allNamedLists.update({
      where: { name: { equals: data.listName } },
      data: {
        name: data.newListName,
      },
    });

    lists[0].rows.map((item) => {
      const updItem = filter(data.item.rows, "index", item.index);
      return allListsDb.todoList.update({
        where: {
          id: {
            equals: item.id,
          },
        },
        data: {
          index: updItem![0].index,
          listName: updItem![0].listName,
        },
      });
    });

    allListsDb.allLists.update({
      where: { timeStamp: { equals: lists[0].timeStamp } },
      data: {
        timeStamp: new Date(Date.now()).toISOString(),
      },
    });

    const responseLists: ApiResponse<ApiData<ListData>> = {
      message: "",
      data: toApiListData(allListsDb.allLists.getAll()[0]),
    };

    return responseLists;
  }
};

const addList = (data: AllListsPostData) => {
  const lists = allListsDb.allLists.getAll();
  if (lists[0].timeStamp !== data.item.timeStamp) {
    const responseLists: ApiResponse<ApiData<ListData>> = {
      message: "Timestamp mismatch",
      data: toApiListData(allListsDb.allLists.getAll()[0]),
    };
    return responseLists;
  } else {
    namedListsDb.allNamedLists.create({
      name: data.newListName,
      data: namedListsDb.namedList.create({
        timeStamp: data.item.timeStamp,
        rows: [],
      }),
    });

    lists[0].rows.forEach((item) => {
      const updItem = filter(data.item.rows, "index", item.index + 1);

      allListsDb.todoList.update({
        where: {
          id: {
            equals: item.id,
          },
        },
        data: {
          index: updItem![0].index,
          listName: updItem![0].listName,
        },
      });
    });

    allListsDb.todoList.create({
      id: currentAllListId++,
      index: 0,
      listName: data.newListName,
    });

    allListsDb.allLists.update({
      where: { timeStamp: { equals: lists[0].timeStamp } },
      data: {
        timeStamp: data.item.timeStamp,
        rows: allListsDb.todoList.getAll(),
      },
    });

    const updData = allListsDb.allLists.getAll()[0];

    const responseLists: ApiResponse<ApiData<ListData>> = {
      message: "",
      data: {
        timeStamp: new Date(Date.now()).toISOString(),
        rows: sortAscending(updData.rows, "index") as ListData[],
      },
    };

    return responseLists;
  }
};

const deleteList = (data: AllListsPostData) => {
  const lists = allListsDb.allLists.getAll();
  if (lists[0].timeStamp !== data.item.timeStamp) {
    const responseLists: ApiResponse<ApiData<ListData>> = {
      message: "Timestamp mismatch",
      data: toApiListData(allListsDb.allLists.getAll()[0]),
    };
    return responseLists;
  } else {
    namedListsDb.allNamedLists.delete({
      where: { name: { equals: data.listName } },
    });

    let hasDeleted = false;
    lists[0].rows.forEach((item) => {
      const updItem = filter(data.item.rows, "index", item.index);
      if (item.listName !== data.listName) {
        allListsDb.todoList.update({
          where: {
            id: {
              equals: item.id,
            },
          },
          data: {
            index:
              hasDeleted && updItem![0].index !== 0
                ? updItem![0].index - 1
                : updItem![0].index,
            listName: updItem![0].listName,
          },
        });
      } else {
        allListsDb.todoList.delete({
          where: {
            id: {
              equals: item.id,
            },
          },
        });
        hasDeleted = true;
      }
    });

    allListsDb.allLists.update({
      where: { timeStamp: { equals: lists[0].timeStamp } },
      data: {
        timeStamp: new Date(Date.now()).toISOString(),
        rows: allListsDb.todoList.getAll(),
      },
    });

    const updData = allListsDb.allLists.getAll()[0];

    const responseLists: ApiResponse<ApiData<ListData>> = {
      message: "",
      data: {
        timeStamp: updData.timeStamp,
        rows: sortAscending(updData.rows, "index") as ListData[],
      },
    };

    return responseLists;
  }
};

const sortList = (data: AllListsPostData) => {
  const lists = allListsDb.allLists.getAll();
  if (lists[0].timeStamp !== data.item.timeStamp) {
    const responseLists: ApiResponse<ApiData<ListData>> = {
      message: "Timestamp mismatch",
      data: toApiListData(allListsDb.allLists.getAll()[0]),
    };
    return responseLists;
  } else {
    lists[0].rows.map((item) => {
      const updItem = filter(data.item.rows, "index", item.index);
      return allListsDb.todoList.update({
        where: {
          id: {
            equals: item.id,
          },
        },
        data: {
          index: updItem![0].index,
          listName: updItem![0].listName,
        },
      });
    });

    const updData = allListsDb.allLists.getAll()[0];
    const responseLists: ApiResponse<ApiData<ListData>> = {
      message: "",
      data: {
        timeStamp: new Date(Date.now()).toISOString(),
        rows: sortAscending(updData.rows, "index") as ListData[],
      },
    };

    return responseLists;
  }
};
