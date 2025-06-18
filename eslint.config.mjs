import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores([".github/workflows/**/*", "dist/**/*"]),
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
  },
]);
