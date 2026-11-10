import { render, screen } from '@testing-library/svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ConfigPage from './blog/config/+page.svelte';

vi.mock('#lib/components/Codeeditor.svelte', async () => ({
	default: (await import('../test/FakeCodeeditor.svelte')).default
}));

const config = `-- Core options
vim.opt.number = true

-- Plugins
vim.pack.add({
  "https://github.com/example/alpha",
  { src = "https://github.com/example/beta" },
  "short-name",
})`;

const defaultFetch = () => Promise.resolve(new Response(config));
const fetchMock = vi.fn(defaultFetch);

beforeEach(() => {
	localStorage.clear();
	fetchMock.mockReset();
	fetchMock.mockImplementation(defaultFetch);
	vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
	vi.restoreAllMocks();
});

describe('Neovim configuration page', () => {
	it('renders sections, plugins and code editors', async () => {
		render(ConfigPage);
		expect(
			screen.getByRole('heading', { name: 'Neovim configuration', level: 1 })
		).toBeInTheDocument();
		expect(await screen.findByText('Core options')).toBeInTheDocument();
		expect(screen.getByText('Plugins')).toBeInTheDocument();
		expect(screen.getAllByTestId('fake-codeeditor')).toHaveLength(2);

		expect(screen.getByRole('link', { name: 'https://github.com/example/alpha' })).toHaveAttribute(
			'href',
			'https://github.com/example/alpha'
		);
		expect(screen.getByRole('link', { name: 'https://github.com/example/beta' })).toHaveAttribute(
			'href',
			'https://github.com/example/beta'
		);
		expect(screen.getByRole('link', { name: 'short-name' })).toHaveAttribute(
			'href',
			'https://github.com/short-name'
		);
	});

	it('shows a config loading error', async () => {
		const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
		fetchMock.mockRejectedValue(new Error('config unavailable'));
		render(ConfigPage);
		expect(await screen.findByText('config unavailable')).toBeInTheDocument();
		expect(error).toHaveBeenCalled();
	});
});
