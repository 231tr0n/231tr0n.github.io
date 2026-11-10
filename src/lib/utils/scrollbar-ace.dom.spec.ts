import { afterEach, describe, expect, it, vi } from 'vitest';
import { processAce, type AceScrollbarInstance } from './scrollbar-ace';

const createAceEditor = () => {
	const editor = document.createElement('div');
	editor.className = 'ace_editor';
	const vertical = document.createElement('div');
	vertical.className = 'ace_scrollbar';
	const horizontal = document.createElement('div');
	horizontal.className = 'ace_scrollbar-h';
	const scroller = document.createElement('div');
	scroller.className = 'ace_scroller';
	const content = document.createElement('div');
	scroller.appendChild(content);
	editor.append(vertical, horizontal, scroller);
	document.body.appendChild(editor);
	return { editor, vertical, horizontal, scroller, content };
};

afterEach(() => {
	document.body.innerHTML = '';
	vi.restoreAllMocks();
});

describe('processAce', () => {
	it('creates custom tracks for vertical and horizontal Ace scrollbars', () => {
		const { editor, vertical, horizontal } = createAceEditor();
		const instances = new Map<HTMLElement, AceScrollbarInstance>();

		processAce(editor, instances);
		const instance = instances.get(editor);
		expect(instance).toBeDefined();
		expect(instance?.tracks).toHaveLength(2);
		expect(vertical.hasAttribute('data-custom-scrollbar')).toBe(true);
		expect(horizontal.hasAttribute('data-custom-scrollbar')).toBe(true);
		expect(editor.style.getPropertyValue('isolation')).toBe('isolate');
		expect(editor.querySelectorAll('.custom-scrollbar-track-v')).toHaveLength(1);
		expect(editor.querySelectorAll('.custom-scrollbar-track-h')).toHaveLength(1);

		instance?.destroy();
		expect(instances.has(editor)).toBe(false);
		expect(editor.style.getPropertyValue('isolation')).toBe('');
		expect(editor.querySelectorAll('.custom-scrollbar-track-v')).toHaveLength(0);
		expect(editor.querySelectorAll('.custom-scrollbar-track-h')).toHaveLength(0);
		expect(vertical.hasAttribute('data-custom-scrollbar')).toBe(false);
		expect(vertical.style.getPropertyValue('scrollbar-width')).toBe('');
		expect(vertical.style.getPropertyValue('pointer-events')).toBe('');
		expect(vertical.style.getPropertyValue('background')).toBe('');
	});

	it('does nothing when the scrollbars are already processed', () => {
		const { editor } = createAceEditor();
		const instances = new Map<HTMLElement, AceScrollbarInstance>();
		processAce(editor, instances);
		const instance = instances.get(editor);

		processAce(editor, instances);
		expect(instance?.tracks).toHaveLength(2);
		expect(editor.querySelectorAll('.custom-scrollbar-track-v')).toHaveLength(1);
		expect(editor.querySelectorAll('.custom-scrollbar-track-h')).toHaveLength(1);
	});

	it('adds tracks to an existing instance', () => {
		const { editor, vertical } = createAceEditor();
		const instances = new Map<HTMLElement, AceScrollbarInstance>();
		processAce(editor, instances);
		const instance = instances.get(editor);
		vertical.removeAttribute('data-custom-scrollbar');

		processAce(editor, instances);
		expect(instance?.tracks).toHaveLength(3);
	});
});

describe('processAce multiple scrollbars', () => {
	it('processes every unprocessed scrollbar', () => {
		const { editor, vertical, horizontal } = createAceEditor();
		const secondVertical = document.createElement('div');
		secondVertical.className = 'ace_scrollbar';
		editor.appendChild(secondVertical);
		const instances = new Map<HTMLElement, AceScrollbarInstance>();

		processAce(editor, instances);
		expect(vertical.hasAttribute('data-custom-scrollbar')).toBe(true);
		expect(horizontal.hasAttribute('data-custom-scrollbar')).toBe(true);
		expect(secondVertical.hasAttribute('data-custom-scrollbar')).toBe(true);
		expect(instances.get(editor)?.tracks).toHaveLength(3);
	});
});
