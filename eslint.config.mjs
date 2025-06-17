import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores([".github/workflows/**/*"]),
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
  },
]);

