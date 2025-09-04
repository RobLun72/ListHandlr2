import { AllListsPostData } from "@/DTO/listsData";
import { StrictRequest, DefaultBodyType } from "msw";
import {
  handleAllListsServerGet,
  handleAllListsServerPost,
} from "./allListsHelper";
import { formatServerActionResponse } from "./serverActionHelper";

export const handleServerPostListsAction = async (
  request: StrictRequest<DefaultBodyType>
) => {
  const url = new URL(request.url);
  const bodyContent = await request.json();

  const jsonData: string = (bodyContent as string[])[0];
  const jsonString = JSON.stringify(jsonData);

  console.log("jsonString", jsonString);

  if (jsonData === undefined) {
    const result = await handleAllListsServerGet("testUser");
    const jsonResult = JSON.stringify(result);

    const response = `0:{"a":"$@1","f":"","b":"development"}\r\n1:${jsonResult}\r\n`;

    return formatServerActionResponse(response, url);
  } else {
    const postData: AllListsPostData = jsonData as unknown as AllListsPostData;

    const result = await handleAllListsServerPost(postData);
    const jsonResult = JSON.stringify(result);
    const response = `0:{"a":"$@1","f":"","b":"development"}\r\n1:${jsonResult}\r\n`;

    return formatServerActionResponse(response, url);
  }
};
