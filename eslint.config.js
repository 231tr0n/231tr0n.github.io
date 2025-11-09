import prettier from 'eslint-config-prettier';
import css from '@eslint/css';
import html from '@html-eslint/eslint-plugin';
import { fileURLToPath } from 'node:url';
import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import ts from 'typescript-eslint';
import svelteConfig from './svelte.config.js';

const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url));

export default defineConfig(
	includeIgnoreFile(gitignorePath),
	globalIgnores(['stats.html']),
	{
		files: ['**/*.css'],
		plugins: { css },
		language: 'css/css',
		extends: [css.configs.recommended],
		rules: {
			'css/use-baseline': 'warn'
		}
	},
	{
		files: ['**/*.html'],
		plugins: { html },
		language: 'html/html'
	},
	{
		files: ['**/*.js', '**/*.svelte', '**/*.svelte.js', '**/*.svelte.ts', '**/*.ts'],
		extends: [
			js.configs.recommended,
			ts.configs.eslintRecommended,
			ts.configs.strictTypeChecked,
			ts.configs.stylisticTypeChecked,
			svelte.configs.all,
			prettier,
			svelte.configs.prettier
		],
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node
			},
			parserOptions: {
				projectService: true
			}
		},
		rules: {
			'no-undef': 'off',
			'jsdoc/require-jsdoc': 'off',
			'prefer-const': 'off',
			'svelte/block-lang': [
				'error',
				{
					script: ['ts']
				}
			],
			'func-style': ['error', 'expression'],
			'svelte/no-unused-class-name': [
				'error',
				{
					allowedClassNames: ['/^zeltron-.*$/']
				}
			],
			'svelte/consistent-selector-style': 'off',
			// Remove below rule after it is removed in eslint-plugin-svelte
			'svelte/no-navigation-without-base': 'off'
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser,
				svelteConfig
			}
		}
	},
	{
		files: ['**/*.js', '**/*.svelte.js'],
		extends: [ts.configs.disableTypeChecked]
	}
);
