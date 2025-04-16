import { StrictRequest, DefaultBodyType, HttpResponse } from "msw";
import { allListsMockData } from "../MockedData/allLists";
import { matLista } from "../MockedData/namedLists";
import { setupListsDb } from "../Database/allListsDb";
import { setupNamedListsDb } from "../Database/namedListDb";

const allListsDb = setupListsDb();
const namedListsDb = setupNamedListsDb();

export const handleApiGetCallsSearchParams = async (
  request: StrictRequest<DefaultBodyType>
) => {
  const url = new URL(request.url);
  const type = url.searchParams.get("type");

  if (type === "Lists") {
    const lists = allListsDb.allLists.getAll();
    return HttpResponse.json(lists[0]);
  } else if (type && type == "List") {
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

export const handleApiPostCallsSearchParams = async (
  request: StrictRequest<DefaultBodyType>
) => {
  const url = new URL(request.url);
  const type = url.searchParams.get("type");

  if (type === "Lists") {
    return HttpResponse.json(allListsMockData);
  } else {
    return HttpResponse.error();
  }
};
