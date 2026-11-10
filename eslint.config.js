import { fileURLToPath } from 'node:url';
import prettier from 'eslint-config-prettier';
import css from '@eslint/css';
import html from '@html-eslint/eslint-plugin';
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import { defineConfig, globalIgnores, includeIgnoreFile } from 'eslint/config';
import globals from 'globals';
import ts from 'typescript-eslint';
import { loadConfig } from '@sveltejs/load-config';
import esx from 'eslint-plugin-es-x';
import promise from 'eslint-plugin-promise';
import security from 'eslint-plugin-security';
import eslintComments from '@eslint-community/eslint-plugin-eslint-comments';

const loadedConfig = await loadConfig('./', { traverse: false });
if (loadedConfig && 'error' in loadedConfig) throw loadedConfig.error;
const svelteConfig = loadedConfig?.config;

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
		linterOptions: {
			reportUnusedDisableDirectives: 'error'
		}
	},
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
			'html/use-baseline': 'warn',
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
			ts.configs.all,
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
			// Keep the strictest preset, except for rules that are impractical here.
			'@typescript-eslint/consistent-return': 'off',
			'@typescript-eslint/explicit-function-return-type': 'off',
			'@typescript-eslint/explicit-module-boundary-types': 'off',
			'@typescript-eslint/max-params': 'off',
			'@typescript-eslint/no-magic-numbers': 'off',
			'@typescript-eslint/prefer-readonly-parameter-types': 'off',
			'@typescript-eslint/consistent-type-imports': ['error', { disallowTypeAnnotations: false }],
			'@typescript-eslint/naming-convention': [
				'error',
				{
					selector: 'variable',
					format: null,
					filter: { regex: '^__SITE_URL__$', match: true }
				},
				{
					selector: 'objectLiteralProperty',
					format: null,
					filter: { regex: '^__SITE_URL__$', match: true }
				},
				{
					selector: 'default',
					format: ['camelCase', 'PascalCase'],
					leadingUnderscore: 'allow',
					trailingUnderscore: 'allow'
				},
				{
					selector: 'variable',
					format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
					leadingUnderscore: 'allow',
					trailingUnderscore: 'allow'
				},
				{
					selector: 'typeProperty',
					format: ['camelCase', 'PascalCase'],
					leadingUnderscore: 'allow',
					trailingUnderscore: 'allow'
				}
			],
			'no-undef': 'off',
			'@eslint-community/eslint-comments/disable-enable-pair': 'error',
			'@eslint-community/eslint-comments/no-aggregating-enable': 'error',
			'@eslint-community/eslint-comments/no-duplicate-disable': 'error',
			'@eslint-community/eslint-comments/no-restricted-disable': [
				'error',
				'security/detect-object-injection'
			],
			'@eslint-community/eslint-comments/no-unlimited-disable': 'error',
			'@eslint-community/eslint-comments/no-unused-enable': 'error',
			'@eslint-community/eslint-comments/require-description': 'error',
			'promise/no-nesting': 'error',
			'promise/no-promise-in-callback': 'error',
			'promise/no-callback-in-promise': 'error',
			'promise/no-return-in-finally': 'error',
			'promise/valid-params': 'error',
			'promise/no-multiple-resolved': 'error',
			'promise/prefer-await-to-callbacks': 'error',
			'promise/prefer-await-to-then': 'error',
			'promise/prefer-catch': 'error',
			'promise/spec-only': 'error',
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
			'svelte/consistent-selector-style': 'off'
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				parser: ts.parser,
				svelteConfig
			}
		}
	},
	{
		files: ['**/*.js', '**/*.svelte.js'],
		extends: [ts.configs.disableTypeChecked]
	},
	{
		files: ['src/service-worker/**/*.js'],
		rules: {
			'svelte/no-add-event-listener': 'off'
		}
	},
	{
		files: [
			'src/**/*.spec.ts',
			'src/**/*.dom.spec.ts',
			'src/**/*.svelte.spec.ts',
			'src/test/**/*.ts',
			'src/test/**/*.svelte'
		],
		rules: {
			'@typescript-eslint/await-thenable': 'off',
			'@typescript-eslint/no-confusing-void-expression': 'off',
			'@typescript-eslint/no-this-alias': 'off',
			'@typescript-eslint/no-unnecessary-condition': 'off',
			'@typescript-eslint/no-unnecessary-type-assertion': 'off',
			'@typescript-eslint/no-unnecessary-type-parameters': 'off',
			'@typescript-eslint/no-unsafe-type-assertion': 'off',
			'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
			'@typescript-eslint/prefer-destructuring': 'off',
			'@typescript-eslint/promise-function-async': 'off',
			'@typescript-eslint/require-await': 'off',
			'@typescript-eslint/strict-void-return': 'off',
			'@typescript-eslint/unbound-method': 'off',
			'@typescript-eslint/naming-convention': 'off',
			'promise/prefer-await-to-callbacks': 'off'
		}
	}
);
