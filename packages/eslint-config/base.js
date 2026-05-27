import js from "@eslint/js"
import onlyWarn from "eslint-plugin-only-warn"
import turboPlugin from "eslint-plugin-turbo"
import tseslint from "typescript-eslint"

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config}
 * */
export const config = [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      quotes: ["error", "single", { avoidEscape: true, allowTemplateLiterals: true }],
      "jsx-quotes": ["error", "prefer-double"],
      semi: ["error", "never"],
      indent: ["error", 2, { SwitchCase: 1 }],
      "max-len": ["error", { code: 100, ignoreUrls: true, ignoreComments: false, ignoreTrailingComments: true, ignoreStrings: false, ignoreTemplateLiterals: true }],
      "no-trailing-spaces": "error",
      "comma-dangle": ["error", "never"],
    },
  },
  {
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      "turbo/no-undeclared-env-vars": "warn",
    },
  },
  {
    plugins: {
      onlyWarn,
    },
  },
  {
    ignores: ["dist/**", ".next/**", "**/.turbo/**", "**/coverage/**"],
  },
]
