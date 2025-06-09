import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: "./Helpers/Test/testSetup.ts",
    css: true,
    coverage: {
      include: ["app/**/*.{ts,tsx}"],
      exclude: [
        "components/**/*.{ts,tsx}",
        "MSW/**/*.{ts,tsx}",
        "Helpers/**/*.{ts,tsx}",
        "**/*.test.{ts,tsx}",
        "**/*.spec.{ts,tsx}",
      ],
    },
  },
});
