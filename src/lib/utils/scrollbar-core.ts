import { on } from 'svelte/events';
import {
	scrollbarMinThumbV,
	scrollbarMinThumbH,
	scrollbarTrackSize,
	scrollbarHideEpsilon
} from '$lib/constants/app.constants';

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
	requestAnimationFrame(() => requestAnimationFrame(fn));
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
	const scrollPos = isVertical ? node.scrollTop : node.scrollLeft;
	const trackSize = isVertical ? track.clientHeight : track.clientWidth;

	if (scrollSize <= clientSize + scrollbarHideEpsilon) {
		track.style.display = 'none';
		return;
	}
	track.style.display = '';
	if (!trackSize) return;

	const thumbSize = Math.max(
		isVertical ? scrollbarMinThumbV : scrollbarMinThumbH,
		(clientSize / scrollSize) * trackSize
	);
	const maxPos = trackSize - thumbSize;
	if (maxPos <= 0) return;

	const thumbPos = Math.min((scrollPos / (scrollSize - clientSize)) * maxPos, maxPos);
	if (isVertical) {
		thumb.style.height = `${String(thumbSize)}px`;
		thumb.style.top = `${String(thumbPos)}px`;
	} else {
		thumb.style.width = `${String(thumbSize)}px`;
		thumb.style.left = `${String(thumbPos)}px`;
	}
};

let activeDragCleanup: (() => void) | null = null;

export const cleanupActiveDrag = () => {
	if (activeDragCleanup) {
		activeDragCleanup();
		activeDragCleanup = null;
	}
};

export const setupDrag = (
	thumb: HTMLElement,
	node: HTMLElement,
	track: HTMLElement,
	dir: 'v' | 'h'
) => {
	const isVertical = dir === 'v';
	on(thumb, 'mousedown', (event: MouseEvent) => {
		event.preventDefault();
		node.style.setProperty('scroll-behavior', 'auto');

		const startPos = isVertical ? event.clientY : event.clientX;
		const startScrollPos = isVertical ? node.scrollTop : node.scrollLeft;
		const scrollSize = isVertical ? node.scrollHeight : node.scrollWidth;
		const clientSize = isVertical ? node.clientHeight : node.clientWidth;
		const scrollRange = scrollSize - clientSize;
		if (!scrollRange) return;

		const trackSize = isVertical ? track.clientHeight : track.clientWidth;
		const thumbSize = Math.max(
			isVertical ? scrollbarMinThumbV : scrollbarMinThumbH,
			(clientSize / scrollSize) * trackSize
		);
		const maxPos = trackSize - thumbSize;
		if (maxPos <= 0) return;

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

		cleanupActiveDrag();
		const cleanupMove = on(document, 'mousemove', onMove);
		const cleanupUp = on(document, 'mouseup', cleanupActiveDrag);
		activeDragCleanup = () => {
			node.style.removeProperty('scroll-behavior');
			cleanupMove();
			cleanupUp();
			activeDragCleanup = null;
		};
	});
};

export const setupTrackClick = (track: HTMLElement, node: HTMLElement, dir: 'v' | 'h') => {
	const isVertical = dir === 'v';
	on(track, 'click', (event: MouseEvent) => {
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
	const percent = Math.round((scrollPos / (scrollSize - clientSize)) * 100);
	thumb.setAttribute('aria-label', `Scroll: ${String(percent)}%`);
};
