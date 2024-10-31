import { defineConfig } from 'vitest/config';
import { enhancedImages } from '@sveltejs/enhanced-img';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [enhancedImages(), sveltekit()],

	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
