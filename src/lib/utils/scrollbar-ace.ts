import { scrollbarZIndex } from '#lib/constants/app.constants.js';
import {
	makeTrack,
	syncScroll,
	attachAxis,
	doubleAnimationFrame,
	styleTrack
} from './scrollbar-core.js';

interface AceTrackEntry {
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
	destroy: () => void;
}

const setupAceTrack = (editorEl: HTMLElement, el: HTMLElement, dir: 'v' | 'h') => {
	el.setAttribute('data-custom-scrollbar', '');
	el.style.setProperty('scrollbar-width', 'none');
	el.style.pointerEvents = 'none';
	el.style.background = 'transparent';

	const { track, thumb } = makeTrack(dir);
	track.style.zIndex = String(scrollbarZIndex);
	styleTrack(track, dir);
	editorEl.appendChild(track);
	const cleanups = attachAxis(el, track, thumb, dir);
	return { el, track, thumb, dir, cleanups };
};

export const processAce = (
	editorEl: HTMLElement,
	instances: Map<HTMLElement, AceScrollbarInstance>
) => {
	const pending: { el: HTMLElement; dir: 'v' | 'h' }[] = [];
	for (const element of editorEl.querySelectorAll<HTMLElement>(
		'.ace_scrollbar:not([data-custom-scrollbar])'
	)) {
		pending.push({ el: element, dir: 'v' });
	}
	for (const element of editorEl.querySelectorAll<HTMLElement>(
		'.ace_scrollbar-h:not([data-custom-scrollbar])'
	)) {
		pending.push({ el: element, dir: 'h' });
	}
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
			instances.delete(editorEl);
		}
	};
	instances.set(editorEl, instance);
};
