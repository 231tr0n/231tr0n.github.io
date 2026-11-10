import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import Home from './+page.svelte';
import Blog from './blog/+page.svelte';
import Misc from './misc/+page.svelte';
import Games from './games/+page.svelte';

describe('content routes', () => {
	it('renders the home page', () => {
		render(Home);
		expect(screen.getByRole('heading', { name: 'Home', level: 1 })).toBeInTheDocument();
		expect(screen.getByText('Srikar')).toBeInTheDocument();
		expect(screen.getByText('231tr0n')).toBeInTheDocument();
		expect(screen.getByText('Badminton')).toBeInTheDocument();
		expect(screen.getByText('Visa')).toBeInTheDocument();
	});

	it('renders the blog index', () => {
		render(Blog);
		expect(screen.getByRole('heading', { name: 'Blog', level: 1 })).toBeInTheDocument();
		expect(screen.getByRole('heading', { name: 'Neovim configuration' })).toBeInTheDocument();
	});

	it('renders the misc index', () => {
		render(Misc);
		expect(screen.getByRole('heading', { name: 'Miscellaneous' })).toBeInTheDocument();
		expect(screen.getByRole('heading', { name: 'HTML Playground' })).toBeInTheDocument();
		expect(screen.getByRole('heading', { name: 'Website Bundle Statistics' })).toBeInTheDocument();
	});

	it('lists both games', () => {
		render(Games);
		expect(screen.getByRole('heading', { name: 'Games' })).toBeInTheDocument();
		expect(screen.getByRole('heading', { name: 'Ludo' })).toBeInTheDocument();
		expect(screen.getByRole('heading', { name: 'TicTacToe' })).toBeInTheDocument();
		expect(screen.getAllByRole('link', { name: 'Open' })).toHaveLength(2);
	});
});
