import { render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import { cursorClickRadius, cursorRadius } from '#lib/constants/app.constants.js';
import Cursor from './Cursor.svelte';

const mouse = (type: string, x: number, y: number): MouseEvent =>
	new MouseEvent(type, { clientX: x, clientY: y, bubbles: true });

const touch = (type: string, x: number, y: number): Event => {
	const event = new Event(type);
	const point = { clientX: x, clientY: y };
	Object.defineProperty(event, 'touches', {
		value: { 0: point, length: 1, item: () => point }
	});
	return event;
};

describe('Cursor', () => {
	it('is hidden until the pointer moves, then follows it', async () => {
		const { container } = render(Cursor);
		expect(container.querySelector('svg')).toBeNull();

		document.dispatchEvent(mouse('mousemove', 10, 20));
		await vi.waitFor(() => {
			expect(container.querySelector('circle')).toBeInTheDocument();
		});
		const circle = container.querySelector('circle');
		expect(circle?.getAttribute('cx')).toBe('10');
		expect(circle?.getAttribute('cy')).toBe('20');

		document.dispatchEvent(mouse('mousemove', 50, 60));
		await vi.waitFor(() => {
			expect(circle?.getAttribute('cx')).toBe('50');
			expect(circle?.getAttribute('cy')).toBe('60');
		});
	});

	it('grows on click, shrinks on release and hides on leave', async () => {
		const { container } = render(Cursor);
		document.dispatchEvent(mouse('mousemove', 10, 20));
		const circle = await vi.waitFor(() => {
			const element = container.querySelector('circle');
			if (!element) throw new Error('Missing cursor');
			return element;
		});

		document.dispatchEvent(mouse('mousedown', 30, 40));
		await vi.waitFor(() => {
			expect(circle.getAttribute('r')).toBe(String(cursorClickRadius));
		});

		document.dispatchEvent(mouse('mouseup', 30, 40));
		await vi.waitFor(() => {
			expect(circle.getAttribute('r')).toBe(String(cursorRadius));
		});

		document.dispatchEvent(mouse('mouseleave', 30, 40));
		await vi.waitFor(() => {
			expect(circle.getAttribute('r')).toBe('0');
		});
	});

	it('follows touch moves', async () => {
		const { container } = render(Cursor);
		document.dispatchEvent(touch('touchstart', 12, 24));
		await vi.waitFor(() => {
			expect(container.querySelector('circle')?.getAttribute('cx')).toBe('12');
			expect(container.querySelector('circle')?.getAttribute('cy')).toBe('24');
		});

		document.dispatchEvent(touch('touchmove', 36, 48));
		await vi.waitFor(() => {
			expect(container.querySelector('circle')?.getAttribute('cx')).toBe('36');
			expect(container.querySelector('circle')?.getAttribute('cy')).toBe('48');
		});
	});
});
