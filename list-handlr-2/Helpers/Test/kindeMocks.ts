import { vi } from "vitest";

// Type definitions for better type safety
export interface MockUser {
  id: string;
  email: string;
  given_name: string;
  family_name: string;
  picture?: string;
}

export interface MockRole {
  name: string;
  value: string;
}

export interface MockPermissions {
  permissions: string[];
}

export interface MockOrganizations {
  orgCodes: string[];
}

// Default mock data
export const defaultMockUser: MockUser = {
  id: "test-user-id",
  email: "test@example.com",
  given_name: "Test",
  family_name: "User",
  picture: "https://example.com/avatar.jpg",
};

export const defaultMockPermissions: MockPermissions = {
  permissions: ["read:lists", "write:lists", "delete:lists"],
};

export const defaultMockRoles: MockRole[] = [
  { name: "admin", value: "admin" },
  { name: "user", value: "user" },
];

export const defaultMockOrganizations: MockOrganizations = {
  orgCodes: ["test-org-1", "test-org-2"],
};

// Helper function to create custom Kinde mocks for specific test scenarios
export function mockKindeBrowserClient(
  overrides: {
    user?: MockUser | null;
    isAuthenticated?: boolean;
    isLoading?: boolean;
    userOrganizations?: MockOrganizations | null;
    permissions?: string[];
    roles?: MockRole[];
    getPermissions?: () => Promise<MockPermissions>;
    getClaim?: (claimName: string) => MockRole[] | string | null;
  } = {}
) {
  const mockGetPermissions =
    overrides.getPermissions ||
    vi.fn().mockResolvedValue({
      permissions: overrides.permissions || defaultMockPermissions.permissions,
    });

  const mockGetClaim =
    overrides.getClaim ||
    vi.fn().mockImplementation((claimName: string) => {
      if (claimName === "roles") {
        return overrides.roles || defaultMockRoles;
      }
      return null;
    });

  return {
    user: overrides.user !== undefined ? overrides.user : defaultMockUser,
    isAuthenticated:
      overrides.isAuthenticated !== undefined
        ? overrides.isAuthenticated
        : true,
    isLoading: overrides.isLoading !== undefined ? overrides.isLoading : false,
    userOrganizations:
      overrides.userOrganizations !== undefined
        ? overrides.userOrganizations
        : defaultMockOrganizations,
    getPermissions: mockGetPermissions,
    getClaim: mockGetClaim,
  };
}

// Predefined mock scenarios for common test cases
export const kindeMockScenarios = {
  // Authenticated user with full permissions
  authenticatedUser: () => mockKindeBrowserClient(),

  // Loading state
  loading: () =>
    mockKindeBrowserClient({
      user: null,
      isAuthenticated: false,
      isLoading: true,
    }),

  // Unauthenticated user
  unauthenticated: () =>
    mockKindeBrowserClient({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    }),

  // User with no permissions
  noPermissions: () =>
    mockKindeBrowserClient({
      permissions: [],
      roles: [],
    }),

  // User with limited permissions
  limitedPermissions: () =>
    mockKindeBrowserClient({
      permissions: ["read:lists"],
      roles: [{ name: "viewer", value: "viewer" }],
    }),

  // Admin user
  adminUser: () =>
    mockKindeBrowserClient({
      user: {
        ...defaultMockUser,
        given_name: "Admin",
        family_name: "User",
      },
      permissions: ["read:lists", "write:lists", "delete:lists", "admin:all"],
      roles: [{ name: "admin", value: "admin" }],
    }),
};
