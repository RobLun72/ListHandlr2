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

const callHandler = (
  baseUrl: string,
  paramsUrl: string,
  responseDelay: number
) => {
  const url =
    "https://" + process.env.NEXT_PUBLIC_BACK_END_URL + baseUrl + paramsUrl;
  return http.get(url, async ({ request }) => {
    return handleReqDelayWrapper(baseUrl, paramsUrl, request, responseDelay);
  });
};

const postHandler = (
  baseUrl: string,
  paramsUrl: string,
  responseDelay: number
) => {
  const url =
    "https://" + process.env.NEXT_PUBLIC_BACK_END_URL + baseUrl + paramsUrl;
  return http.post(url, async ({ request }) => {
    return handleReqDelayWrapper(baseUrl, paramsUrl, request, responseDelay);
  });
};

const putHandler = (
  baseUrl: string,
  paramsUrl: string,
  responseDelay: number
) => {
  const url =
    "https://" + process.env.NEXT_PUBLIC_BACK_END_URL + baseUrl + paramsUrl;
  return http.put(url, async ({ request }) => {
    return handleReqDelayWrapper(baseUrl, paramsUrl, request, responseDelay);
  });
};

export const httpHandler = (
  type: "get" | "post" | "put",
  baseUrl: string,
  paramsUrl: string,
  responseDelay: number
) => {
  switch (type) {
    case "get":
      return callHandler(baseUrl, paramsUrl, responseDelay);
      break;
    case "post":
      return postHandler(baseUrl, paramsUrl, responseDelay);
      break;
    case "put":
      return putHandler(baseUrl, paramsUrl, responseDelay);
      break;
  }
};

export const passThroughHandler = (url: string) => {
  return http.get(url, () => {
    return passthrough();
  });
};
