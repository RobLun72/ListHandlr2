import { StrictRequest, DefaultBodyType, HttpResponse } from "msw";
import { matLista } from "../MockedData/namedLists";
import { NamedListData, OneListPostData } from "@/DTO/oneListData";
import { namedListsDb } from "./apiCallHelper";
import { ApiData, ApiResponse } from "@/DTO/apiData";
import { sortAscending } from "@/Helpers/sortAndFilter";
import { Entity } from "@mswjs/data/lib/glossary";
import { PrimaryKey } from "@mswjs/data/lib/primaryKey";
import { OneOf, ManyOf } from "@mswjs/data/lib/relations/Relation";

let currentNamedListId = 1000;

export const handleNamedListGet = async (
  request: StrictRequest<DefaultBodyType>
) => {
  const url = new URL(request.url);
  const type = url.searchParams.get("type");

  if (type && type == "List") {
    const listName = url.searchParams.get("name");

    if (listName) {
      const listData = namedListsDb.allNamedLists.findFirst({
        where: { name: { equals: listName } },
      });
      if (listData) {
        return HttpResponse.json(listData.data);
      } else {
        return HttpResponse.json(matLista);
      }
    }
  }
};

export const handleNamedListPost = async (data: OneListPostData) => {
  if (data.saveType === "oneList") {
    const responseLists: ApiResponse<ApiData<NamedListData>> = editList(data);

    await new Promise((r) => setTimeout(r, 200));

    return HttpResponse.json(responseLists);
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
      const newItem = namedListsDb.listItems.create({
        id: currentNamedListId++,
        index: item.index,
        text: item.text,
        link: item.link,
        done: item.done,
      });
      newItems.push(newItem);
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
