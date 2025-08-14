import { AllListsPostData } from "@/DTO/listsData";
import { StrictRequest, DefaultBodyType } from "msw";
import { handleAllListsServerPost } from "./allListsHelper";
import { formatServerActionResponse } from "./serverActionHelper";

export const handleServerPostListsAction = async (
  request: StrictRequest<DefaultBodyType>
) => {
  const url = new URL(request.url);
  const bodyContent = await request.json();

  const jsonData: string = (bodyContent as string[])[0];

  const postData: AllListsPostData = jsonData as unknown as AllListsPostData;

  if (url && url.href) {
    console.log(
      "mocked serverAction called with message:",
      postData,
      "pathname:",
      url.pathname
    );
  }

  const result = await handleAllListsServerPost(postData);
  const jsonResult = JSON.stringify(result);
  const response = `0:{"a":"$@1","f":"","b":"development"}\r\n1:${jsonResult}\r\n`;

  return formatServerActionResponse(response, url);
};
