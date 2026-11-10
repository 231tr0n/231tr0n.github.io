import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { processAce } from './scrollbar-ace';
import { flushMutations } from '../../test/helpers.js';
import { setupScrollbars } from './scrollbar';

vi.mock('./scrollbar-ace', () => ({
	processAce: vi.fn()
}));

interface StyleOverrides {
	position?: string;
	overflowY?: string;
	overflowX?: string;
}

const styles = new WeakMap<HTMLElement, Required<StyleOverrides>>();
const setStyle = (element: HTMLElement, overrides: StyleOverrides = {}) => {
	styles.set(element, {
		position: overrides.position ?? 'static',
		overflowY: overrides.overflowY ?? 'visible',
		overflowX: overrides.overflowX ?? 'visible'
	});
};

const createContainer = () => {
	const container = document.createElement('div');
	document.body.appendChild(container);
	setStyle(container);
	return container;
};

const createNode = (container: HTMLElement, overrides: StyleOverrides = {}) => {
	const node = document.createElement('div');
	container.appendChild(node);
	setStyle(node, overrides);
	return node;
};

beforeEach(() => {
	vi.spyOn(window, 'getComputedStyle').mockImplementation((element) => {
		const style = document.createElement('div').style;
		const overrides =
			element instanceof HTMLElement
				? (styles.get(element) ?? {
						position: 'static',
						overflowY: 'visible',
						overflowX: 'visible'
					})
				: { position: 'static', overflowY: 'visible', overflowX: 'visible' };
		style.position = overrides.position;
		style.overflowY = overrides.overflowY;
		style.overflowX = overrides.overflowX;
		return style;
	});
	vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 0);
});

afterEach(() => {
	document.body.innerHTML = '';
	vi.restoreAllMocks();
});

describe('setupScrollbars', () => {
	it('creates both custom scrollbars and cleans everything up', () => {
		const container = createContainer();
		const node = createNode(container, { overflowY: 'auto', overflowX: 'scroll' });
		const scrollbars = setupScrollbars(container);

		expect(container.style.position).toBe('relative');
		expect(node.hasAttribute('data-custom-scrollbar')).toBe(true);
		expect(node.style.getPropertyValue('scrollbar-width')).toBe('none');
		expect(container.querySelectorAll('.custom-scrollbar-track-v')).toHaveLength(1);
		expect(container.querySelectorAll('.custom-scrollbar-track-h')).toHaveLength(1);

		scrollbars.destroy();
		expect(node.hasAttribute('data-custom-scrollbar')).toBe(false);
		expect(node.style.getPropertyValue('scrollbar-width')).toBe('');
		expect(container.style.position).toBe('');
		expect(container.querySelectorAll('.custom-scrollbar-track-v')).toHaveLength(0);
		expect(container.querySelectorAll('.custom-scrollbar-track-h')).toHaveLength(0);
	});

	it('restores pre-existing inline scrollbar and position styles', () => {
		const container = createContainer();
		container.style.setProperty('position', 'static');
		const node = createNode(container, { overflowY: 'auto' });
		node.style.setProperty('scrollbar-width', 'thin', 'important');

		const scrollbars = setupScrollbars(container);
		expect(node.style.getPropertyValue('scrollbar-width')).toBe('none');
		scrollbars.destroy();
		expect(node.style.getPropertyValue('scrollbar-width')).toBe('thin');
		expect(node.style.getPropertyPriority('scrollbar-width')).toBe('important');
		expect(container.style.getPropertyValue('position')).toBe('static');
	});

	it('ignores the body, processed nodes, Ace editors and fixed elements', () => {
		const container = createContainer();
		const processed = createNode(container, { overflowY: 'auto' });
		processed.setAttribute('data-custom-scrollbar', '');
		const ace = createNode(container, { overflowY: 'auto' });
		ace.classList.add('ace_editor');
		const fixed = createNode(container, { overflowY: 'auto', position: 'fixed' });

		const scrollbars = setupScrollbars(container);
		expect(container.querySelectorAll('.custom-scrollbar-track-v')).toHaveLength(0);
		expect(processed.hasAttribute('data-custom-scrollbar')).toBe(true);
		expect(ace.hasAttribute('data-custom-scrollbar')).toBe(false);
		expect(fixed.hasAttribute('data-custom-scrollbar')).toBe(false);
		expect(vi.mocked(processAce)).toHaveBeenCalledWith(ace, expect.any(Map));
		scrollbars.destroy();
	});

	it('processes nodes added after setup', async () => {
		const container = createContainer();
		const scrollbars = setupScrollbars(container);
		const node = createNode(container, { overflowY: 'auto' });

		await flushMutations();
		expect(node.hasAttribute('data-custom-scrollbar')).toBe(true);
		expect(container.querySelectorAll('.custom-scrollbar-track-v')).toHaveLength(1);
		scrollbars.destroy();
	});

	it('processes added Ace editors', async () => {
		const container = createContainer();
		const scrollbars = setupScrollbars(container);
		const editor = document.createElement('div');
		editor.className = 'ace_editor';
		container.appendChild(editor);

		await flushMutations();
		expect(vi.mocked(processAce)).toHaveBeenCalledWith(editor, expect.any(Map));
		scrollbars.destroy();
	});

	it('prunes instances when their nodes are detached', async () => {
		const container = createContainer();
		const node = createNode(container, { overflowY: 'auto' });
		const scrollbars = setupScrollbars(container);
		expect(container.querySelectorAll('.custom-scrollbar-track-v')).toHaveLength(1);

		node.remove();
		await flushMutations();
		expect(container.querySelectorAll('.custom-scrollbar-track-v')).toHaveLength(0);
		scrollbars.destroy();
	});

	it('keeps a shared positioned parent until the last instance is destroyed', async () => {
		const container = createContainer();
		const first = createNode(container, { overflowY: 'auto' });
		const second = createNode(container, { overflowY: 'auto' });
		const scrollbars = setupScrollbars(container);
		expect(container.style.position).toBe('relative');

		first.remove();
		await flushMutations();
		expect(container.style.position).toBe('relative');

		second.remove();
		await flushMutations();
		expect(container.style.position).toBe('');
		scrollbars.destroy();
	});

	it('destroys idempotently', () => {
		const container = createContainer();
		createNode(container, { overflowY: 'auto' });
		const scrollbars = setupScrollbars(container);

		scrollbars.destroy();
		scrollbars.destroy();
		expect(container.querySelectorAll('.custom-scrollbar-track-v')).toHaveLength(0);
	});
});
