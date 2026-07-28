import { StrictRequest, DefaultBodyType, HttpResponse } from "msw";
//import { handleAllListsGet, handleAllListsPost } from "./allListsHelper";
//import { handleNamedListGet, handleNamedListPost } from "./namedListHelper";
import { AllListsPostData } from "@/DTO/listsData";
import { setupListsDb } from "../Database/allListsDb";
import { setupNamedListsDb } from "../Database/namedListDb";
import { setupNamedDateListsDb } from "../Database/namedDateListDb";
import { matLista } from "../MockedData/namedLists";
//import { OneListPostData } from "@/DTO/oneListData";

export const allListsDb = setupListsDb();
export const namedListsDb = setupNamedListsDb();
export const namedDateListsDb = setupNamedDateListsDb();

export const handleApiGetCallsSearchParams = async (
  request: StrictRequest<DefaultBodyType>,
) => {
  const url = new URL(request.url);
  const type = url.searchParams.get("type");

  // if (type === "Lists") {
  //   return handleAllListsGet(request);
  // } else if (type && type == "List") {
  //   return handleNamedListGet(request);
  // }
  if (type === "Lists" || type === "List") {
    return HttpResponse.json({
      timeStamp: "",
      rows: [],
    });
  }
};

export const handleApiPostCallsBody = async (
  request: StrictRequest<DefaultBodyType>,
) => {
  const bodyContent = await request.json();
  const data: AllListsPostData = bodyContent as AllListsPostData;

  // if (data.saveType === "oneList") {
  //   return handleNamedListPost(bodyContent as OneListPostData);
  // } else {
  //   return handleAllListsPost(data);
  // }
  if (data) {
    return HttpResponse.json(matLista);
  }
  //return { message: "Invalid type for " + data.listName, data: null };
};
