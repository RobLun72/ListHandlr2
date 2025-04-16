import { StrictRequest, DefaultBodyType, HttpResponse } from "msw";
import { matLista } from "../MockedData/namedLists";
import { OneListPostData } from "@/DTO/oneListData";
import { namedListsDb } from "./apiCallHelper";

//let currentNamedListId = 1000;

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
    //const responseLists: ApiResponse<ApiData<ListData>> = editList(data);

    return HttpResponse.json("responseLists");
  }
};
