import {
	syncScroll,
	attachAxis,
	doubleAnimationFrame,
	makeTrack,
	styleTrack,
	readInlineStyle,
	restoreInlineStyle
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
	const previousScrollbarWidth = readInlineStyle(node, 'scrollbar-width');
	node.setAttribute('data-custom-scrollbar', '');
	node.style.setProperty('scrollbar-width', 'none');

	const axes = [
		vTrack && vThumb ? { track: vTrack, thumb: vThumb, dir: 'v' as const } : null,
		hTrack && hThumb ? { track: hTrack, thumb: hThumb, dir: 'h' as const } : null
	].filter((axis): axis is { track: HTMLElement; thumb: HTMLElement; dir: 'v' | 'h' } =>
		Boolean(axis)
	);
	const syncAll = () => {
		for (const axis of axes) syncScroll(node, axis.track, axis.thumb, axis.dir);
	};
	const eventCleanups = axes.flatMap((axis) => attachAxis(node, axis.track, axis.thumb, axis.dir));

	const resizeObserver = new ResizeObserver(syncAll);
	resizeObserver.observe(node);
	if (vTrack?.parentElement) resizeObserver.observe(vTrack.parentElement);
	if (hTrack?.parentElement) resizeObserver.observe(hTrack.parentElement);

	const mutationObserver = new MutationObserver(() => {
		requestAnimationFrame(syncAll);
	});
	mutationObserver.observe(node, { attributes: true, subtree: true });

	doubleAnimationFrame(syncAll);

	let destroyed = false;
	return {
		destroy() {
			if (destroyed) return;
			destroyed = true;
			node.removeAttribute('data-custom-scrollbar');
			restoreInlineStyle(node, 'scrollbar-width', previousScrollbarWidth);
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
	const forcedParents = new Map<HTMLElement, ReturnType<typeof readInlineStyle>>();

	const revertEnsurePos = (elem: HTMLElement) => {
		const count = posRefCount.get(elem);
		if (count === undefined) return;
		if (count > 1) {
			posRefCount.set(elem, count - 1);
			return;
		}
		const previous = forcedParents.get(elem);
		if (previous) {
			restoreInlineStyle(elem, 'position', previous);
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
			forcedParents.set(elem, readInlineStyle(elem, 'position'));
			elem.style.setProperty('position', 'relative', 'important');
		}
		posRefCount.set(elem, (posRefCount.get(elem) ?? 0) + 1);
	};

	const processScrollable = (el: HTMLElement) => {
		const axes = getScrollAxes(el);
		if (!axes.v && !axes.h) return;

		const affectedParents: HTMLElement[] = [];
		const tracks = new Map<'v' | 'h', { track: HTMLElement; thumb: HTMLElement }>();
		for (const { dir, needed } of [
			{ dir: 'v' as const, needed: axes.v },
			{ dir: 'h' as const, needed: axes.h }
		]) {
			if (!needed) continue;
			const parent = el.parentElement;
			if (!parent) continue;
			ensurePos(parent);
			affectedParents.push(parent);
			const trackParts = makeTrack(dir);
			styleTrack(trackParts.track, dir);
			parent.appendChild(trackParts.track);
			tracks.set(dir, trackParts);
		}
		const vTrack = tracks.get('v')?.track ?? null;
		const vThumb = tracks.get('v')?.thumb ?? null;
		const hTrack = tracks.get('h')?.track ?? null;
		const hThumb = tracks.get('h')?.thumb ?? null;

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
