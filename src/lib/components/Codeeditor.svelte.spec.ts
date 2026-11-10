import { cleanup, render, screen } from '@testing-library/svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AceMode } from '#lib/types/index.js';
import { darkMode } from '#lib/utils/dark.svelte.js';
import aceEverforestDark from '#lib/ace-themes/ace-everforest-dark.js';
import aceEverforestLight from '#lib/ace-themes/ace-everforest-light.js';
import Codeeditor from './Codeeditor.svelte';

const mocks = vi.hoisted(() => {
	const session = {
		getValue: vi.fn(() => 'const value = 1;'),
		setUseWrapMode: vi.fn(),
		setTabSize: vi.fn(),
		setUseSoftTabs: vi.fn(),
		setMode: vi.fn()
	};
	const editor = {
		session,
		renderer: { scrollBarV: {}, scrollBarH: {} },
		resize: vi.fn(),
		setValue: vi.fn(),
		setHighlightActiveLine: vi.fn(),
		setHighlightGutterLine: vi.fn(),
		setKeyboardHandler: vi.fn(),
		setFontSize: vi.fn(),
		setReadOnly: vi.fn(),
		setShowPrintMargin: vi.fn(),
		setOption: vi.fn(),
		setTheme: vi.fn(),
		destroy: vi.fn()
	};
	const beautify = vi.fn();
	const vimHandler = { name: 'vim' };
	const vscodeHandler = { name: 'vscode' };
	return { session, editor, beautify, vimHandler, vscodeHandler };
});

vi.mock('ace-code', () => ({
	default: { edit: vi.fn(() => mocks.editor) }
}));
vi.mock('ace-code/src/keyboard/vim', () => ({ default: { handler: mocks.vimHandler } }));
vi.mock('ace-code/src/keyboard/vscode', () => ({ default: { handler: mocks.vscodeHandler } }));
vi.mock('ace-code/src/ext/beautify', () => ({ default: { beautify: mocks.beautify } }));

const waitForEditor = async () => {
	await vi.waitFor(() => {
		expect(mocks.editor.setFontSize).toHaveBeenCalled();
	});
};

beforeEach(() => {
	vi.clearAllMocks();
	darkMode().dark = true;
});

afterEach(() => {
	darkMode().dark = true;
});

describe('Codeeditor', () => {
	it('configures a read-only editor with the dark theme', async () => {
		render(Codeeditor, {
			props: {
				code: 'const value = 1;',
				fileName: 'index.js',
				langName: 'javascript',
				readOnly: true
			}
		});
		await waitForEditor();
		expect(mocks.editor.setValue).toHaveBeenCalledWith('const value = 1;', -1);
		expect(mocks.editor.setReadOnly).toHaveBeenCalledWith(true);
		expect(mocks.editor.setHighlightActiveLine).toHaveBeenCalledWith(false);
		expect(mocks.editor.setHighlightGutterLine).toHaveBeenCalledWith(false);
		expect(mocks.editor.setTheme).toHaveBeenCalledWith(aceEverforestDark);
		expect(screen.getByText('Snippet')).toBeInTheDocument();
		expect(screen.getByText('index.js')).toBeInTheDocument();
		expect(screen.queryByRole('button', { name: 'Wrap' })).not.toBeInTheDocument();
		expect(screen.queryByRole('button', { name: 'Toggle keybindings' })).not.toBeInTheDocument();
		expect(screen.queryByRole('button', { name: 'Format' })).not.toBeInTheDocument();
		expect(screen.queryByRole('button', { name: 'Run' })).not.toBeInTheDocument();
	});

	it('applies the mode and light theme', async () => {
		darkMode().dark = false;
		const Mode = class {
			public readonly kind = 'mode';
		};
		render(Codeeditor, {
			props: {
				code: '',
				fileName: 'index.js',
				langName: 'javascript',
				mode: { Mode } as unknown as AceMode,
				readOnly: true
			}
		});
		await waitForEditor();
		expect(mocks.session.setMode).toHaveBeenCalledWith(expect.any(Mode));
		expect(mocks.editor.setTheme).toHaveBeenCalledWith(aceEverforestLight);
	});

	it('copies the editor value to the clipboard', async () => {
		const writeText = vi.mocked(navigator.clipboard.writeText);
		render(Codeeditor, {
			props: { code: 'value', fileName: 'index.js', langName: 'javascript', readOnly: true }
		});
		await waitForEditor();

		screen.getByRole('button', { name: 'Copy' }).click();
		await vi.waitFor(() => {
			expect(writeText).toHaveBeenCalledWith('const value = 1;');
		});
	});

	it('logs clipboard failures without showing copied state', async () => {
		const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
		vi.mocked(navigator.clipboard.writeText).mockRejectedValueOnce(new Error('denied'));
		render(Codeeditor, {
			props: { code: 'value', fileName: 'index.js', langName: 'javascript', readOnly: true }
		});
		await waitForEditor();

		screen.getByRole('button', { name: 'Copy' }).click();
		await vi.waitFor(() => {
			expect(error).toHaveBeenCalled();
		});
		expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument();
	});

	it('supports wrap, keybindings, format and run in editable mode', async () => {
		const setCode = vi.fn();
		render(Codeeditor, {
			props: {
				code: '',
				fileName: '',
				langName: 'javascript',
				readOnly: false,
				setCode
			}
		});
		await waitForEditor();
		expect(mocks.editor.setKeyboardHandler).toHaveBeenCalledWith(mocks.vscodeHandler);

		const wrap = screen.getByRole('button', { name: 'Wrap' });
		expect(wrap).toHaveAttribute('aria-pressed', 'false');
		wrap.click();
		await vi.waitFor(() => {
			expect(mocks.session.setUseWrapMode).toHaveBeenCalledWith(true);
		});
		expect(wrap).toHaveAttribute('aria-pressed', 'true');

		const keybinds = screen.getByRole('button', { name: 'Toggle keybindings' });
		keybinds.click();
		await vi.waitFor(() => {
			expect(mocks.editor.setKeyboardHandler).toHaveBeenCalledWith(mocks.vimHandler);
		});
		expect(keybinds).toHaveAttribute('aria-pressed', 'true');

		keybinds.click();
		await vi.waitFor(() => {
			expect(mocks.editor.setKeyboardHandler).toHaveBeenLastCalledWith(mocks.vscodeHandler);
		});
		expect(keybinds).toHaveAttribute('aria-pressed', 'false');

		screen.getByRole('button', { name: 'Format' }).click();
		expect(mocks.beautify).toHaveBeenCalledWith(mocks.session);

		screen.getByRole('button', { name: 'Run' }).click();
		expect(setCode).toHaveBeenCalledWith('const value = 1;');
	});
	it('destroys the editor on unmount', async () => {
		render(Codeeditor, {
			props: { code: 'value', fileName: 'index.js', langName: 'javascript' }
		});
		await waitForEditor();
		cleanup();
		expect(mocks.editor.destroy).toHaveBeenCalled();
	});
});
