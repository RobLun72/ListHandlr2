// server.ts
import { SetupServerApi, setupServer } from "msw/node";

import { handlers } from "./handlers";
import { HttpHandler } from "msw";

export const server = setupServer(...handlers);

export let serverWithHandlers: SetupServerApi;

export function setupServerWithHandlers(customHandlers: HttpHandler[]) {
  serverWithHandlers = setupServer(...customHandlers);
}
