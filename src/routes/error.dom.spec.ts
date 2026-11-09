import { render, screen } from '@testing-library/svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ErrorPage from './+error.svelte';

const state = vi.hoisted(() => ({
	page: {
		url: new URL('http://localhost/missing'),
		status: 404,
		error: { message: 'Missing page' } as { message: string } | null
	}
}));

vi.mock('$app/state', () => ({ page: state.page }));

beforeEach(() => {
	state.page.status = 404;
	state.page.error = { message: 'Missing page' };
});

describe('Error page', () => {
	it('renders the status and error message', () => {
		render(ErrorPage);
		expect(screen.getByText('404 - Missing page')).toBeInTheDocument();
	});

	it('falls back when no error message is available', () => {
		state.page.status = 500;
		state.page.error = null;
		render(ErrorPage);
		expect(screen.getByText('500 - Unknown error')).toBeInTheDocument();
	});
});
