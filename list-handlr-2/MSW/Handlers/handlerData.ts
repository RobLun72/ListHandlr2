import { HttpHandler } from "msw";
import { httpHandler, passThroughHandler } from "./handlerHelper";

const allListsHandlers = (responseDelay: number) => {
  return [
    httpHandler(
      "get",
      process.env.NEXT_PUBLIC_BACK_END_URL,
      "",
      "",
      responseDelay
    ),
    httpHandler(
      "post",
      process.env.NEXT_PUBLIC_BACK_END_URL,
      "",
      "",
      responseDelay
    ),
    httpHandler(
      "post",
      process.env.NEXT_PUBLIC_SERVER_ACTION_URL,
      "/about",
      "",
      responseDelay
    ),
  ];
};

export const handlersWithDelay = (responseDelay: number) => {
  const allListsHandlersList = allListsHandlers(responseDelay);

  const handlers = [passThroughHandler("/*")];

  return [...allListsHandlersList, ...handlers] as HttpHandler[];
};

export const handlers = handlersWithDelay(
  process.env.NEXT_PUBLIC_MSW_API_DELAY ?? 0
);
