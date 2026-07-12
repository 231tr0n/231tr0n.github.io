import { fileURLToPath } from 'node:url';
import prettier from 'eslint-config-prettier';
import css from '@eslint/css';
import html from '@html-eslint/eslint-plugin';
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import { defineConfig, globalIgnores, includeIgnoreFile } from 'eslint/config';
import globals from 'globals';
import ts from 'typescript-eslint';
import svelteConfig from './svelte.config.js';
import esx from 'eslint-plugin-es-x';
import promise from 'eslint-plugin-promise';
import security from 'eslint-plugin-security';
import eslintComments from '@eslint-community/eslint-plugin-eslint-comments';

const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url));

const esRestrictConfigKeys = Object.keys(esx.configs).filter(
	(k) => k.startsWith('flat/restrict-to-es') && !k.includes('intl')
);
const esxConfigKey = esRestrictConfigKeys.sort((a, b) => {
	const va = parseInt(a.match(/es(\d+)/)?.[1] ?? '0', 10);
	const vb = parseInt(b.match(/es(\d+)/)?.[1] ?? '0', 10);
	return vb - va;
})[0];
const esxConfig = new Map(Object.entries(esx.configs)).get(esxConfigKey);

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
		language: 'html/html',
		extends: [html.configs.recommended],
		rules: {
			'html/indent': ['error', 'tab'],
			'html/no-extra-spacing-tags': [
				'error',
				{
					enforceBeforeSelfClose: true
				}
			],
			'html/require-closing-tags': [
				'error',
				{
					selfClosing: 'always'
				}
			]
		}
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
			svelte.configs.prettier,
			esxConfig,
			promise.configs['flat/recommended'],
			security.configs.recommended
		],
		plugins: {
			'@eslint-community/eslint-comments': eslintComments
		},
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node
			},
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte']
			}
		},
		rules: {
			'@eslint-community/eslint-comments/disable-enable-pair': 'error',
			'@eslint-community/eslint-comments/no-aggregating-enable': 'error',
			'@eslint-community/eslint-comments/no-duplicate-disable': 'error',
			'@eslint-community/eslint-comments/no-restricted-disable': 'error',
			'@eslint-community/eslint-comments/no-unlimited-disable': 'error',
			'@eslint-community/eslint-comments/no-unused-disable': 'error',
			'@eslint-community/eslint-comments/no-unused-enable': 'error',
			'@eslint-community/eslint-comments/no-use': 'error',
			'@eslint-community/eslint-comments/require-description': 'error',
			'promise/catch-or-return': 'error',
			'promise/no-return-wrap': 'error',
			'promise/param-names': 'error',
			'promise/always-return': 'error',
			'promise/no-nesting': 'error',
			'promise/no-promise-in-callback': 'error',
			'promise/no-callback-in-promise': 'error',
			'promise/no-new-statics': 'error',
			'promise/no-return-in-finally': 'error',
			'promise/valid-params': 'error',
			'promise/no-multiple-resolved': 'error',
			'promise/prefer-await-to-callbacks': 'error',
			'promise/prefer-await-to-then': 'error',
			'promise/prefer-catch': 'error',
			'promise/spec-only': 'error',
			'promise/no-native': 'off',
			'promise/avoid-new': 'off',
			'security/detect-unsafe-regex': 'error',
			'security/detect-non-literal-regexp': 'error',
			'security/detect-non-literal-require': 'error',
			'security/detect-non-literal-fs-filename': 'error',
			'security/detect-eval-with-expression': 'error',
			'security/detect-pseudoRandomBytes': 'error',
			'security/detect-possible-timing-attacks': 'error',
			'security/detect-no-csrf-before-method-override': 'error',
			'security/detect-buffer-noassert': 'error',
			'security/detect-child-process': 'error',
			'security/detect-disable-mustache-escape': 'error',
			'security/detect-object-injection': 'error',
			'security/detect-new-buffer': 'error',
			'security/detect-bidi-characters': 'error',
			'no-undef': 'off',
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
			'@typescript-eslint/non-nullable-type-assertion-style': 'off',
			'svelte/no-target-blank': 'error',
			'svelte/no-at-debug-tags': 'warn',
			'svelte/button-has-type': 'error',
			// Remove below line after deprecated rule is removed
			'svelte/no-navigation-without-base': 'off',
			'@typescript-eslint/no-unsafe-type-assertion': 'error',
			'@typescript-eslint/strict-boolean-expressions': 'error',
			'@typescript-eslint/switch-exhaustiveness-check': 'error',
			'@typescript-eslint/no-shadow': 'error',
			'@typescript-eslint/prefer-readonly': 'error',
			'@typescript-eslint/require-array-sort-compare': 'error'
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
