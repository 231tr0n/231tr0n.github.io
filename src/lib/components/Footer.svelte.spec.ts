import { render, screen } from '@testing-library/svelte';
import { beforeEach, describe, expect, it } from 'vitest';
import Footer from './Footer.svelte';
import { cacheKeyPrefix } from '#lib/constants/app.constants.js';

beforeEach(() => {
	localStorage.clear();
});

describe('Footer', () => {
	it('renders the social links', () => {
		render(Footer);
		expect(screen.getAllByRole('link')).toHaveLength(6);
		expect(screen.getByAltText('GitHub')).toBeInTheDocument();
		expect(screen.getByAltText('Gmail')).toBeInTheDocument();
	});

	it('clears only cached fetch entries', async () => {
		localStorage.setItem(`${cacheKeyPrefix}/one`, 'one');
		localStorage.setItem(`${cacheKeyPrefix}/two`, 'two');
		localStorage.setItem('theme', 'dark');
		render(Footer);

		await screen.getByRole('button', { name: 'Clear cache' }).click();
		expect(localStorage.getItem(`${cacheKeyPrefix}/one`)).toBeNull();
		expect(localStorage.getItem(`${cacheKeyPrefix}/two`)).toBeNull();
		expect(localStorage.getItem('theme')).toBe('dark');
	});
});
