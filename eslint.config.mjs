import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Standalone Node CommonJS maintenance/seed scripts are not part of the
    // Next app and intentionally use require(); linting them with the app's
    // TypeScript/ESM ruleset is a misconfiguration.
    "scripts/**",
  ]),
]);

export default eslintConfig;
