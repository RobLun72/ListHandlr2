import { DefaultBodyType, HttpResponse, StrictRequest } from "msw";
import {
  handleApiGetCallsSearchParams,
  handleApiPostCallsSearchParams,
} from "../RequestHelpers/searchParamhelper";

export const handleReq = async (
  baseUrl: string,
  paramsUrl: string,
  request: StrictRequest<DefaultBodyType>
) => {
  const url = new URL(request.url);
  if (process.env.NODE_ENV === "development") {
    console.log(`got ${request.method} request for: ${url.href}`);
  }

  switch (baseUrl) {
    case ``:
      if (request.method === "GET") {
        return handleApiGetCallsSearchParams(request);
      } else {
        return handleApiPostCallsSearchParams(request);
      }
      break;
    default:
      return HttpResponse.error();
      break;
  }
};
