import "@testing-library/jest-dom";

import matchMediaMock from "match-media-mock";
import { loadEnvConfig } from "@next/env";
import {
  handleAllListsServerGet,
  handleAllListsServerPost,
} from "@/MSW/RequestHelpers/allListsHelper";
import { AllListsPostData } from "@/DTO/listsData";
import {
  handleNamedListServerGet,
  handleNamedListServerPost,
} from "@/MSW/RequestHelpers/namedListHelper";
import { OneListPostData } from "@/DTO/oneListData";

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

vi.mock("@/actions/getLists", () => ({
  getLists: vi.fn().mockImplementation(async () => {
    // This function runs each time getLists is called
    const dynamicData = await handleAllListsServerGet();
    return dynamicData;
  }),
}));

vi.mock("@/actions/editLists", () => ({
  editLists: vi
    .fn()
    .mockImplementation(async (dataToPost: AllListsPostData) => {
      // This function runs each time getLists is called
      const dynamicData = await handleAllListsServerPost(dataToPost);
      return dynamicData;
    }),
}));

vi.mock("@/actions/getNamedList", () => ({
  getNamedList: vi
    .fn()
    .mockImplementation(async (params: { listName: string }) => {
      // You could use a helper function similar to handleAllListsServerGet
      const dynamicData = await handleNamedListServerGet(params.listName);
      return dynamicData;
    }),
}));

vi.mock("@/actions/editNamedList", () => ({
  editNamedList: vi
    .fn()
    .mockImplementation(async (dataToPost: OneListPostData) => {
      // This function runs each time getLists is called
      const dynamicData = await handleNamedListServerPost(dataToPost);
      return dynamicData;
    }),
}));

window.ResizeObserver = ResizeObserver;
