import { afterEach, describe, expect, it, vi } from 'vitest';
import {
	attachAxis,
	doubleAnimationFrame,
	makeTrack,
	setupDrag,
	setupTrackClick,
	syncScroll,
	updateThumbAriaLabel
} from './scrollbar-core';

const setMetric = (
	element: HTMLElement,
	key: 'scrollHeight' | 'clientHeight' | 'scrollWidth' | 'clientWidth',
	value: number
) => {
	Object.defineProperty(element, key, {
		configurable: true,
		value
	});
};

const createScrollFixture = () => {
	const node = document.createElement('div');
	const track = document.createElement('div');
	const thumb = document.createElement('button');
	document.body.append(node, track, thumb);
	return { node, track, thumb };
};

afterEach(() => {
	document.body.innerHTML = '';
	vi.restoreAllMocks();
});

describe('makeTrack', () => {
	it('creates a vertical track and thumb', () => {
		const { track, thumb } = makeTrack('v');
		expect(track.className).toBe('custom-scrollbar-track-v');
		expect(thumb.className).toBe('custom-scrollbar-thumb-v');
		expect(thumb.type).toBe('button');
		expect(thumb.style.minHeight).toBe('20px');
		expect(thumb.style.width).toBe('5px');
		expect(thumb.hasAttribute('data-custom-scrollbar-thumb')).toBe(true);
		expect(track.contains(thumb)).toBe(true);
	});

	it('creates a horizontal track and thumb', () => {
		const { track, thumb } = makeTrack('h');
		expect(track.className).toBe('custom-scrollbar-track-h');
		expect(thumb.className).toBe('custom-scrollbar-thumb-h');
		expect(thumb.style.minWidth).toBe('20px');
		expect(thumb.style.height).toBe('5px');
	});
});

describe('doubleAnimationFrame', () => {
	it('runs only after two animation frames', () => {
		const callbacks: FrameRequestCallback[] = [];
		vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
			callbacks.push(callback);
			return callbacks.length;
		});
		const callback = vi.fn();

		doubleAnimationFrame(callback);
		expect(callback).not.toHaveBeenCalled();
		callbacks.shift()?.(0);
		expect(callback).not.toHaveBeenCalled();
		callbacks.shift()?.(0);
		expect(callback).toHaveBeenCalledOnce();
	});
});

describe('syncScroll', () => {
	it('hides a track when there is nothing to scroll', () => {
		const { node, track, thumb } = createScrollFixture();
		setMetric(node, 'scrollHeight', 50);
		setMetric(node, 'clientHeight', 50);

		syncScroll(node, track, thumb, 'v');
		expect(track.style.display).toBe('none');
	});

	it('sizes and positions a vertical thumb', () => {
		const { node, track, thumb } = createScrollFixture();
		setMetric(node, 'scrollHeight', 100);
		setMetric(node, 'clientHeight', 50);
		setMetric(track, 'clientHeight', 100);
		node.scrollTop = 25;

		syncScroll(node, track, thumb, 'v');
		expect(track.style.display).toBe('');
		expect(thumb.style.height).toBe('50px');
		expect(thumb.style.top).toBe('25px');
	});

	it('sizes and positions a horizontal thumb', () => {
		const { node, track, thumb } = createScrollFixture();
		setMetric(node, 'scrollWidth', 100);
		setMetric(node, 'clientWidth', 50);
		setMetric(track, 'clientWidth', 100);
		node.scrollLeft = 25;

		syncScroll(node, track, thumb, 'h');
		expect(thumb.style.width).toBe('50px');
		expect(thumb.style.left).toBe('25px');
	});

	it('returns when the track has no size', () => {
		const { node, track, thumb } = createScrollFixture();
		setMetric(node, 'scrollHeight', 100);
		setMetric(node, 'clientHeight', 50);
		setMetric(track, 'clientHeight', 0);

		syncScroll(node, track, thumb, 'v');
		expect(track.style.display).toBe('');
		expect(thumb.style.height).toBe('');
	});

	it('returns when the thumb has no movable range', () => {
		const { node, track, thumb } = createScrollFixture();
		setMetric(node, 'scrollHeight', 100);
		setMetric(node, 'clientHeight', 99);
		setMetric(track, 'clientHeight', 10);

		syncScroll(node, track, thumb, 'v');
		expect(thumb.style.height).toBe('');
	});
});

describe('setupDrag', () => {
	it('drags a vertical thumb and updates scroll position', () => {
		const { node, track, thumb } = createScrollFixture();
		setMetric(node, 'scrollHeight', 100);
		setMetric(node, 'clientHeight', 50);
		setMetric(track, 'clientHeight', 100);
		node.scrollTop = 0;
		const cleanup = setupDrag(thumb, node, track, 'v');

		thumb.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientY: 10 }));
		document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientY: 35 }));
		expect(node.scrollTop).toBe(25);
		expect(thumb.style.top).toBe('25px');
		expect(node.style.getPropertyValue('scroll-behavior')).toBe('auto');

		document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
		expect(node.style.getPropertyValue('scroll-behavior')).toBe('');
		cleanup();
	});

	it('drags a horizontal thumb and updates scroll position', () => {
		const { node, track, thumb } = createScrollFixture();
		setMetric(node, 'scrollWidth', 100);
		setMetric(node, 'clientWidth', 50);
		setMetric(track, 'clientWidth', 100);
		const cleanup = setupDrag(thumb, node, track, 'h');

		thumb.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 5 }));
		document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 30 }));
		expect(node.scrollLeft).toBe(25);
		expect(thumb.style.left).toBe('25px');
		document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
		cleanup();
	});

	it('restores a pre-existing scroll-behavior value', () => {
		const { node, track, thumb } = createScrollFixture();
		setMetric(node, 'scrollHeight', 100);
		setMetric(node, 'clientHeight', 50);
		setMetric(track, 'clientHeight', 100);
		node.style.setProperty('scroll-behavior', 'smooth');
		const cleanup = setupDrag(thumb, node, track, 'v');

		thumb.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientY: 10 }));
		expect(node.style.getPropertyValue('scroll-behavior')).toBe('auto');
		document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
		expect(node.style.getPropertyValue('scroll-behavior')).toBe('smooth');
		cleanup();
	});

	it('ignores drags without a scroll range', () => {
		const { node, track, thumb } = createScrollFixture();
		setMetric(node, 'scrollHeight', 50);
		setMetric(node, 'clientHeight', 50);
		setMetric(track, 'clientHeight', 100);
		const cleanup = setupDrag(thumb, node, track, 'v');

		thumb.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientY: 10 }));
		document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientY: 40 }));
		expect(node.scrollTop).toBe(0);
		cleanup();
	});
});

describe('setupTrackClick', () => {
	it('scrolls to a vertical click position', () => {
		const { node, track } = createScrollFixture();
		setMetric(node, 'scrollHeight', 100);
		setMetric(node, 'clientHeight', 50);
		vi.spyOn(track, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 10, 100));
		const cleanup = setupTrackClick(track, node, 'v');

		track.dispatchEvent(new MouseEvent('click', { bubbles: true, clientY: 50 }));
		expect(node.scrollTop).toBe(25);
		expect(node.style.getPropertyValue('scroll-behavior')).toBe('');
		cleanup();
	});

	it('scrolls to a horizontal click position', () => {
		const { node, track } = createScrollFixture();
		setMetric(node, 'scrollWidth', 100);
		setMetric(node, 'clientWidth', 50);
		vi.spyOn(track, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 100, 10));
		const cleanup = setupTrackClick(track, node, 'h');

		track.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 50 }));
		expect(node.scrollLeft).toBe(25);
		cleanup();
	});

	it('ignores clicks on the thumb and clicks without a range', () => {
		const { node, track, thumb } = createScrollFixture();
		setMetric(node, 'scrollHeight', 100);
		setMetric(node, 'clientHeight', 50);
		vi.spyOn(track, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 10, 100));
		const cleanup = setupTrackClick(track, node, 'v');

		thumb.dispatchEvent(new MouseEvent('click', { bubbles: true, clientY: 50 }));
		expect(node.scrollTop).toBe(0);

		setMetric(node, 'scrollHeight', 50);
		setMetric(node, 'clientHeight', 50);
		track.dispatchEvent(new MouseEvent('click', { bubbles: true, clientY: 50 }));
		expect(node.scrollTop).toBe(0);
		cleanup();
	});
});

describe('updateThumbAriaLabel', () => {
	it('removes the label when there is no scroll range', () => {
		const { node, thumb } = createScrollFixture();
		setMetric(node, 'scrollHeight', 50);
		setMetric(node, 'clientHeight', 50);
		thumb.setAttribute('aria-label', 'old');

		updateThumbAriaLabel(node, thumb, 'v');
		expect(thumb.hasAttribute('aria-label')).toBe(false);
	});

	it('reports a clamped scroll percentage', () => {
		const { node, thumb } = createScrollFixture();
		setMetric(node, 'scrollHeight', 100);
		setMetric(node, 'clientHeight', 50);

		node.scrollTop = 25;
		updateThumbAriaLabel(node, thumb, 'v');
		expect(thumb.getAttribute('aria-label')).toBe('Scroll: 50%');

		node.scrollTop = 200;
		updateThumbAriaLabel(node, thumb, 'v');
		expect(thumb.getAttribute('aria-label')).toBe('Scroll: 100%');

		node.scrollTop = -10;
		updateThumbAriaLabel(node, thumb, 'v');
		expect(thumb.getAttribute('aria-label')).toBe('Scroll: 0%');
	});
});

describe('attachAxis', () => {
	it('syncs on scroll and cleans up listeners', () => {
		const { node, track, thumb } = createScrollFixture();
		setMetric(node, 'scrollHeight', 100);
		setMetric(node, 'clientHeight', 50);
		setMetric(track, 'clientHeight', 100);
		const cleanups = attachAxis(node, track, thumb, 'v');

		expect(thumb.getAttribute('aria-label')).toBe('Scroll: 0%');
		node.scrollTop = 25;
		node.dispatchEvent(new Event('scroll'));
		expect(thumb.style.top).toBe('25px');
		expect(thumb.getAttribute('aria-label')).toBe('Scroll: 50%');

		for (const cleanup of cleanups) cleanup();
	});
});
