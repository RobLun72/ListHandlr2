import { DefaultBodyType, http, passthrough, StrictRequest } from "msw";
import { handleReq } from "./handlerRequest";

const handleReqDelayWrapper = async (
  baseUrl: string,
  paramsUrl: string,
  request: StrictRequest<DefaultBodyType>,
  responseDelay: number
) => {
  if (responseDelay !== 0) {
    await new Promise((r) => setTimeout(r, responseDelay));
  }

  return handleReq(baseUrl, paramsUrl, request);
};

const getHandler = (
  rootUrl: string,
  baseUrl: string,
  paramsUrl: string,
  responseDelay: number
) => {
  const url = rootUrl + baseUrl + paramsUrl;
  return http.get(url, async ({ request }) => {
    return handleReqDelayWrapper(baseUrl, paramsUrl, request, responseDelay);
  });
};

const postHandler = (
  rootUrl: string,
  baseUrl: string,
  paramsUrl: string,
  responseDelay: number
) => {
  const url = rootUrl + baseUrl + paramsUrl;
  return http.post(url, async ({ request }) => {
    return handleReqDelayWrapper(baseUrl, paramsUrl, request, responseDelay);
  });
};

const putHandler = (
  rootUrl: string,
  baseUrl: string,
  paramsUrl: string,
  responseDelay: number
) => {
  const url = rootUrl + baseUrl + paramsUrl;
  return http.put(url, async ({ request }) => {
    return handleReqDelayWrapper(baseUrl, paramsUrl, request, responseDelay);
  });
};

export const httpHandler = (
  type: "get" | "post" | "put",
  rootUrl: string,
  baseUrl: string,
  paramsUrl: string,
  responseDelay: number
) => {
  switch (type) {
    case "get":
      return getHandler(rootUrl, baseUrl, paramsUrl, responseDelay);
      break;
    case "post":
      return postHandler(rootUrl, baseUrl, paramsUrl, responseDelay);
      break;
    case "put":
      return putHandler(rootUrl, baseUrl, paramsUrl, responseDelay);
      break;
  }
};

export const passThroughHandler = (url: string) => {
  return http.get(url, () => {
    return passthrough();
  });
};
