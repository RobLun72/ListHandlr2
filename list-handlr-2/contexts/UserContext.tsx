"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";

// Define the user type
export interface User {
  id: string;
  email: string;
  given_name: string;
  family_name: string;
  picture?: string;
  organizations?: string[];
  permissions?: string[];
  roles?: string[];
}

// Define the context type
interface UserContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
}

// Create the context
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider component
interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    user: kindeUser,
    isAuthenticated,
    isLoading: kindeLoading,
    userOrganizations,
    getPermissions,
    getClaim,
  } = useKindeBrowserClient();

  // Simplified refresh function that just reloads by resetting hasInitialized
  const refreshUser = async () => {
    setHasInitialized(false);
  };

  // Effect to load user data when authentication state changes
  // Use a ref to track if we've already loaded to prevent infinite loops
  const [hasInitialized, setHasInitialized] = useState(false);

  const setNoAuthUser = () => {
    setUser({
      id: "no-auth-user-id",
      email: "test@example.com",
      given_name: "Test",
      family_name: "User",
      picture: "https://example.com/avatar.jpg",
      organizations: ["test-org-1", "test-org-2"],
      permissions: [],
      roles: [],
    });
  };

  useEffect(() => {
    if (kindeLoading) return; // Wait for Kinde to finish loading

    const loadUserData = async () => {
      if (!isAuthenticated || !kindeUser) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Get additional user data
        const userPermissions = await getPermissions();
        const userRoles = await getClaim("roles");

        // Extract role names if roles are objects
        const roleNames = userRoles
          ? Array.isArray(userRoles)
            ? userRoles.map((role) =>
                typeof role === "string" ? role : role.name || role.value
              )
            : [
                typeof userRoles === "string"
                  ? userRoles
                  : userRoles.name || userRoles.value,
              ]
          : [];

        // Construct the user object
        const userData: User = {
          id: kindeUser.id,
          email: kindeUser.email || "",
          given_name: kindeUser.given_name || "",
          family_name: kindeUser.family_name || "",
          picture: kindeUser.picture || undefined,
          organizations: userOrganizations?.orgCodes || [],
          permissions: userPermissions?.permissions || [],
          roles: roleNames,
        };

        setUser(userData);
      } catch (err) {
        console.error("Error loading user data:", err);
        setError("Failed to load user data");
      } finally {
        setIsLoading(false);
      }
    };

    // Only run once when authentication state stabilizes
    if (!hasInitialized) {
      if (process.env.NEXT_PUBLIC_AUTH_ACTIVE === "false") {
        setHasInitialized(true);
        setNoAuthUser();
      } else {
        setHasInitialized(true);
        loadUserData();
      }

      return;
    }

    if (process.env.NEXT_PUBLIC_AUTH_ACTIVE === "true") {
      // Only refresh if authentication state actually changes
      if (isAuthenticated && kindeUser && !user) {
        loadUserData();
      } else if (!isAuthenticated && user) {
        setUser(null);
        setIsLoading(false);
      }
    }
  }, [
    isAuthenticated,
    kindeUser,
    kindeLoading,
    hasInitialized,
    user,
    getPermissions,
    getClaim,
    userOrganizations,
  ]);

  const value: UserContextType = {
    user,
    isLoading: isLoading || (kindeLoading ?? false),
    isAuthenticated: isAuthenticated ?? false,
    error,
    refreshUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

// Custom hook to use the user context
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

// Additional convenience hooks
export function useCurrentUser() {
  const { user } = useUser();
  return user;
}

export function useIsAuthenticated() {
  const { isAuthenticated } = useUser();
  return isAuthenticated;
}

export function useUserPermissions() {
  const { user } = useUser();
  return user?.permissions || [];
}

export function useUserRoles() {
  const { user } = useUser();
  return user?.roles || [];
}
