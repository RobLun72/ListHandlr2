import { StrictRequest, DefaultBodyType } from "msw";
import { handleAllListsGet, handleAllListsPost } from "./allListsHelper";
import { handleNamedListGet, handleNamedListPost } from "./namedListHelper";
import { AllListsPostData } from "@/DTO/listsData";
import { setupListsDb } from "../Database/allListsDb";
import { setupNamedListsDb } from "../Database/namedListDb";
import { OneListPostData } from "@/DTO/oneListData";

export const allListsDb = setupListsDb();
export const namedListsDb = setupNamedListsDb();

export const handleApiGetCallsSearchParams = async (
  request: StrictRequest<DefaultBodyType>
) => {
  const url = new URL(request.url);
  const type = url.searchParams.get("type");

  if (type === "Lists") {
    return handleAllListsGet(request);
  } else if (type && type == "List") {
    return handleNamedListGet(request);
  }
};

export const handleApiPostCallsBody = async (
  request: StrictRequest<DefaultBodyType>
) => {
  const bodyContent = await request.json();
  const data: AllListsPostData = bodyContent as AllListsPostData;

  if (data.saveType === "oneList") {
    return handleNamedListPost(bodyContent as OneListPostData);
  } else {
    return handleAllListsPost(data);
  }
};
