import { on } from 'svelte/events';
import {
	scrollbarTrackSize,
	scrollbarZIndex,
	scrollbarAceSetupTimeout,
	scrollbarTrackOverhang
} from '$lib/constants/app.constants';
import {
	makeTrack,
	syncScroll,
	setupDrag,
	setupTrackClick,
	updateThumbAriaLabel,
	doubleAnimationFrame
} from './scrollbar-core';

export interface AceTrackEntry {
	el: HTMLElement;
	track: HTMLElement;
	thumb: HTMLElement;
	dir: 'v' | 'h';
	cleanups: (() => void)[];
}

export interface AceScrollbarInstance {
	tracks: AceTrackEntry[];
	resizeObserver: ResizeObserver;
	mutationObserver: MutationObserver;
	setupObserver?: MutationObserver;
	setupTimeoutId?: ReturnType<typeof setTimeout>;
	destroy: () => void;
}

const setupAceTrack = (editorEl: HTMLElement, el: HTMLElement, dir: 'v' | 'h') => {
	el.setAttribute('data-custom-scrollbar', '');
	el.style.setProperty('scrollbar-width', 'none');
	el.style.pointerEvents = 'none';
	el.style.background = 'transparent';

	const { track, thumb } = makeTrack(dir);
	track.style.zIndex = String(scrollbarZIndex);
	if (dir === 'v') {
		track.style.top = '0';
		track.style.right = '0';
		track.style.width = `${String(scrollbarTrackSize)}px`;
		track.style.height = `calc(100% + ${String(scrollbarTrackOverhang)}px)`;
	} else {
		track.style.bottom = '0';
		track.style.left = '0';
		track.style.right = '0';
		track.style.height = `${String(scrollbarTrackSize)}px`;
	}
	editorEl.appendChild(track);
	const cleanups: (() => void)[] = [];
	cleanups.push(
		on(el, 'scroll', () => {
			syncScroll(el, track, thumb, dir);
			updateThumbAriaLabel(el, thumb, dir);
		})
	);
	cleanups.push(setupDrag(thumb, el, track, dir));
	cleanups.push(setupTrackClick(track, el, dir));
	updateThumbAriaLabel(el, thumb, dir);
	return { el, track, thumb, dir, cleanups };
};

export const processAce = (
	editorEl: HTMLElement,
	instances: Map<HTMLElement, AceScrollbarInstance>
) => {
	const pending: { el: HTMLElement; dir: 'v' | 'h' }[] = [];
	const vScrollbarEl = editorEl.querySelector<HTMLElement>('.ace_scrollbar');
	const hScrollbarEl = editorEl.querySelector<HTMLElement>('.ace_scrollbar-h');
	if (vScrollbarEl && !vScrollbarEl.hasAttribute('data-custom-scrollbar'))
		pending.push({ el: vScrollbarEl, dir: 'v' });
	if (hScrollbarEl && !hScrollbarEl.hasAttribute('data-custom-scrollbar'))
		pending.push({ el: hScrollbarEl, dir: 'h' });
	if (!pending.length) return;

	const scroller = editorEl.querySelector<HTMLElement>('.ace_scroller');
	const existing = instances.get(editorEl);

	const tracks = existing?.tracks ?? [];

	for (const { el, dir } of pending) {
		const trackInfo = setupAceTrack(editorEl, el, dir);
		tracks.push(trackInfo);
		if (existing != null) {
			existing.resizeObserver.observe(trackInfo.el);
			if (trackInfo.el.firstElementChild != null)
				existing.resizeObserver.observe(trackInfo.el.firstElementChild);
			existing.mutationObserver.observe(trackInfo.el, { attributes: true, subtree: true });
			doubleAnimationFrame(() => {
				syncScroll(trackInfo.el, trackInfo.track, trackInfo.thumb, trackInfo.dir);
			});
		}
	}

	if (existing != null) return;

	editorEl.style.setProperty('isolation', 'isolate');

	const resizeObserver = new ResizeObserver(() => {
		for (const trackEntry of tracks)
			syncScroll(trackEntry.el, trackEntry.track, trackEntry.thumb, trackEntry.dir);
	});
	for (const trackEntry of tracks) {
		resizeObserver.observe(trackEntry.el);
		if (trackEntry.el.firstElementChild != null)
			resizeObserver.observe(trackEntry.el.firstElementChild);
	}
	if (scroller?.firstElementChild) resizeObserver.observe(scroller.firstElementChild);

	const mutationObserver = new MutationObserver(() => {
		for (const trackEntry of tracks) {
			requestAnimationFrame(() => {
				syncScroll(trackEntry.el, trackEntry.track, trackEntry.thumb, trackEntry.dir);
			});
		}
	});
	for (const trackEntry of tracks)
		mutationObserver.observe(trackEntry.el, { attributes: true, subtree: true });

	doubleAnimationFrame(() => {
		for (const trackEntry of tracks)
			syncScroll(trackEntry.el, trackEntry.track, trackEntry.thumb, trackEntry.dir);
	});

	const instance: AceScrollbarInstance = {
		tracks,
		resizeObserver,
		mutationObserver,
		destroy() {
			resizeObserver.disconnect();
			mutationObserver.disconnect();
			instance.setupObserver?.disconnect();
			if (instance.setupTimeoutId !== undefined) clearTimeout(instance.setupTimeoutId);
			for (const trackEntry of tracks) {
				trackEntry.cleanups.forEach((cleanup) => {
					cleanup();
				});
				trackEntry.track.remove();
				trackEntry.el.removeAttribute('data-custom-scrollbar');
				trackEntry.el.style.removeProperty('scrollbar-width');
				trackEntry.el.style.removeProperty('pointer-events');
				trackEntry.el.style.removeProperty('background');
			}
			editorEl.style.removeProperty('isolation');
		}
	};
	instances.set(editorEl, instance);
};

export const ensureAceProcessed = (
	editorEl: HTMLElement,
	instances: Map<HTMLElement, AceScrollbarInstance>
) => {
	processAce(editorEl, instances);

	const unprocessedSelector =
		'.ace_scrollbar:not([data-custom-scrollbar]), .ace_scrollbar-h:not([data-custom-scrollbar])';
	if (!editorEl.querySelector(unprocessedSelector)) return;

	const instance = instances.get(editorEl);
	if (!instance) return;

	instance.setupObserver?.disconnect();
	if (instance.setupTimeoutId !== undefined) clearTimeout(instance.setupTimeoutId);

	const setupObserver = new MutationObserver(() => {
		processAce(editorEl, instances);
		if (!editorEl.querySelector(unprocessedSelector)) setupObserver.disconnect();
	});
	setupObserver.observe(editorEl, { childList: true, subtree: true });
	instance.setupObserver = setupObserver;
	instance.setupTimeoutId = setTimeout(() => {
		setupObserver.disconnect();
		delete instance.setupTimeoutId;
	}, scrollbarAceSetupTimeout);
};
