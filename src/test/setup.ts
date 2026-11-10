import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/svelte';
import { afterEach, vi } from 'vitest';

afterEach(() => {
	cleanup();
});

vi.mock('$app/paths', () => ({
	resolve: (path: string) => path,
	asset: (path: string) => `/${path}`,
	base: ''
}));

vi.mock('$app/navigation', () => ({
	afterNavigate: vi.fn(),
	goto: vi.fn()
}));

vi.mock('$app/environment', () => ({
	browser: true,
	dev: true,
	building: false,
	version: 'test'
}));

class ResizeObserverMock {
	public readonly observe = vi.fn();
	public readonly unobserve = vi.fn();
	public readonly disconnect = vi.fn();
}

vi.stubGlobal('ResizeObserver', ResizeObserverMock);

if (typeof window !== 'undefined') {
	if (typeof window.matchMedia !== 'function') {
		vi.stubGlobal('matchMedia', (query: string) => ({
			matches: false,
			media: query,
			onchange: null,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			addListener: vi.fn(),
			removeListener: vi.fn(),
			dispatchEvent: vi.fn()
		}));
	}

	const requestAnimationFrameMock = (callback: FrameRequestCallback): number =>
		window.setTimeout(() => {
			if (typeof requestAnimationFrame === 'function') callback(performance.now());
		}, 0);

	const cancelAnimationFrameMock = (id: number): void => {
		window.clearTimeout(id);
	};

	vi.stubGlobal('requestAnimationFrame', requestAnimationFrameMock);
	vi.stubGlobal('cancelAnimationFrame', cancelAnimationFrameMock);

	Object.defineProperty(navigator, 'clipboard', {
		configurable: true,
		value: {
			writeText: vi.fn(async () => {
				await Promise.resolve();
			})
		}
	});

	Object.defineProperty(document, 'fullscreenElement', {
		configurable: true,
		get: () => null
	});

	HTMLElement.prototype.requestFullscreen = vi.fn(async () => {
		await Promise.resolve();
	});
	document.exitFullscreen = vi.fn(async () => {
		await Promise.resolve();
	});

	Object.defineProperty(Element.prototype, 'animate', {
		configurable: true,
		value: () => {
			let finishHandler: (() => void) | null = null;
			const animation = {
				cancel: vi.fn(),
				finish: vi.fn(),
				play: vi.fn(),
				pause: vi.fn(),
				reverse: vi.fn(),
				finished: Promise.resolve(),
				oncancel: null,
				currentTime: 0,
				playState: 'finished'
			};
			Object.defineProperty(animation, 'onfinish', {
				configurable: true,
				get: () => finishHandler,
				set: (handler: (() => void) | null) => {
					finishHandler = handler;
					if (handler) queueMicrotask(handler);
				}
			});
			return animation;
		}
	});
}
