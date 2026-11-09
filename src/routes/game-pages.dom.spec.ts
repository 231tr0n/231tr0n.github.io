import { render, screen } from '@testing-library/svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LudoPage from './games/ludo/+page.svelte';
import TicTacToePage from './games/tictactoe/+page.svelte';

vi.mock('#lib/components/Codeeditor.svelte', async () => ({
	default: (await import('../test/FakeCodeeditor.svelte')).default
}));
vi.mock('#lib/components/Sandbox.svelte', async () => ({
	default: (await import('../test/FakeSandbox.svelte')).default
}));

const defaultFetch = (input: RequestInfo | URL) => {
	const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
	const body = url.endsWith('.js')
		? '// source'
		: url.endsWith('.css')
			? '/* styles */'
			: '<!doctype html><html></html>';
	return Promise.resolve(new Response(body));
};

const fetchMock = vi.fn(defaultFetch);

beforeEach(() => {
	localStorage.clear();
	fetchMock.mockReset();
	fetchMock.mockImplementation(defaultFetch);
	vi.stubGlobal('fetch', fetchMock);
});

describe('game routes', () => {
	it('renders the Ludo page, rules and source files', async () => {
		render(LudoPage);
		expect(screen.getByRole('heading', { name: 'Ludo', level: 1 })).toBeInTheDocument();
		expect(screen.getByText(/52-square outer ring/)).toBeInTheDocument();
		expect(screen.getByText(/Three 6s in a row/)).toBeInTheDocument();
		expect(screen.getByText(/two to four players/)).toBeInTheDocument();
		expect(screen.getByText(/five-square home lane/)).toBeInTheDocument();
		expect(screen.getByText(/5 home-lane steps/)).toBeInTheDocument();

		const editors = await screen.findAllByTestId('fake-codeeditor');
		expect(editors).toHaveLength(3);
		expect(editors.map((editor) => editor.textContent?.trim())).toEqual([
			'index.js',
			'style.css',
			'index.html'
		]);
		expect(screen.getByTestId('fake-sandbox')).toHaveTextContent(
			'/resources/snippets/ludo/index.html'
		);
	});

	it('renders the TicTacToe page, rules and source files', async () => {
		render(TicTacToePage);
		expect(screen.getByRole('heading', { name: 'TicTacToe', level: 1 })).toBeInTheDocument();
		expect(screen.getByText(/3×3 board/)).toBeInTheDocument();
		expect(screen.getByText(/three marks in a row/)).toBeInTheDocument();

		const editors = await screen.findAllByTestId('fake-codeeditor');
		expect(editors).toHaveLength(3);
		expect(screen.getByTestId('fake-sandbox')).toHaveTextContent(
			'/resources/snippets/tictactoe/index.html'
		);
	});

	it.each([
		['Ludo', LudoPage],
		['TicTacToe', TicTacToePage]
	])('shows source loading errors for %s', async (_name, page) => {
		fetchMock.mockRejectedValue(new Error('source unavailable'));
		render(page);
		expect(await screen.findAllByText('source unavailable')).toHaveLength(3);
	});
});
