import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
// eslint.config.ts
import globals from 'globals';
import tseslint from 'typescript-eslint';

import pluginJs from '@eslint/js';

export default tseslint.config(
    {
        // Files to ignore from linting
        ignores: [
            "node_modules/",
            "dist/",
            ".env",
            "*.js", // Ignore generated JS files if not linting them
        ],
    },
    pluginJs.configs.recommended, // Recommended JS rules
    ...tseslint.configs.recommended, // Recommended TypeScript rules
    {
        // Custom configuration for TypeScript files
        files: ["src/**/*.ts"],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                project: './tsconfig.json',
                sourceType: 'module',
            },
            globals: {
                ...globals.node, // Node.js global variables
            }
        },
        plugins: {
            prettier: prettierPlugin,
        },
        rules: {
            ...prettierConfig.rules, // Apply Prettier rules via eslint-config-prettier
            "prettier/prettier": "error", // Enable prettier/prettier rule
            // Configure no-unused-vars to ignore variables starting with an underscore
            "@typescript-eslint/no-unused-vars": [
                "warn", // You can change this to "error" if you prefer
                {
                    "argsIgnorePattern": "^_", // Ignore unused arguments starting with _
                    "varsIgnorePattern": "^_", // Ignore unused variables starting with _
                    "caughtErrorsIgnorePattern": "^_" // Ignore caught errors starting with _
                }
            ],
            // Place to add your custom ESLint rules
            // e.g., '@typescript-eslint/explicit-module-boundary-types': 'off',
        }
    }
);