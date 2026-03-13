import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      exclude: [
        "coverage/**",
        "e2e/**",
        "src/components/ui/**",
        "src/test/**",
        "src/app/layout.tsx",
      ],
    },
    environment: "jsdom",
    exclude: ["e2e/**", "node_modules/**"],
    globals: true,
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: ["./src/test/setup.ts"],
  },
});
