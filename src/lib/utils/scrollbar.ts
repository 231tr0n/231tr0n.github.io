import { on } from 'svelte/events';
import {
	scrollbarMinThumbV,
	scrollbarMinThumbH,
	scrollbarTrackSize,
	scrollbarZIndex,
	scrollbarAceSetupTimeout
} from '$lib/constants/app.constants';

const makeTrack = (dir: 'v' | 'h') => {
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

const doubleRAF = (fn: () => void) => {
	requestAnimationFrame(() => requestAnimationFrame(fn));
};

const syncScroll = (node: HTMLElement, track: HTMLElement, thumb: HTMLElement, dir: 'v' | 'h') => {
	const isVertical = dir === 'v';
	const scrollSize = isVertical ? node.scrollHeight : node.scrollWidth;
	const clientSize = isVertical ? node.clientHeight : node.clientWidth;
	const scrollPos = isVertical ? node.scrollTop : node.scrollLeft;
	const trackSize = isVertical ? track.clientHeight : track.clientWidth;

	if (scrollSize <= clientSize + 1) {
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

const setupDrag = (thumb: HTMLElement, node: HTMLElement, track: HTMLElement, dir: 'v' | 'h') => {
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

		const cleanupMove = on(document, 'mousemove', onMove);
		const cleanupUp = on(document, 'mouseup', () => {
			node.style.removeProperty('scroll-behavior');
			cleanupMove();
			cleanupUp();
		});
	});
};

const setupTrackClick = (track: HTMLElement, node: HTMLElement, dir: 'v' | 'h') => {
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

const updateThumbAriaLabel = (node: HTMLElement, thumb: HTMLElement, dir: 'v' | 'h') => {
	const isVertical = dir === 'v';
	const scrollSize = isVertical ? node.scrollHeight : node.scrollWidth;
	const clientSize = isVertical ? node.clientHeight : node.clientWidth;
	const scrollPos = isVertical ? node.scrollTop : node.scrollLeft;
	if (scrollSize <= clientSize + 1) {
		thumb.removeAttribute('aria-label');
		return;
	}
	const percent = Math.round((scrollPos / (scrollSize - clientSize)) * 100);
	thumb.setAttribute('aria-label', `Scroll: ${String(percent)}%`);
};

const setupAxis = (node: HTMLElement, track: HTMLElement, thumb: HTMLElement, dir: 'v' | 'h') => {
	on(node, 'scroll', () => {
		syncScroll(node, track, thumb, dir);
		updateThumbAriaLabel(node, thumb, dir);
	});
	setupDrag(thumb, node, track, dir);
	setupTrackClick(track, node, dir);
	updateThumbAriaLabel(node, thumb, dir);
};

const initScrollbar = (
	node: HTMLElement,
	vTrack: HTMLElement | null,
	vThumb: HTMLElement | null,
	hTrack: HTMLElement | null,
	hThumb: HTMLElement | null,
	onDestroy?: () => void
) => {
	const prevScrollTop = node.scrollTop;
	const prevScrollLeft = node.scrollLeft;

	node.setAttribute('data-custom-scrollbar', '');
	node.style.setProperty('scrollbar-width', 'none');

	node.scrollTop = prevScrollTop;
	node.scrollLeft = prevScrollLeft;

	if (vTrack && vThumb) setupAxis(node, vTrack, vThumb, 'v');
	if (hTrack && hThumb) setupAxis(node, hTrack, hThumb, 'h');

	const resizeObserver = new ResizeObserver(() => {
		if (vTrack && vThumb) syncScroll(node, vTrack, vThumb, 'v');
		if (hTrack && hThumb) syncScroll(node, hTrack, hThumb, 'h');
	});
	resizeObserver.observe(node);
	if (vTrack?.parentElement) resizeObserver.observe(vTrack.parentElement);
	if (hTrack?.parentElement) resizeObserver.observe(hTrack.parentElement);

	const mutationObserver = new MutationObserver(() => {
		requestAnimationFrame(() => {
			if (vTrack && vThumb) syncScroll(node, vTrack, vThumb, 'v');
			if (hTrack && hThumb) syncScroll(node, hTrack, hThumb, 'h');
		});
	});
	mutationObserver.observe(node, { attributes: true, subtree: true });

	doubleRAF(() => {
		if (vTrack && vThumb) syncScroll(node, vTrack, vThumb, 'v');
		if (hTrack && hThumb) syncScroll(node, hTrack, hThumb, 'h');
	});

	let destroyed = false;
	return {
		destroy() {
			if (destroyed) return;
			destroyed = true;
			node.removeAttribute('data-custom-scrollbar');
			node.style.removeProperty('scrollbar-width');
			resizeObserver.disconnect();
			mutationObserver.disconnect();
			if (vTrack) vTrack.remove();
			if (hTrack) hTrack.remove();
			onDestroy?.();
		}
	};
};

const getScrollAxes = (el: HTMLElement): { v: boolean; h: boolean } => {
	if (el === document.body || el === document.documentElement) return { v: false, h: false };
	if (el.hasAttribute('data-custom-scrollbar')) return { v: false, h: false };
	if (el.closest('.ace_editor')) return { v: false, h: false };
	if (getComputedStyle(el).position === 'fixed') return { v: false, h: false };

	const computedStyle = getComputedStyle(el);
	return {
		v: computedStyle.overflowY === 'auto' || computedStyle.overflowY === 'scroll',
		h: computedStyle.overflowX === 'auto' || computedStyle.overflowX === 'scroll'
	};
};

interface TrackEntry {
	el: HTMLElement;
	track: HTMLElement;
	thumb: HTMLElement;
	dir: 'v' | 'h';
}

interface ScrollbarInstance {
	tracks?: TrackEntry[];
	resizeObserver?: ResizeObserver;
	mutationObserver?: MutationObserver;
	destroy: () => void;
}

export const setupScrollbars = (container: HTMLElement = document.body) => {
	const instances = new Map<HTMLElement, ScrollbarInstance>();
	const posRefCount = new Map<HTMLElement, number>();

	const revertEnsurePos = (elem: HTMLElement) => {
		const count = posRefCount.get(elem);
		if (count === undefined) return;
		if (count <= 1) {
			elem.style.removeProperty('position');
			posRefCount.delete(elem);
		} else {
			posRefCount.set(elem, count - 1);
		}
	};

	const pruneDetached = () => {
		for (const [el, inst] of instances) {
			if (!document.body.contains(el)) {
				inst.destroy();
				instances.delete(el);
			}
		}
	};

	const ensurePos = (elem: HTMLElement) => {
		if (getComputedStyle(elem).position === 'static') {
			elem.style.position = 'relative';
			posRefCount.set(elem, (posRefCount.get(elem) ?? 0) + 1);
		}
	};

	const processScrollable = (el: HTMLElement) => {
		const axes = getScrollAxes(el);
		if (!axes.v && !axes.h) return;

		let vTrack: HTMLElement | null = null;
		let vThumb: HTMLElement | null = null;
		let hTrack: HTMLElement | null = null;
		let hThumb: HTMLElement | null = null;
		const affectedParents: HTMLElement[] = [];

		if (axes.v) {
			const parent = el.parentElement;
			if (parent) {
				ensurePos(parent);
				affectedParents.push(parent);
				const trackParts = makeTrack('v');
				vTrack = trackParts.track;
				vThumb = trackParts.thumb;
				vTrack.style.top = '0';
				vTrack.style.right = '0';
				vTrack.style.width = `${String(scrollbarTrackSize)}px`;
				vTrack.style.height = 'calc(100% + 2px)';
				parent.appendChild(vTrack);
			}
		}

		if (axes.h) {
			const parent = el.parentElement;
			if (parent) {
				ensurePos(parent);
				affectedParents.push(parent);
				const trackParts = makeTrack('h');
				hTrack = trackParts.track;
				hThumb = trackParts.thumb;
				hTrack.style.bottom = '0';
				hTrack.style.left = '0';
				hTrack.style.right = '0';
				hTrack.style.height = `${String(scrollbarTrackSize)}px`;
				parent.appendChild(hTrack);
			}
		}

		if (vTrack || hTrack) {
			const instance = initScrollbar(el, vTrack, vThumb, hTrack, hThumb, () => {
				for (const parent of affectedParents) revertEnsurePos(parent);
			});
			instances.set(el, instance);
		}
	};

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
			track.style.height = 'calc(100% + 2px)';
		} else {
			track.style.bottom = '0';
			track.style.left = '0';
			track.style.right = '0';
			track.style.height = `${String(scrollbarTrackSize)}px`;
		}
		editorEl.appendChild(track);
		on(el, 'scroll', () => {
			syncScroll(el, track, thumb, dir);
			updateThumbAriaLabel(el, thumb, dir);
		});
		setupDrag(thumb, el, track, dir);
		setupTrackClick(track, el, dir);
		updateThumbAriaLabel(el, thumb, dir);
		return { el, track, thumb, dir };
	};

	const processAce = (editorEl: HTMLElement) => {
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
				existing.resizeObserver?.observe(trackInfo.el);
				if (trackInfo.el.firstElementChild != null)
					existing.resizeObserver?.observe(trackInfo.el.firstElementChild);
				existing.mutationObserver?.observe(trackInfo.el, { attributes: true, subtree: true });
				doubleRAF(() => {
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

		doubleRAF(() => {
			for (const trackEntry of tracks)
				syncScroll(trackEntry.el, trackEntry.track, trackEntry.thumb, trackEntry.dir);
		});

		const instance = {
			tracks,
			resizeObserver,
			mutationObserver,
			destroy() {
				resizeObserver.disconnect();
				mutationObserver.disconnect();
				for (const trackEntry of tracks) {
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

	const ensureAceProcessed = (editorEl: HTMLElement) => {
		processAce(editorEl);

		const unprocessedSelector =
			'.ace_scrollbar:not([data-custom-scrollbar]), .ace_scrollbar-h:not([data-custom-scrollbar])';
		if (!editorEl.querySelector(unprocessedSelector)) return;

		const mutationObserver = new MutationObserver(() => {
			processAce(editorEl);
			if (!editorEl.querySelector(unprocessedSelector)) mutationObserver.disconnect();
		});
		mutationObserver.observe(editorEl, { childList: true, subtree: true });
		setTimeout(() => {
			mutationObserver.disconnect();
		}, scrollbarAceSetupTimeout);
	};

	const processAddedNode = (node: HTMLElement) => {
		const editor = node.classList.contains('ace_editor')
			? node
			: node.closest<HTMLElement>('.ace_editor');
		if (editor) {
			ensureAceProcessed(editor);
		} else {
			const editors = node.querySelectorAll<HTMLElement>('.ace_editor');
			for (const aceEditor of editors) ensureAceProcessed(aceEditor);
		}

		processScrollable(node);
		node.querySelectorAll<HTMLElement>('*').forEach(processScrollable);
	};

	const allElements = container.querySelectorAll<HTMLElement>('*');
	for (const element of allElements) processScrollable(element);

	const aceEditors = container.querySelectorAll<HTMLElement>('.ace_editor');
	for (const editor of aceEditors) processAce(editor);

	const observer = new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			pruneDetached();
			for (const node of mutation.addedNodes) {
				if (node instanceof HTMLElement) processAddedNode(node);
			}
		}
	});
	observer.observe(container, { childList: true, subtree: true });

	return {
		destroy() {
			observer.disconnect();
			for (const instance of instances.values()) instance.destroy();
			instances.clear();
		}
	};
};
