// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([...nextVitals, // Override default ignores of eslint-config-next.
globalIgnores([
  // Default ignores of eslint-config-next:
  ".next/**",
  "out/**",
  "build/**",
  "next-env.d.ts",
  "storybook-static/**",
  "coverage/**"
]), ...storybook.configs["flat/recommended"], {
  rules: {
    "react/display-name": "off",
    "react/no-unescaped-entities": "off",
    "@next/next/no-img-element": "off",
    "@next/next/no-page-custom-font": "off"
  }
}]);

export default eslintConfig;
