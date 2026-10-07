import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vitest/config';
import { type PluginOption } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { visualizer } from 'rollup-plugin-visualizer';
import pkg from './package.json' with { type: 'json' };

const SITE_URL = pkg.url;

const isBasePath = (value: string): value is '' | `/${string}` =>
	value === '' || value.startsWith('/');

const getBasePath = (): '' | `/${string}` => {
	const rawBase = process.argv.includes('dev') ? '' : (process.env['BASE_PATH'] ?? '');
	if (!isBasePath(rawBase)) {
		throw new Error(`BASE_PATH must be empty or start with '/', got: ${rawBase}`);
	}
	return rawBase;
};

export default defineConfig({
	define: {
		__SITE_URL__: JSON.stringify(SITE_URL)
	},
	plugins: [
		sveltekit({
			preprocess: vitePreprocess(),
			compilerOptions: { runes: true },
			adapter: adapter({ precompress: true, fallback: '404.html' }),
			paths: {
				base: getBasePath()
			}
		}),
		visualizer() as PluginOption,
		{
			name: 'static-watch',
			configureServer(server) {
				server.watcher.on('change', (path) => {
					if (path.startsWith('static/')) {
						server.ws.send({ type: 'full-reload' });
					}
				});
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
});
