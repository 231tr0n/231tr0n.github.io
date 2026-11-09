import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vitest/config';
import { normalizePath } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { visualizer } from 'rollup-plugin-visualizer';
import pkg from './package.json' with { type: 'json' };

const SITE_URL = pkg.url;

const isBasePath = (value: string): value is '' | `/${string}` =>
	value === '' || (value.startsWith('/') && !value.endsWith('/'));

const getBasePath = (isDev: boolean): '' | `/${string}` => {
	const rawBase = isDev ? '' : (process.env['BASE_PATH'] ?? '');
	if (!isBasePath(rawBase)) {
		throw new Error(
			`BASE_PATH must be empty or start with '/' and not end with '/', got: ${rawBase}`
		);
	}
	return rawBase;
};

// ace-code ships CommonJS build directives ("no use strict", "include loader_build")
// that only its own build tooling understands. Rolldown cannot preserve them and
// warns on every build, so ignore warnings for those directives only.
const isKnownAceDirectiveWarning = (id: string | undefined): boolean =>
	id?.includes('node_modules/ace-code/') ?? false;

export default defineConfig(({ command, isPreview }) => ({
	define: {
		__SITE_URL__: JSON.stringify(SITE_URL)
	},
	build: {
		rolldownOptions: {
			onLog(level, log, defaultHandler) {
				const file = log.id ?? log.ids?.[0] ?? log.loc?.file;
				if (log.code === 'MODULE_LEVEL_DIRECTIVE' && isKnownAceDirectiveWarning(file)) {
					return;
				}
				defaultHandler(level, log);
			}
		}
	},
	plugins: [
		sveltekit({
			preprocess: vitePreprocess(),
			compilerOptions: { runes: true },
			adapter: adapter({ precompress: true, fallback: '404.html' }),
			paths: {
				base: getBasePath(command === 'serve' && isPreview !== true)
			}
		}),
		visualizer(),
		{
			name: 'static-watch',
			configureServer(server) {
				const publicDir = `${normalizePath(server.config.publicDir)}/`;
				const reload = (path: string) => {
					if (normalizePath(path).startsWith(publicDir)) {
						server.ws.send({ type: 'full-reload' });
					}
				};
				server.watcher.on('change', reload);
				server.watcher.on('add', reload);
				server.watcher.on('unlink', reload);
			}
		}
	],
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
}));
