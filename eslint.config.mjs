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
    // Raw third-party DSA sheet dumps (~5.6k files of other people's Java /
    // JS solutions). Gitignored and never shipped — the curated output lives in
    // src/data/sheets/. Without this, `npm run lint` reports hundreds of
    // findings in code we do not own.
    "sheets/**",
  ]),
]);

export default eslintConfig;
