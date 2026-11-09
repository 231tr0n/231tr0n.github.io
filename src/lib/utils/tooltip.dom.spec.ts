import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { animationDelay, animationDuration } from '#lib/constants/app.constants.js';
import { flushMutations } from '../../test/helpers.js';

const mouse = (type: string, x = 10, y = 10): MouseEvent =>
	new MouseEvent(type, { clientX: x, clientY: y, bubbles: false });

const touch = (type: string, x: number, y: number): Event => {
	const event = new Event(type);
	Object.defineProperty(event, 'touches', {
		value: [{ clientX: x, clientY: y }]
	});
	return event;
};

beforeAll(async () => {
	await import('./tooltip');
});

beforeEach(async () => {
	vi.useFakeTimers();
	document.body.innerHTML = `
		<a id="link" href="https://example.com/docs">Link</a>
		<button id="label" aria-label="Label button">Label</button>
		<button id="title" title="Title button">Title</button>
		<button id="plain">Plain text</button>
	`;
	await flushMutations();
});

afterEach(() => {
	vi.runOnlyPendingTimers();
	vi.useRealTimers();
	document.body.innerHTML = '';
});

describe('tooltip', () => {
	it('migrates title attributes to aria-label', () => {
		const title = document.getElementById('title');
		expect(title?.getAttribute('aria-label')).toBe('Title button');
		expect(title?.hasAttribute('title')).toBe(false);
	});

	it('shows an anchor tooltip with the href after the delay', () => {
		const link = document.getElementById('link');
		if (!link) throw new Error('Missing link');
		link.dispatchEvent(mouse('mouseenter'));

		expect(document.querySelector('.tooltip')).toBeNull();
		vi.advanceTimersByTime(animationDelay);
		const tip = document.querySelector('.tooltip');
		expect(tip?.textContent).toBe('https://example.com/docs');
		expect(tip?.getAttribute('style')).toContain('opacity');
	});

	it('shows aria-label text for buttons', () => {
		const button = document.getElementById('label');
		if (!button) throw new Error('Missing button');
		button.dispatchEvent(mouse('mouseenter'));
		vi.advanceTimersByTime(animationDelay);
		expect(document.querySelector('.tooltip')?.textContent).toBe('Label button');
	});

	it('falls back to button text when there is no label', () => {
		const button = document.getElementById('plain');
		if (!button) throw new Error('Missing plain button');
		button.dispatchEvent(mouse('mouseenter'));
		vi.advanceTimersByTime(animationDelay);
		expect(document.querySelector('.tooltip')?.textContent).toBe('Plain text');
	});

	it('cancels a pending tooltip when the pointer leaves early', () => {
		const button = document.getElementById('label');
		if (!button) throw new Error('Missing button');
		button.dispatchEvent(mouse('mouseenter'));
		button.dispatchEvent(mouse('mouseleave'));
		vi.advanceTimersByTime(animationDelay + animationDuration);
		expect(document.querySelector('.tooltip')).toBeNull();
	});

	it('removes the tooltip when its target is detached', async () => {
		const button = document.getElementById('label');
		if (!button) throw new Error('Missing button');
		button.dispatchEvent(mouse('mouseenter'));
		vi.advanceTimersByTime(animationDelay);
		expect(document.querySelector('.tooltip')).not.toBeNull();

		button.remove();
		await flushMutations();
		expect(document.querySelector('.tooltip')).toBeNull();
	});

	it('hides a tooltip after the leave animation', () => {
		const button = document.getElementById('label');
		if (!button) throw new Error('Missing button');
		button.dispatchEvent(mouse('mouseenter'));
		vi.advanceTimersByTime(animationDelay);
		expect(document.querySelector('.tooltip')).not.toBeNull();

		button.dispatchEvent(mouse('mouseleave'));
		vi.advanceTimersByTime(animationDuration);
		expect(document.querySelector('.tooltip')).toBeNull();
	});

	it('updates position on mouse movement', () => {
		const button = document.getElementById('label');
		if (!button) throw new Error('Missing button');
		button.dispatchEvent(mouse('mouseenter', 5, 5));
		vi.advanceTimersByTime(animationDelay);
		const tip = document.querySelector<HTMLElement>('.tooltip');
		expect(tip).not.toBeNull();

		button.dispatchEvent(mouse('mousemove', 50, 60));
		expect(tip?.style.top).not.toBe('');
		expect(tip?.style.left).not.toBe('');
	});

	it('updates content when aria-label changes', async () => {
		const button = document.getElementById('label');
		if (!button) throw new Error('Missing button');
		button.dispatchEvent(mouse('mouseenter'));
		vi.advanceTimersByTime(animationDelay);
		expect(document.querySelector('.tooltip')?.textContent).toBe('Label button');

		button.setAttribute('aria-label', 'Updated label');
		await flushMutations();
		expect(document.querySelector('.tooltip')?.textContent).toBe('Updated label');
	});

	it('supports touch interactions', () => {
		const button = document.getElementById('label');
		if (!button) throw new Error('Missing button');
		button.dispatchEvent(touch('touchstart', 20, 30));
		vi.advanceTimersByTime(0);
		expect(document.querySelector('.tooltip')?.textContent).toBe('Label button');

		button.dispatchEvent(touch('touchend', 20, 30));
		vi.advanceTimersByTime(500 + animationDuration);
		expect(document.querySelector('.tooltip')).toBeNull();
	});

	it('attaches to dynamically added elements', async () => {
		const added = document.createElement('button');
		added.setAttribute('aria-label', 'Dynamic');
		document.body.appendChild(added);
		await flushMutations();

		added.dispatchEvent(mouse('mouseenter'));
		vi.advanceTimersByTime(animationDelay);
		expect(document.querySelector('.tooltip')?.textContent).toBe('Dynamic');
	});
});
