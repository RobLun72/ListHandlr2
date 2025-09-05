import { HttpHandler } from "msw";
import { httpHandler, passThroughHandler } from "./handlerHelper";

const allListsHandlers = (responseDelay: number) => {
  return [
    httpHandler(
      "post",
      process.env.NEXT_PUBLIC_SERVER_ACTION_URL,
      "/about",
      "",
      responseDelay
    ),
    httpHandler(
      "post",
      process.env.NEXT_PUBLIC_SERVER_ACTION_URL,
      "/lists",
      "",
      responseDelay
    ),
    httpHandler(
      "post",
      process.env.NEXT_PUBLIC_SERVER_ACTION_URL,
      "/lists",
      "/:listId",
      responseDelay
    ),
    httpHandler(
      "post",
      process.env.NEXT_PUBLIC_SERVER_ACTION_URL,
      "/lists",
      "/:listId/format",
      responseDelay
    ),
    httpHandler(
      "post",
      process.env.NEXT_PUBLIC_SERVER_ACTION_URL,
      "/lists",
      "/:listId/collab",
      responseDelay
    ),
  ];
};

const allTestHandlers = (responseDelay: number) => {
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
  ];
};

export const handlersWithDelay = (
  responseDelay: number,
  mode: "test" | "development"
) => {
  const allListsHandlersList =
    mode === "test"
      ? allTestHandlers(responseDelay)
      : allListsHandlers(responseDelay);

  const handlers = [passThroughHandler("/*")];

  return [...allListsHandlersList, ...handlers] as HttpHandler[];
};

export const handlers = handlersWithDelay(
  process.env.NEXT_PUBLIC_MSW_API_DELAY ?? 0,
  "development"
);

export const testHandlers = handlersWithDelay(
  process.env.NEXT_PUBLIC_MSW_API_DELAY ?? 0,
  "test"
);
