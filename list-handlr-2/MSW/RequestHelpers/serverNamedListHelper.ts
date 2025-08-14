import { StrictRequest, DefaultBodyType } from "msw";
import { handleNamedListServerPost } from "./namedListHelper";
import { OneListPostData } from "@/DTO/oneListData";
import { formatServerActionResponse } from "./serverActionHelper";

export const handleServerPostNamedListAction = async (
  request: StrictRequest<DefaultBodyType>
) => {
  const url = new URL(request.url);
  const bodyContent = await request.json();

  const jsonData: string = (bodyContent as string[])[0];

  const postData: OneListPostData = jsonData as unknown as OneListPostData;

  if (url && url.href) {
    console.log(
      "mocked serverAction EditNamedList:",
      postData,
      "pathname:",
      url.pathname
    );
  }

  const result = await handleNamedListServerPost(postData);
  const jsonResult = JSON.stringify(result);
  const response = `0:{"a":"$@1","f":"","b":"development"}\r\n1:${jsonResult}\r\n`;

  return formatServerActionResponse(response, url);
};
