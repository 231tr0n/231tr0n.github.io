import { render, screen } from '@testing-library/svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Navbar from './Navbar.svelte';
import { darkMode } from '#lib/utils/dark.svelte.js';

beforeEach(() => {
	localStorage.clear();
	document.body.classList.remove('dark');
	darkMode().dark = false;
});

afterEach(() => {
	document.body.classList.remove('dark');
	darkMode().dark = true;
	vi.restoreAllMocks();
});

describe('Navbar', () => {
	it('renders the navigation links', () => {
		render(Navbar);
		expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
		expect(screen.getByRole('link', { name: 'Blog' })).toHaveAttribute('href', 'blog');
		expect(screen.getByRole('link', { name: 'Projects' })).toHaveAttribute('href', 'projects');
		expect(screen.getByRole('link', { name: 'Misc' })).toHaveAttribute('href', 'misc');
		expect(screen.getByRole('link', { name: 'Games' })).toHaveAttribute('href', 'games');
	});

	it('toggles the theme and stores the preference', async () => {
		render(Navbar);
		const toggle = screen.getByRole('button', { name: 'Toggle theme' });

		toggle.click();
		await vi.waitFor(() => {
			expect(document.body.classList.contains('dark')).toBe(true);
		});
		expect(localStorage.getItem('theme')).toBe('dark');
		expect(darkMode().dark).toBe(true);

		toggle.click();
		await vi.waitFor(() => {
			expect(document.body.classList.contains('dark')).toBe(false);
		});
		expect(localStorage.getItem('theme')).toBe('light');
		expect(darkMode().dark).toBe(false);
	});

	it('toggles even when the theme cannot be stored', async () => {
		const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
		vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
			throw new Error('quota exceeded');
		});
		render(Navbar);
		screen.getByRole('button', { name: 'Toggle theme' }).click();
		await vi.waitFor(() => {
			expect(document.body.classList.contains('dark')).toBe(true);
		});
		expect(darkMode().dark).toBe(true);
		expect(error).toHaveBeenCalled();
	});

	it('reads the initial theme from the body class', async () => {
		document.body.classList.add('dark');
		render(Navbar);
		await vi.waitFor(() => {
			expect(darkMode().dark).toBe(true);
		});
	});
});
