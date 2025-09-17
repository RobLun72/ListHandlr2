import "@testing-library/jest-dom";

import matchMediaMock from "match-media-mock";
import { loadEnvConfig } from "@next/env";
import {
  handleAllListsServerDBGet,
  //handleAllListsServerGet,
  //handleAllListsServerPost,
  handleDBAddList,
  handleDBDeleteList,
  handleDBEditList,
} from "@/MSW/RequestHelpers/allListsHelper";
import { ListData } from "@/DTO/listsData";
import {
  handleDBAddListItem,
  handleDBDeleteListItem,
  handleDBEditListItem,
  handleDBEditListLastUpdated,
  handleNamedListServerDBGet,
  //handleNamedListServerPost,
} from "@/MSW/RequestHelpers/namedListHelper";
import {
  NamedListData,
  //OneListPostData
} from "@/DTO/oneListData";

const projectDir = process.cwd();
loadEnvConfig(projectDir);

global.window.matchMedia = matchMediaMock.create();

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock Kinde server session
vi.mock("@kinde-oss/kinde-auth-nextjs/server", () => ({
  getKindeServerSession: () => ({
    isAuthenticated: vi.fn().mockResolvedValue(true),
    getUser: vi.fn().mockResolvedValue({
      id: "test-user-id",
      email: "test@example.com",
      given_name: "Test",
      family_name: "User",
    }),
    getAccessToken: vi.fn().mockResolvedValue("mock-access-token"),
    getIdToken: vi.fn().mockResolvedValue("mock-id-token"),
  }),
}));

// Mock Kinde browser client
vi.mock("@kinde-oss/kinde-auth-nextjs", () => ({
  useKindeBrowserClient: vi.fn(() => ({
    user: {
      id: "test-user-id",
      email: "test@example.com",
      given_name: "Test",
      family_name: "User",
      picture: "https://example.com/avatar.jpg",
    },
    isAuthenticated: true,
    isLoading: false,
    userOrganizations: {
      orgCodes: ["test-org-1", "test-org-2"],
    },
    getPermissions: vi.fn().mockResolvedValue({
      permissions: ["read:lists", "write:lists", "delete:lists"],
    }),
    getClaim: vi.fn().mockImplementation((claimName: string) => {
      if (claimName === "roles") {
        return [
          { name: "admin", value: "admin" },
          { name: "user", value: "user" },
        ];
      }
      return null;
    }),
  })),
  LoginLink: vi.fn(({ children }) => children),
  LogoutLink: vi.fn(({ children }) => children),
}));

// Mock next/headers
vi.mock("next/headers", () => ({
  headers: vi.fn(() => ({
    get: vi.fn((key: string) => {
      // Mock different headers based on the key
      const mockHeaders: Record<string, string> = {
        "x-current-path": "/lists",
        "user-agent": "test-agent",
        host: "localhost:3000",
        authorization: "Bearer mock-token",
      };
      return mockHeaders[key] || null;
    }),
  })),
}));

vi.mock("@/actions/baseDbQueries", () => ({
  getAllListsForUser: vi.fn().mockImplementation(async (user_id: string) => {
    // This function runs each time getLists is called
    const dynamicData = await handleAllListsServerDBGet(user_id);
    return dynamicData;
  }),
  addListToDb: vi
    .fn()
    .mockImplementation(async (item: ListData, user_id: string) => {
      const dynamicData = await handleDBAddList(item, user_id);
      return dynamicData;
    }),
  editListToDb: vi.fn().mockImplementation(async (item: ListData) => {
    await new Promise((r) => setTimeout(r, 100));
    const dynamicData = await handleDBEditList(item);
    return dynamicData;
  }),
  deleteListToDb: vi.fn().mockImplementation(async (item: ListData) => {
    const dynamicData = await handleDBDeleteList(item);
    return dynamicData;
  }),
  getListDataForNamedList: vi
    .fn()
    .mockImplementation(async (listName: string) => {
      const dynamicData = await handleNamedListServerDBGet(listName);
      return dynamicData;
    }),
  getCollabDataForNamedList: vi.fn(),
  addListItemToDb: vi
    .fn()
    .mockImplementation(async (row: NamedListData, listId: number) => {
      const dynamicData = await handleDBAddListItem(row, listId);
      return dynamicData;
    }),
  editListItemToDb: vi
    .fn()
    .mockImplementation(async (row: NamedListData, listId: number) => {
      const dynamicData = await handleDBEditListItem(row, listId);
      return dynamicData;
    }),
  deleteListItemToDb: vi.fn().mockImplementation(async (row: NamedListData) => {
    const dynamicData = await handleDBDeleteListItem(row);
    return dynamicData;
  }),
  editListLastUpdatedToDb: vi
    .fn()
    .mockImplementation(async (listId: number) => {
      await new Promise((r) => setTimeout(r, 100)); //make sure it takes some time
      await handleDBEditListLastUpdated(listId);
    }),
}));

// vi.mock("@/actions/getLists", () => ({
//   getLists: vi.fn().mockImplementation(async (user: { user_id: string }) => {
//     // This function runs each time getLists is called
//     const dynamicData = await handleAllListsServerGet(user.user_id);
//     return dynamicData;
//   }),
// }));

// vi.mock("@/actions/editLists", () => ({
//   editLists: vi
//     .fn()
//     .mockImplementation(async (dataToPost: AllListsPostData) => {
//       // This function runs each time getLists is called
//       const dynamicData = await handleAllListsServerPost(dataToPost);
//       return dynamicData;
//     }),
// }));

// vi.mock("@/actions/getNamedList", () => ({
//   getNamedList: vi
//     .fn()
//     .mockImplementation(async (params: { listName: string }) => {
//       // URL decode the listName parameter
//       console.log("received list name:", params.listName);
//       const decodedListName = decodeURIComponent(params.listName);
//       console.log("Decoded list name:", decodedListName);
//       // You could use a helper function similar to handleAllListsServerGet
//       const dynamicData = await handleNamedListServerGet(decodedListName);
//       return dynamicData;
//     }),
// }));

// vi.mock("@/actions/editNamedList", () => ({
//   editNamedList: vi
//     .fn()
//     .mockImplementation(async (dataToPost: OneListPostData) => {
//       // This function runs each time getLists is called
//       const dynamicData = await handleNamedListServerPost(dataToPost);
//       return dynamicData;
//     }),
// }));

window.ResizeObserver = ResizeObserver;
