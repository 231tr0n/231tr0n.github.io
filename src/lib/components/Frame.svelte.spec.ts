import { cleanup, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import FrameHarness from '../../test/FrameHarness.svelte';

let fullscreenElement: Element | null = null;

afterEach(() => {
	fullscreenElement = null;
	Object.defineProperty(document, 'fullscreenElement', {
		configurable: true,
		get: () => null
	});
	vi.restoreAllMocks();
});

const mockFullscreen = () => {
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
};

describe('Frame', () => {
	it('renders labels, toolbar and children', () => {
		render(FrameHarness);
		expect(screen.getByText('Test frame')).toBeInTheDocument();
		expect(screen.getByText('Caption')).toBeInTheDocument();
		expect(screen.getByText('Context')).toBeInTheDocument();
		expect(screen.getByText('Frame body')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Toggle on' })).toBeInTheDocument();
	});

	it('toggles fullscreen and reports changes', async () => {
		const onFullscreenChange = vi.fn();
		mockFullscreen();
		render(FrameHarness, { props: { onFullscreenChange } });

		screen.getByRole('button', { name: 'Toggle on' }).click();
		await vi.waitFor(() => {
			expect(onFullscreenChange).toHaveBeenCalledWith(true);
		});
		expect(screen.getByRole('button', { name: 'Toggle off' })).toBeInTheDocument();

		screen.getByRole('button', { name: 'Toggle off' }).click();
		await vi.waitFor(() => {
			expect(onFullscreenChange).toHaveBeenCalledWith(false);
		});
	});

	it('ignores fullscreen changes for another element', async () => {
		const onFullscreenChange = vi.fn();
		Object.defineProperty(document, 'fullscreenElement', {
			configurable: true,
			get: () => document.createElement('div')
		});
		render(FrameHarness, { props: { onFullscreenChange } });
		document.dispatchEvent(new Event('fullscreenchange'));
		expect(onFullscreenChange).not.toHaveBeenCalledWith(true);
	});

	it('removes its fullscreen listener when unmounted', () => {
		const onFullscreenChange = vi.fn();
		mockFullscreen();
		render(FrameHarness, { props: { onFullscreenChange } });
		cleanup();
		const calls = onFullscreenChange.mock.calls.length;
		document.dispatchEvent(new Event('fullscreenchange'));
		expect(onFullscreenChange.mock.calls.length).toBe(calls);
	});

	it('logs fullscreen failures without crashing', async () => {
		const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
		vi.spyOn(HTMLElement.prototype, 'requestFullscreen').mockRejectedValue(
			new Error('not allowed')
		);
		render(FrameHarness);

		screen.getByRole('button', { name: 'Toggle on' }).click();
		await vi.waitFor(() => {
			expect(error).toHaveBeenCalled();
		});
		expect(screen.getByRole('button', { name: 'Toggle on' })).toBeInTheDocument();
	});

	it('can disable the background wrapper', () => {
		const { container } = render(FrameHarness, { props: { noBackground: true } });
		expect(container.querySelector('.frame-wrapper')).not.toHaveClass('zeltron-body-background');
	});
});
