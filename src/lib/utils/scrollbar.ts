import { on } from 'svelte/events';
import {
	syncScroll,
	setupDrag,
	setupTrackClick,
	updateThumbAriaLabel,
	cleanupActiveDrag,
	doubleAnimationFrame,
	makeTrack
} from './scrollbar-core';
import { processAce, ensureAceProcessed, type AceScrollbarInstance } from './scrollbar-ace';
import { scrollbarTrackSize, scrollbarTrackOverhang } from '$lib/constants/app.constants';

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

	doubleAnimationFrame(() => {
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
			cleanupActiveDrag();
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

interface ScrollbarInstance {
	destroy: () => void;
}

export const setupScrollbars = (container: HTMLElement = document.body) => {
	const instances = new Map<HTMLElement, ScrollbarInstance>();
	const aceInstances = new Map<HTMLElement, AceScrollbarInstance>();
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
		for (const [el, inst] of aceInstances) {
			if (!document.body.contains(el)) {
				inst.destroy();
				aceInstances.delete(el);
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
				vTrack.style.height = `calc(100% + ${String(scrollbarTrackOverhang)}px)`;
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

	const processAddedNode = (node: HTMLElement) => {
		const editor = node.classList.contains('ace_editor')
			? node
			: node.closest<HTMLElement>('.ace_editor');
		if (editor) {
			ensureAceProcessed(editor, aceInstances);
		} else {
			const editors = node.querySelectorAll<HTMLElement>('.ace_editor');
			for (const aceEditor of editors) ensureAceProcessed(aceEditor, aceInstances);
		}

		processScrollable(node);
		node.querySelectorAll<HTMLElement>('*').forEach(processScrollable);
	};

	const allElements = container.querySelectorAll<HTMLElement>('*');
	for (const element of allElements) processScrollable(element);

	const aceEditors = container.querySelectorAll<HTMLElement>('.ace_editor');
	for (const editor of aceEditors) processAce(editor, aceInstances);

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
			for (const instance of aceInstances.values()) instance.destroy();
			instances.clear();
			aceInstances.clear();
		}
	};
};
