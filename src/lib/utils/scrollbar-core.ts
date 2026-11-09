import { on } from 'svelte/events';
import {
	scrollbarMinThumbV,
	scrollbarMinThumbH,
	scrollbarTrackSize,
	scrollbarHideEpsilon
} from '#lib/constants/app.constants.js';

export const makeTrack = (dir: 'v' | 'h') => {
	const track = document.createElement('div');
	track.className = `custom-scrollbar-track-${dir}`;
	const thumb = document.createElement('button');
	thumb.type = 'button';
	thumb.className = `custom-scrollbar-thumb-${dir}`;
	if (dir === 'v') {
		thumb.style.minHeight = `${String(scrollbarMinThumbV)}px`;
		thumb.style.width = `${String(scrollbarTrackSize)}px`;
	} else {
		thumb.style.minWidth = `${String(scrollbarMinThumbH)}px`;
		thumb.style.height = `${String(scrollbarTrackSize)}px`;
	}
	thumb.setAttribute('data-custom-scrollbar-thumb', '');
	track.appendChild(thumb);
	return { track, thumb };
};

export const doubleAnimationFrame = (fn: () => void) => {
	requestAnimationFrame(() => {
		requestAnimationFrame(fn);
	});
};

const getThumbGeometry = (node: HTMLElement, track: HTMLElement, dir: 'v' | 'h') => {
	const isVertical = dir === 'v';
	const scrollSize = isVertical ? node.scrollHeight : node.scrollWidth;
	const clientSize = isVertical ? node.clientHeight : node.clientWidth;
	const trackSize = isVertical ? track.clientHeight : track.clientWidth;
	const thumbSize = Math.max(
		isVertical ? scrollbarMinThumbV : scrollbarMinThumbH,
		(clientSize / scrollSize) * trackSize
	);
	return {
		isVertical,
		scrollSize,
		clientSize,
		trackSize,
		thumbSize,
		maxPos: trackSize - thumbSize
	};
};

export const syncScroll = (
	node: HTMLElement,
	track: HTMLElement,
	thumb: HTMLElement,
	dir: 'v' | 'h'
) => {
	const isVertical = dir === 'v';
	const scrollSize = isVertical ? node.scrollHeight : node.scrollWidth;
	const clientSize = isVertical ? node.clientHeight : node.clientWidth;

	if (scrollSize <= clientSize + scrollbarHideEpsilon) {
		track.style.display = 'none';
		return;
	}
	track.style.display = '';

	const { trackSize, thumbSize, maxPos } = getThumbGeometry(node, track, dir);
	if (!trackSize || maxPos <= 0) return;

	const scrollPos = isVertical ? node.scrollTop : node.scrollLeft;
	const scrollRange = scrollSize - clientSize;
	const thumbPos = Math.max(0, Math.min((scrollPos / scrollRange) * maxPos, maxPos));
	if (isVertical) {
		thumb.style.height = `${String(thumbSize)}px`;
		thumb.style.top = `${String(thumbPos)}px`;
	} else {
		thumb.style.width = `${String(thumbSize)}px`;
		thumb.style.left = `${String(thumbPos)}px`;
	}
};

export const setupDrag = (
	thumb: HTMLElement,
	node: HTMLElement,
	track: HTMLElement,
	dir: 'v' | 'h'
) => {
	const isVertical = dir === 'v';
	let dragCleanup: (() => void) | null = null;

	const cleanupDrag = () => {
		if (!dragCleanup) return;
		dragCleanup();
		dragCleanup = null;
	};

	const cleanupMouseDown = on(thumb, 'mousedown', (event: MouseEvent) => {
		event.preventDefault();
		cleanupDrag();

		const startPos = isVertical ? event.clientY : event.clientX;
		const startScrollPos = isVertical ? node.scrollTop : node.scrollLeft;
		const { scrollSize, clientSize, maxPos } = getThumbGeometry(node, track, dir);
		const scrollRange = scrollSize - clientSize;
		if (scrollRange <= 0 || maxPos <= 0) return;

		node.style.setProperty('scroll-behavior', 'auto');

		const startThumbPos = (startScrollPos / scrollRange) * maxPos;
		if (isVertical) {
			thumb.style.top = `${String(startThumbPos)}px`;
		} else {
			thumb.style.left = `${String(startThumbPos)}px`;
		}

		const onMove = (moveEvent: MouseEvent) => {
			moveEvent.preventDefault();
			const delta = (isVertical ? moveEvent.clientY : moveEvent.clientX) - startPos;
			const thumbPos = Math.max(0, Math.min(maxPos, startThumbPos + delta));
			if (isVertical) {
				thumb.style.top = `${String(thumbPos)}px`;
				node.scrollTop = (thumbPos / maxPos) * scrollRange;
			} else {
				thumb.style.left = `${String(thumbPos)}px`;
				node.scrollLeft = (thumbPos / maxPos) * scrollRange;
			}
		};

		const cleanupMove = on(document, 'mousemove', onMove);
		const cleanupUp = on(document, 'mouseup', cleanupDrag);
		dragCleanup = () => {
			node.style.removeProperty('scroll-behavior');
			cleanupMove();
			cleanupUp();
		};
	});

	return () => {
		cleanupMouseDown();
		cleanupDrag();
	};
};

export const setupTrackClick = (track: HTMLElement, node: HTMLElement, dir: 'v' | 'h') => {
	const isVertical = dir === 'v';
	const cleanup = on(track, 'click', (event: MouseEvent) => {
		if (event.target !== track) return;
		const scrollRange =
			(isVertical ? node.scrollHeight : node.scrollWidth) -
			(isVertical ? node.clientHeight : node.clientWidth);
		if (!scrollRange) return;

		const rect = track.getBoundingClientRect();
		node.style.setProperty('scroll-behavior', 'auto');
		if (isVertical) {
			node.scrollTop = ((event.clientY - rect.top) / rect.height) * scrollRange;
		} else {
			node.scrollLeft = ((event.clientX - rect.left) / rect.width) * scrollRange;
		}
		node.style.removeProperty('scroll-behavior');
	});
	return cleanup;
};

export const updateThumbAriaLabel = (node: HTMLElement, thumb: HTMLElement, dir: 'v' | 'h') => {
	const isVertical = dir === 'v';
	const scrollSize = isVertical ? node.scrollHeight : node.scrollWidth;
	const clientSize = isVertical ? node.clientHeight : node.clientWidth;
	const scrollPos = isVertical ? node.scrollTop : node.scrollLeft;
	if (scrollSize <= clientSize + scrollbarHideEpsilon) {
		thumb.removeAttribute('aria-label');
		return;
	}
	const clamped = Math.max(0, Math.min(scrollPos, scrollSize - clientSize));
	const percent = Math.round((clamped / (scrollSize - clientSize)) * 100);
	thumb.setAttribute('aria-label', `Scroll: ${String(percent)}%`);
};

export const attachAxis = (
	node: HTMLElement,
	track: HTMLElement,
	thumb: HTMLElement,
	dir: 'v' | 'h'
) => {
	const cleanups: (() => void)[] = [
		on(node, 'scroll', () => {
			syncScroll(node, track, thumb, dir);
			updateThumbAriaLabel(node, thumb, dir);
		}),
		setupDrag(thumb, node, track, dir),
		setupTrackClick(track, node, dir)
	];
	updateThumbAriaLabel(node, thumb, dir);
	return cleanups;
};
