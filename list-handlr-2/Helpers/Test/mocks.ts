// Mock @kinde-oss/kinde-auth-nextjs
vi.mock("@kinde-oss/kinde-auth-nextjs", async () => {
  const mod = await vi.importActual<
    typeof import("@kinde-oss/kinde-auth-nextjs")
  >("@kinde-oss/kinde-auth-nextjs");
  return {
    ...mod,
    useKindeBrowserClient: () => {
      return { isAuthenticated: true };
    },
  };
});
