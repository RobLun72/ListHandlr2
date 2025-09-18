//import { StrictRequest, DefaultBodyType, HttpResponse } from "msw";
import { matLista } from "../MockedData/namedLists";
import { NamedListData, OneListPostData } from "@/DTO/oneListData";
import { namedListsDb } from "./apiCallHelper";
import { ApiData, ApiResponse } from "@/DTO/apiData";
import { sortAscending } from "@/Helpers/sortAndFilter";
import { Entity } from "@mswjs/data/lib/glossary";
import { PrimaryKey } from "@mswjs/data/lib/primaryKey";
import { OneOf, ManyOf } from "@mswjs/data/lib/relations/Relation";
import { CollabData } from "@/DTO/collabData";
import { NamedListResponse } from "@/db/queries/DbInterfaces";

let currentNamedListId = 1000;

// export const handleNamedListGet = async (
//   request: StrictRequest<DefaultBodyType>
// ) => {
//   const url = new URL(request.url);
//   const type = url.searchParams.get("type");

//   if (type && type == "List") {
//     const listName = url.searchParams.get("name");

//     if (listName) {
//       const listData = namedListsDb.allNamedLists.findFirst({
//         where: { name: { equals: listName } },
//       });
//       if (listData) {
//         return HttpResponse.json(listData.data);
//       } else {
//         return HttpResponse.json(matLista);
//       }
//     }
//   }
// };

export const handleNamedListServerGet = async (listName: string) => {
  if (listName) {
    const listData = namedListsDb.allNamedLists.findFirst({
      where: { name: { equals: listName } },
    });
    if (listData) {
      return listData.data;
    } else if (listName === "empty") {
      return { timeStamp: "", rows: [] };
    } else {
      return matLista;
    }
  }
};

export const handleNamedListServerDBGet = async (listName: string) => {
  const listData = namedListsDb.allNamedLists.findFirst({
    where: { name: { equals: listName } },
  });
  if (listData) {
    return new Promise<NamedListResponse>((resolve) => {
      resolve({
        namedList: {
          id: listData.id,
          index: 0,
          list_name: listName,
          user_id: "",
          last_update: new Date(),
          last_item_update: listData.data
            ? new Date(listData.data!.timeStamp)
            : new Date(),
        },
        listItems: [
          ...listData.data!.rows.map((item) => ({
            id: item.id,
            list_id: listData.id,
            index: item.index,
            text: item.text,
            done: item.done.toString(),
            link: item.link,
          })),
        ],
      });
    });
  } else if (listName === "empty") {
    return new Promise<NamedListResponse>((resolve) => {
      resolve({
        namedList: {
          id: 0,
          index: 0,
          list_name: "",
          last_update: new Date(),
          last_item_update: new Date(),
          user_id: null,
        },
        listItems: [],
      });
    });
  } else {
    return new Promise<NamedListResponse>((resolve) => {
      resolve({
        namedList: {
          id: 1,
          index: 0,
          list_name: listName,
          user_id: "",
          last_update: new Date(),
          last_item_update: new Date(matLista.timeStamp),
        },
        listItems: [
          ...matLista.rows.map((item) => ({
            id: item.id,
            list_id: 1,
            index: item.index,
            text: item.text,
            done: item.done.toString(),
            link: item.link,
          })),
        ],
      });
    });
  }
};

export const handleDBAddListItem = async (
  row: NamedListData,
  listId: number
) => {
  const listData = namedListsDb.allNamedLists.findFirst({
    where: { id: { equals: listId } },
  });

  const newItem = namedListsDb.listItems.create({
    id: currentNamedListId++,
    index: row.index,
    text: row.text,
    link: row.link,
    done: row.done,
  });

  namedListsDb.namedList.update({
    where: { timeStamp: { equals: listData!.data!.timeStamp } },
    data: {
      rows: [...(listData?.data?.rows ?? []), newItem],
      timeStamp: listData!.data!.timeStamp,
    },
  });
};

export const handleDBEditListItem = async (
  row: NamedListData,
  listId: number
) => {
  const listData = namedListsDb.allNamedLists.findFirst({
    where: { id: { equals: listId } },
  });
  if (!listData) {
    throw new Error("List not found");
  }

  namedListsDb.listItems.update({
    where: { id: { equals: row.id } },
    data: {
      index: row.index,
      text: row.text,
      link: row.link,
      done: row.done,
    },
  });
};

export const handleDBDeleteListItem = async (row: NamedListData) => {
  namedListsDb.listItems.delete({
    where: { id: { equals: row.id } },
  });
};

export const handleDBEditListLastUpdated = async (listId: number) => {
  const listData = namedListsDb.allNamedLists.findFirst({
    where: { id: { equals: listId } },
  });
  if (!listData) {
    throw new Error("List not found");
  }
  //   const newTime = new Date().toLocaleDateString();

  //   // namedListsDb.namedList.update({
  //   //   where: { timeStamp: { equals: listData!.data!.timeStamp } },
  //   //   data: { timeStamp: newTime, rows: listData!.data!.rows },
  //   // });
  //   // const list = namedListsDb.namedList.findFirst({
  //   //   where: { timeStamp: { equals: newTime } },
  //   // });
  //   // namedListsDb.allNamedLists.update({
  //   //   where: { id: { equals: listId } },
  //   //   data: { data: list! },
  //   // });
  //   return newTime;
};

export const handleNamedListCollabServerGet = async (listName: string) => {
  const result: ApiData<CollabData> = {
    timeStamp: "",
    rows: listName !== "" ? [] : [],
  };
  return result;
};

// export const handleNamedListPost = async (data: OneListPostData) => {
//   if (data.saveType === "oneList") {
//     const responseLists: ApiResponse<ApiData<NamedListData>> = editList(data);

//     await new Promise((r) => setTimeout(r, 200));

//     return HttpResponse.json(responseLists);
//   }
// };

export const handleNamedListServerPost = async (data: OneListPostData) => {
  if (data.saveType === "oneList") {
    const responseLists: ApiResponse<ApiData<NamedListData>> = editList(data);

    await new Promise((r) => setTimeout(r, 200));

    return responseLists;
  }
};

const editList = (data: OneListPostData) => {
  const listData = namedListsDb.allNamedLists.findFirst({
    where: { name: { equals: data.listName } },
  });

  if (listData!.data!.timeStamp !== data.item.timeStamp) {
    const responseLists: ApiResponse<ApiData<NamedListData>> = {
      message: "Timestamp mismatch",
      data: {
        timeStamp: listData!.data!.timeStamp,
        rows: listData!.data!.rows,
      },
    };
    return responseLists;
  } else {
    //delete old items
    listData!.data!.rows.forEach((item) => {
      namedListsDb.listItems.delete({
        where: {
          id: {
            equals: item.id,
          },
        },
      });
    });

    //added items
    const newItems: Entity<
      {
        allNamedLists: { name: PrimaryKey<string>; data: OneOf<"namedList"> };
        namedList: { timeStamp: PrimaryKey<string>; rows: ManyOf<"listItems"> };
        listItems: {
          id: PrimaryKey<number>;
          index: NumberConstructor;
          text: StringConstructor;
          link: StringConstructor;
          done: BooleanConstructor;
        };
      },
      "listItems"
    >[] = [];
    data.item.rows.forEach((item) => {
      if (item.isDeleted !== true) {
        const newItem = namedListsDb.listItems.create({
          id: currentNamedListId++,
          index: item.index,
          text: item.text,
          link: item.link,
          done: item.done,
        });
        newItems.push(newItem);
      }
    });

    //add new items to list
    namedListsDb.namedList.update({
      where: { timeStamp: { equals: listData!.data!.timeStamp } },
      data: {
        timeStamp: data.item.timeStamp,
        rows: newItems,
      },
    });

    const updlistData = namedListsDb.allNamedLists.findFirst({
      where: { name: { equals: data.listName } },
    });

    const responseLists: ApiResponse<ApiData<NamedListData>> = {
      message: "",
      data: {
        timeStamp: updlistData!.data!.timeStamp,
        rows: sortAscending(updlistData!.data!.rows, "index"),
      },
    };

    return responseLists;
  }
};
