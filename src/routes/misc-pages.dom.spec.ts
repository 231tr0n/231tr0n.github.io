import { render, screen } from '@testing-library/svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import HtmlPlayground from './misc/htmlplayground/+page.svelte';
import Sourcemap from './misc/sourcemap/+page.svelte';

vi.mock('#lib/components/Codeeditor.svelte', async () => ({
	default: (await import('../test/FakeCodeeditor.svelte')).default
}));
vi.mock('#lib/components/Sandbox.svelte', async () => ({
	default: (await import('../test/FakeSandbox.svelte')).default
}));

const defaultFetch = () => Promise.resolve(new Response('<html><body>stats</body></html>'));
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

describe('misc routes', () => {
	it('wires the HTML playground editor into its output', async () => {
		render(HtmlPlayground);
		expect(screen.getByRole('heading', { name: 'HTML Playground', level: 1 })).toBeInTheDocument();
		expect(screen.getByTestId('fake-codeeditor')).toBeInTheDocument();
		expect(screen.getByTestId('fake-sandbox')).toHaveTextContent('Output');
		expect(screen.getByTestId('fake-sandbox')).toHaveAttribute('data-allow-same-origin', 'false');

		screen.getByRole('button', { name: 'Fake run' }).click();
		await vi.waitFor(() => {
			expect(screen.getByTestId('fake-sandbox')).toHaveTextContent('new html');
		});
	});

	it('renders the bundle statistics sandbox', async () => {
		render(Sourcemap);
		expect(
			screen.getByRole('heading', { name: 'Website Bundle Statistics', level: 1 })
		).toBeInTheDocument();
		const sandbox = await screen.findByTestId('fake-sandbox');
		expect(sandbox).toHaveTextContent('Bundle Report');
		expect(sandbox).toHaveAttribute('data-allow-same-origin', 'false');
	});

	it('shows an error when the statistics cannot be loaded', async () => {
		const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
		fetchMock.mockRejectedValue(new Error('network down'));
		render(Sourcemap);
		expect(await screen.findByText('network down')).toBeInTheDocument();
		expect(error).toHaveBeenCalled();
	});

	it('handles an empty statistics response', async () => {
		const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
		fetchMock.mockResolvedValueOnce(new Response(''));
		render(Sourcemap);
		expect(await screen.findByText('Error loading stats file')).toBeInTheDocument();
		expect(error).toHaveBeenCalled();
	});

	it('handles a non-Error statistics rejection', async () => {
		const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
		fetchMock.mockRejectedValueOnce('offline');
		render(Sourcemap);
		expect(await screen.findByText('Unknown error')).toBeInTheDocument();
		expect(error).toHaveBeenCalled();
	});
});
