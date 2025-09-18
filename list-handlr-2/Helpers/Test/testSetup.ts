import "@testing-library/jest-dom";

import matchMediaMock from "match-media-mock";
import { loadEnvConfig } from "@next/env";

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

window.ResizeObserver = ResizeObserver;
