import { StrictRequest, DefaultBodyType } from "msw";
import {
  handleNamedListServerGet,
  handleNamedListServerPost,
} from "./namedListHelper";
import { OneListPostData } from "@/DTO/oneListData";
import { formatServerActionResponse } from "./serverActionHelper";
import { ApiData } from "@/DTO/apiData";
import { CollabData } from "@/DTO/collabData";
import { User } from "@/contexts/UserContext";

export const handleServerPostNamedListAction = async (
  request: StrictRequest<DefaultBodyType>
) => {
  const url = new URL(request.url);
  const bodyContent = await request.json();

  const jsonData: string = (bodyContent as string[])[0];
  const jsonString = JSON.stringify(jsonData);

  if (jsonString.startsWith('{"listName":')) {
    const postData: { listName: string } = jsonData as unknown as {
      listName: string;
    };
    const result = await handleNamedListServerGet(postData.listName);
    const jsonResult = JSON.stringify(result);
    const response = `0:{"a":"$@1","f":"","b":"development"}\r\n1:${jsonResult}\r\n`;

    return formatServerActionResponse(response, url);
  } else {
    const postData: OneListPostData = jsonData as unknown as OneListPostData;

    const result = await handleNamedListServerPost(postData);
    const jsonResult = JSON.stringify(result);
    const response = `0:{"a":"$@1","f":"","b":"development"}\r\n1:${jsonResult}\r\n`;

    return formatServerActionResponse(response, url);
  }
};

export const handleServerPostNamedListCollabAction = async (
  request: StrictRequest<DefaultBodyType>
) => {
  const url = new URL(request.url);
  const bodyContent = await request.json();
  console.log("Collab action bodyContent:", bodyContent);
  const jsonData: string = (bodyContent as string[])[0];
  const jsonString = JSON.stringify(jsonData);

  if (jsonString !== undefined && jsonString.startsWith('{"listName":')) {
    const result: ApiData<CollabData> = {
      timeStamp: "",
      rows:
        jsonString !== undefined
          ? [{ id: 0, list_id: 0, user_id: "" }]
          : [{ id: 0, list_id: 0, user_id: "" }],
    };
    const jsonResult = JSON.stringify(result);
    const response = `0:{"a":"$@1","f":"","b":"development"}\r\n1:${jsonResult}\r\n`;
    return formatServerActionResponse(response, url);
  } else {
    const result: { success: boolean; users: User[]; error?: string } = {
      success: true,
      users: [],
      error: "",
    };
    const jsonResult = JSON.stringify(result);
    const response = `0:{"a":"$@1","f":"","b":"development"}\r\n1:${jsonResult}\r\n`;
    return formatServerActionResponse(response, url);
  }
};
