import { defineConfig } from 'vitest/config';
import { type PluginOption } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
	plugins: [
		sveltekit(),
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
