import {
	syncScroll,
	attachAxis,
	doubleAnimationFrame,
	makeTrack,
	styleTrack
} from './scrollbar-core.js';
import { processAce, type AceScrollbarInstance } from './scrollbar-ace.js';

const initScrollbar = (
	node: HTMLElement,
	vTrack: HTMLElement | null,
	vThumb: HTMLElement | null,
	hTrack: HTMLElement | null,
	hThumb: HTMLElement | null,
	onDestroy?: () => void
) => {
	node.setAttribute('data-custom-scrollbar', '');
	node.style.setProperty('scrollbar-width', 'none');

	const eventCleanups: (() => void)[] = [];
	if (vTrack && vThumb) eventCleanups.push(...attachAxis(node, vTrack, vThumb, 'v'));
	if (hTrack && hThumb) eventCleanups.push(...attachAxis(node, hTrack, hThumb, 'h'));

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
			eventCleanups.forEach((cleanup) => {
				cleanup();
			});
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

	const computedStyle = getComputedStyle(el);
	if (computedStyle.position === 'fixed') return { v: false, h: false };

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
	const forcedParents = new WeakSet<HTMLElement>();

	const revertEnsurePos = (elem: HTMLElement) => {
		const count = posRefCount.get(elem);
		if (count === undefined) return;
		if (count > 1) {
			posRefCount.set(elem, count - 1);
			return;
		}
		if (forcedParents.has(elem)) {
			elem.style.removeProperty('position');
			forcedParents.delete(elem);
		}
		posRefCount.delete(elem);
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
		if (!posRefCount.has(elem) && getComputedStyle(elem).position === 'static') {
			elem.style.position = 'relative';
			forcedParents.add(elem);
		}
		posRefCount.set(elem, (posRefCount.get(elem) ?? 0) + 1);
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
				styleTrack(vTrack, 'v');
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
				styleTrack(hTrack, 'h');
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
			processAce(editor, aceInstances);
		} else {
			const editors = node.querySelectorAll<HTMLElement>('.ace_editor');
			for (const aceEditor of editors) processAce(aceEditor, aceInstances);
		}

		processScrollable(node);
		node.querySelectorAll<HTMLElement>('*').forEach(processScrollable);
	};

	const allElements = container.querySelectorAll<HTMLElement>('*');
	for (const element of allElements) processScrollable(element);

	const aceEditors = container.querySelectorAll<HTMLElement>('.ace_editor');
	for (const editor of aceEditors) processAce(editor, aceInstances);

	const observer = new MutationObserver((mutations) => {
		pruneDetached();
		for (const mutation of mutations) {
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
