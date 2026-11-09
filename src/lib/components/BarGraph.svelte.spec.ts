import { render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import BarGraph from './BarGraph.svelte';

const data = { A: 50, B: 25, C: 75 };
const labels = (container: HTMLElement) =>
	[...container.querySelectorAll('td.label')].map((cell) => cell.textContent?.trim());

let fullscreenElement: Element | null = null;

afterEach(() => {
	fullscreenElement = null;
	Object.defineProperty(document, 'fullscreenElement', {
		configurable: true,
		get: () => null
	});
	vi.restoreAllMocks();
});

describe('BarGraph', () => {
	it('sorts descending by default and sizes the bars', async () => {
		const { container } = render(BarGraph, {
			props: { data, sort: true, context: 'GitHub', title: 'Languages', height: 12 }
		});
		expect(labels(container)).toEqual(['C - 75%', 'A - 50%', 'B - 25%']);
		const bars = [...container.querySelectorAll<HTMLElement>('.bar')];
		expect(bars.map((bar) => bar.style.height)).toEqual(['75%', '50%', '25%']);
		await vi.waitFor(() => {
			expect(container.querySelector<HTMLElement>('table')?.style.height).toBe('12vh');
		});
		expect(screen.getByText('Languages')).toBeInTheDocument();
		expect(screen.getByText('GitHub')).toBeInTheDocument();
	});

	it('supports ascending data', () => {
		const { container } = render(BarGraph, {
			props: { data, sort: true, desc: false, context: 'GitHub', title: 'Languages', height: 10 }
		});
		expect(labels(container)).toEqual(['B - 25%', 'A - 50%', 'C - 75%']);
	});

	it('preserves unsorted data', () => {
		const { container } = render(BarGraph, {
			props: { data, sort: false, context: 'GitHub', title: 'Languages', height: 10 }
		});
		expect(labels(container)).toEqual(['A - 50%', 'B - 25%', 'C - 75%']);
	});

	it('expands the table in fullscreen', async () => {
		Object.defineProperty(document, 'fullscreenElement', {
			configurable: true,
			get: () => fullscreenElement
		});
		vi.spyOn(HTMLElement.prototype, 'requestFullscreen').mockImplementation(async function (
			this: HTMLElement
		) {
			fullscreenElement = this;
			document.dispatchEvent(new Event('fullscreenchange'));
		});
		vi.spyOn(document, 'exitFullscreen').mockImplementation(async () => {
			fullscreenElement = null;
			document.dispatchEvent(new Event('fullscreenchange'));
		});

		const { container } = render(BarGraph, {
			props: { data, sort: true, context: 'GitHub', title: 'Languages', height: 10 }
		});
		screen.getByRole('button', { name: 'Toggle fullscreen' }).click();
		await vi.waitFor(() => {
			expect(container.querySelector<HTMLElement>('table')?.style.height).toBe('100%');
		});
	});
});
