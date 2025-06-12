import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";

export default [
    {
        ignores: ["**/apiSchema.ts"]
    },
    js.configs.recommended,
    {
        files: ["**/*.{ts,tsx}"],
        languageOptions: {
            parser: tsparser,
            parserOptions: {
                ecmaVersion: 2020,
                sourceType: "module",
                ecmaFeatures: {
                    jsx: true,
                },
            },
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
        plugins: {
            "@typescript-eslint": tseslint,
            "react": react,
            "react-hooks": reactHooks,
            "simple-import-sort": simpleImportSort,
        },
        rules: {
            ...tseslint.configs.recommended.rules,
            ...react.configs.recommended.rules,
            ...reactHooks.configs.recommended.rules,

            "prefer-const": "error",
            "eqeqeq": ["error", "always", {
                null: "ignore",
            }],
            "no-else-return": "off",
            "no-magic-numbers": "off",
            "no-nested-ternary": "off",
            "@typescript-eslint/no-unused-vars": ["error", {
                varsIgnorePattern: "^_",
                argsIgnorePattern: "^_",
            }],
            "dot-notation": "error",
            "react/react-in-jsx-scope": "off",
            "react/jsx-filename-extension": [1, {
                extensions: [".js", ".jsx", ".ts", ".tsx"],
            }],
            "simple-import-sort/imports": "error",
            "simple-import-sort/exports": "error",
            "sort-imports": "off",
        },
        settings: {
            react: {
                version: "detect",
            },
        },
    }
];
