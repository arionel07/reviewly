import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  test: {
    // e2e/ holds Playwright specs, not Vitest tests.
    exclude: ["**/node_modules/**", "**/e2e/**"],
  },
});
