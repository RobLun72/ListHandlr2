import { DefaultBodyType, HttpResponse, StrictRequest } from "msw";
import {
  handleApiGetCallsSearchParams,
  handleApiPostCallsBody,
} from "../RequestHelpers/apiCallHelper";
import { handleServerAction } from "../RequestHelpers/serverActionHelper";

export const handleReq = async (
  baseUrl: string,
  paramsUrl: string,
  request: StrictRequest<DefaultBodyType>
) => {
  const url = new URL(request.url);
  if (process.env.NODE_ENV === "development" && url && url.href) {
    console.log(`got ${request.method} request for: ${url.href}`);
  }

  switch (baseUrl) {
    case ``:
      if (request.method === "GET") {
        return handleApiGetCallsSearchParams(request);
      } else {
        return handleApiPostCallsBody(request);
      }
      break;
    case `/about`:
      if (url && url.href) {
        console.log(
          "About page server action request",
          request.method,
          url.href
        );
      }
      return handleServerAction(request);
    default:
      return HttpResponse.error();
      break;
  }
};
