import { on } from 'svelte/events';

const getColor = function (node: HTMLElement, key: string): string {
	const dark = document.body.classList.contains('dark');
	const prefix = dark ? 'dark' : 'light';
	return getComputedStyle(node).getPropertyValue(`--color-${prefix}-${key}`).trim();
};

const makeTrack = function (dir: 'v' | 'h') {
	const track = document.createElement('div');
	track.className = `custom-scrollbar-track-${dir}`;
	track.style.position = 'absolute';
	const thumb = document.createElement('div');
	thumb.className = `custom-scrollbar-thumb-${dir}`;
	thumb.style.position = 'absolute';
	track.appendChild(thumb);
	return { track, thumb };
};

const syncScroll = function (
	node: HTMLElement,
	track: HTMLElement,
	thumb: HTMLElement,
	dir: 'v' | 'h'
) {
	const isV = dir === 'v';
	const scrollSize = isV ? node.scrollHeight : node.scrollWidth;
	const clientSize = isV ? node.clientHeight : node.clientWidth;
	const scrollPos = isV ? node.scrollTop : node.scrollLeft;
	const trackSize = isV ? track.clientHeight : track.clientWidth;

	if (scrollSize <= clientSize + 1) {
		track.style.display = 'none';
		return;
	}
	track.style.display = '';
	if (!trackSize) return;
	const thumbSize = Math.max(isV ? 20 : 40, (clientSize / scrollSize) * trackSize);
	const maxPos = trackSize - thumbSize;
	if (maxPos <= 0) return;
	if (isV) {
		thumb.style.height = `${String(thumbSize)}px`;
		thumb.style.top = `${String(Math.min((scrollPos / (scrollSize - clientSize)) * maxPos, maxPos))}px`;
	} else {
		thumb.style.width = `${String(thumbSize)}px`;
		thumb.style.left = `${String(Math.min((scrollPos / (scrollSize - clientSize)) * maxPos, maxPos))}px`;
	}
};

const setupDrag = function (
	thumb: HTMLElement,
	node: HTMLElement,
	track: HTMLElement,
	dir: 'v' | 'h'
) {
	const isV = dir === 'v';
	on(thumb, 'mousedown', (e: MouseEvent) => {
		e.preventDefault();
		node.style.setProperty('scroll-behavior', 'auto');
		const startPos = isV ? e.clientY : e.clientX;
		const startScrollPos = isV ? node.scrollTop : node.scrollLeft;

		const scrollSize = isV ? node.scrollHeight : node.scrollWidth;
		const clientSize = isV ? node.clientHeight : node.clientWidth;
		const range = scrollSize - clientSize;
		if (!range) return;
		const trackSize = isV ? track.clientHeight : track.clientWidth;
		const thumbSize = Math.max(isV ? 20 : 40, (clientSize / scrollSize) * trackSize);
		const maxPos = trackSize - thumbSize;
		if (maxPos <= 0) return;
		const startThumbPos = (startScrollPos / range) * maxPos;

		if (isV) {
			thumb.style.top = `${String(startThumbPos)}px`;
		} else {
			thumb.style.left = `${String(startThumbPos)}px`;
		}

		const onMove = (ev: MouseEvent) => {
			ev.preventDefault();
			const delta = (isV ? ev.clientY : ev.clientX) - startPos;
			const newThumbPos = Math.max(0, Math.min(maxPos, startThumbPos + delta));
			if (isV) {
				thumb.style.top = `${String(newThumbPos)}px`;
				node.scrollTop = (newThumbPos / maxPos) * range;
			} else {
				thumb.style.left = `${String(newThumbPos)}px`;
				node.scrollLeft = (newThumbPos / maxPos) * range;
			}
		};

		const onUp = () => {
			node.style.removeProperty('scroll-behavior');
			cleanupMove();
			cleanupUp();
		};

		const cleanupMove = on(document, 'mousemove', onMove);
		const cleanupUp = on(document, 'mouseup', onUp);
	});
};

const setupTrackClick = function (track: HTMLElement, node: HTMLElement, dir: 'v' | 'h') {
	const isV = dir === 'v';
	on(track, 'click', (e: MouseEvent) => {
		if (e.target !== track) return;
		const range =
			(isV ? node.scrollHeight : node.scrollWidth) - (isV ? node.clientHeight : node.clientWidth);
		if (!range) return;
		const rect = track.getBoundingClientRect();
		node.style.setProperty('scroll-behavior', 'auto');
		if (isV) {
			node.scrollTop = ((e.clientY - rect.top) / rect.height) * range;
		} else {
			node.scrollLeft = ((e.clientX - rect.left) / rect.width) * range;
		}
		node.style.removeProperty('scroll-behavior');
	});
};

const initScrollbar = function (
	node: HTMLElement,
	vTrack: HTMLElement | null,
	vThumb: HTMLElement | null,
	hTrack: HTMLElement | null,
	hThumb: HTMLElement | null,
	onDestroy?: () => void
) {
	const prevScrollTop = node.scrollTop;
	const prevScrollLeft = node.scrollLeft;

	node.setAttribute('data-custom-scrollbar', '');
	node.style.setProperty('scrollbar-width', 'none');

	node.scrollTop = prevScrollTop;
	node.scrollLeft = prevScrollLeft;

	if (vTrack && vThumb) {
		vThumb.style.background = getColor(node, 'scrollbar');
		on(node, 'scroll', () => {
			syncScroll(node, vTrack, vThumb, 'v');
		});
		setupDrag(vThumb, node, vTrack, 'v');
		setupTrackClick(vTrack, node, 'v');
	}
	if (hTrack && hThumb) {
		hThumb.style.background = getColor(node, 'scrollbar');
		on(node, 'scroll', () => {
			syncScroll(node, hTrack, hThumb, 'h');
		});
		setupDrag(hThumb, node, hTrack, 'h');
		setupTrackClick(hTrack, node, 'h');
	}

	const ro = new ResizeObserver(() => {
		if (vTrack && vThumb) syncScroll(node, vTrack, vThumb, 'v');
		if (hTrack && hThumb) syncScroll(node, hTrack, hThumb, 'h');
	});
	ro.observe(node);
	if (vTrack?.parentElement) ro.observe(vTrack.parentElement);
	if (hTrack?.parentElement) ro.observe(hTrack.parentElement);

	const mo = new MutationObserver(() => {
		if (vThumb) {
			vThumb.style.background = getColor(node, 'scrollbar');
		}
		if (hThumb) {
			hThumb.style.background = getColor(node, 'scrollbar');
		}
		requestAnimationFrame(() => {
			if (vTrack && vThumb) syncScroll(node, vTrack, vThumb, 'v');
			if (hTrack && hThumb) syncScroll(node, hTrack, hThumb, 'h');
		});
	});
	mo.observe(node, { attributes: true, subtree: true });
	mo.observe(document.body, { attributes: true, attributeFilter: ['class'] });

	requestAnimationFrame(() =>
		requestAnimationFrame(() => {
			if (vTrack && vThumb) syncScroll(node, vTrack, vThumb, 'v');
			if (hTrack && hThumb) syncScroll(node, hTrack, hThumb, 'h');
		})
	);

	let destroyed = false;
	return {
		destroy() {
			if (destroyed) return;
			destroyed = true;
			node.removeAttribute('data-custom-scrollbar');
			node.style.removeProperty('scrollbar-width');
			ro.disconnect();
			mo.disconnect();
			if (vTrack) vTrack.remove();
			if (hTrack) hTrack.remove();
			onDestroy?.();
		}
	};
};

export const setupScrollbars = function (container: HTMLElement = document.body) {
	const instances = new Map<HTMLElement, { destroy: () => void }>();

	const ensurePosRefs = new Map<HTMLElement, number>();

	const revertEnsurePos = function (elem: HTMLElement) {
		const count = ensurePosRefs.get(elem);
		if (count === undefined) return;
		if (count <= 1) {
			elem.style.removeProperty('position');
			ensurePosRefs.delete(elem);
		} else {
			ensurePosRefs.set(elem, count - 1);
		}
	};

	const pruneDetached = function () {
		for (const [el, inst] of instances) {
			if (!document.body.contains(el)) {
				inst.destroy();
				instances.delete(el);
			}
		}
	};

	const getScrollAxes = function (el: HTMLElement): { v: boolean; h: boolean } {
		if (el === document.body || el === document.documentElement) return { v: false, h: false };
		if (el.hasAttribute('data-custom-scrollbar')) return { v: false, h: false };
		if (el.closest('.ace_editor')) return { v: false, h: false };
		if (getComputedStyle(el).position === 'fixed') return { v: false, h: false };
		const comp = getComputedStyle(el);
		return {
			v: comp.overflowY === 'auto' || comp.overflowY === 'scroll',
			h: comp.overflowX === 'auto' || comp.overflowX === 'scroll'
		};
	};

	const processScrollable = function (el: HTMLElement) {
		const axes = getScrollAxes(el);
		if (!axes.v && !axes.h) return;

		let vTrack: HTMLElement | null = null;
		let vThumb: HTMLElement | null = null;
		let hTrack: HTMLElement | null = null;
		let hThumb: HTMLElement | null = null;
		const affectedParents: HTMLElement[] = [];

		const ensurePos = function (elem: HTMLElement) {
			const pos = getComputedStyle(elem).position;
			if (pos === 'static') {
				elem.style.position = 'relative';
				ensurePosRefs.set(elem, (ensurePosRefs.get(elem) ?? 0) + 1);
			}
		};

		if (axes.v) {
			const vParent = el.parentElement;
			if (vParent) {
				ensurePos(vParent);
				affectedParents.push(vParent);
				const t = makeTrack('v');
				vTrack = t.track;
				vThumb = t.thumb;
				vTrack.style.position = 'absolute';
				vTrack.style.top = '0';
				vTrack.style.right = '0';
				vTrack.style.width = '5px';
				vTrack.style.height = 'calc(100% + 2px)';
				vParent.appendChild(vTrack);
			}
		}

		if (axes.h) {
			const hParent = el.parentElement;
			if (hParent) {
				ensurePos(hParent);
				affectedParents.push(hParent);
				const t = makeTrack('h');
				hTrack = t.track;
				hThumb = t.thumb;
				hTrack.style.position = 'absolute';
				hTrack.style.bottom = '0';
				hTrack.style.left = '0';
				hTrack.style.right = '0';
				hTrack.style.height = '5px';
				hTrack.style.width = '';
				hParent.appendChild(hTrack);
			}
		}

		if (vTrack || hTrack) {
			const inst = initScrollbar(el, vTrack, vThumb, hTrack, hThumb, () => {
				for (const p of affectedParents) revertEnsurePos(p);
			});
			instances.set(el, inst);
		}
	};

	const processAce = function (editorEl: HTMLElement) {
		const vEl = editorEl.querySelector<HTMLElement>('.ace_scrollbar');
		const hEl = editorEl.querySelector<HTMLElement>('.ace_scrollbar-h');

		const pending: { el: HTMLElement; dir: 'v' | 'h' }[] = [];
		if (vEl && !vEl.hasAttribute('data-custom-scrollbar')) pending.push({ el: vEl, dir: 'v' });
		if (hEl && !hEl.hasAttribute('data-custom-scrollbar')) pending.push({ el: hEl, dir: 'h' });
		if (!pending.length) return;

		const scroller = editorEl.querySelector<HTMLElement>('.ace_scroller');

		const existing = instances.get(editorEl) as
			| {
					tracks: { el: HTMLElement; track: HTMLElement; thumb: HTMLElement; dir: 'v' | 'h' }[];
					ro: ResizeObserver;
					mo: MutationObserver;
					destroy: () => void;
			  }
			| undefined;

		if (existing) {
			for (const { el, dir } of pending) {
				el.setAttribute('data-custom-scrollbar', '');
				el.style.setProperty('scrollbar-width', 'none');
				el.style.pointerEvents = 'none';
				el.style.background = 'transparent';

				const { track, thumb } = makeTrack(dir);
				track.style.zIndex = '7';
				editorEl.appendChild(track);
				thumb.style.background = getColor(el, 'scrollbar');
				on(el, 'scroll', () => {
					syncScroll(el, track, thumb, dir);
				});
				setupDrag(thumb, el, track, dir);
				setupTrackClick(track, el, dir);
				existing.tracks.push({ el, track, thumb, dir });
				existing.ro.observe(el);
				if (el.firstElementChild) existing.ro.observe(el.firstElementChild);
				existing.mo.observe(el, { attributes: true, subtree: true });
				requestAnimationFrame(() =>
					requestAnimationFrame(() => {
						syncScroll(el, track, thumb, dir);
					})
				);
			}
			return;
		}

		const tracks: { el: HTMLElement; track: HTMLElement; thumb: HTMLElement; dir: 'v' | 'h' }[] =
			[];

		for (const { el, dir } of pending) {
			el.setAttribute('data-custom-scrollbar', '');
			el.style.setProperty('scrollbar-width', 'none');
			el.style.pointerEvents = 'none';
			el.style.background = 'transparent';

			const { track, thumb } = makeTrack(dir);
			track.style.zIndex = '7';
			editorEl.appendChild(track);
			thumb.style.background = getColor(el, 'scrollbar');
			on(el, 'scroll', () => {
				syncScroll(el, track, thumb, dir);
			});
			setupDrag(thumb, el, track, dir);
			setupTrackClick(track, el, dir);
			tracks.push({ el, track, thumb, dir });
		}

		editorEl.style.setProperty('isolation', 'isolate');

		const ro = new ResizeObserver(() => {
			for (const t of tracks) syncScroll(t.el, t.track, t.thumb, t.dir);
		});
		for (const t of tracks) {
			ro.observe(t.el);
			if (t.el.firstElementChild) ro.observe(t.el.firstElementChild);
		}
		if (scroller?.firstElementChild) ro.observe(scroller.firstElementChild);

		const mo = new MutationObserver(() => {
			for (const t of tracks) {
				t.thumb.style.background = getColor(t.el, 'scrollbar');
				requestAnimationFrame(() => {
					syncScroll(t.el, t.track, t.thumb, t.dir);
				});
			}
		});
		for (const t of tracks) mo.observe(t.el, { attributes: true, subtree: true });
		mo.observe(document.body, { attributes: true, attributeFilter: ['class'] });

		requestAnimationFrame(() =>
			requestAnimationFrame(() => {
				for (const t of tracks) syncScroll(t.el, t.track, t.thumb, t.dir);
			})
		);

		const inst = {
			tracks,
			ro,
			mo,
			destroy() {
				ro.disconnect();
				mo.disconnect();
				for (const t of tracks) t.track.remove();
				for (const t of tracks) {
					t.el.removeAttribute('data-custom-scrollbar');
					t.el.style.removeProperty('scrollbar-width');
					t.el.style.removeProperty('pointer-events');
					t.el.style.removeProperty('background');
				}
				editorEl.style.removeProperty('isolation');
			}
		};
		instances.set(editorEl, inst);
	};

	const ensureAceProcessed = function (editorEl: HTMLElement) {
		processAce(editorEl);
		const vEl = editorEl.querySelector('.ace_scrollbar');
		const hEl = editorEl.querySelector('.ace_scrollbar-h');
		const vUnprocessed = vEl && !vEl.hasAttribute('data-custom-scrollbar');
		const hUnprocessed = hEl && !hEl.hasAttribute('data-custom-scrollbar');
		if (vUnprocessed || hUnprocessed) {
			const mo = new MutationObserver(() => {
				processAce(editorEl);
				const vOk =
					!editorEl.querySelector('.ace_scrollbar') ||
					editorEl.querySelector('.ace_scrollbar')?.hasAttribute('data-custom-scrollbar');
				const hOk =
					!editorEl.querySelector('.ace_scrollbar-h') ||
					editorEl.querySelector('.ace_scrollbar-h')?.hasAttribute('data-custom-scrollbar');
				if (vOk && hOk) mo.disconnect();
			});
			mo.observe(editorEl, { childList: true, subtree: true });
			setTimeout(() => {
				mo.disconnect();
			}, 3000);
		}
	};

	const all = container.querySelectorAll<HTMLElement>('*');
	for (const el of all) processScrollable(el);

	const aceEditors = container.querySelectorAll<HTMLElement>('.ace_editor');
	for (const ed of aceEditors) processAce(ed);

	const observer = new MutationObserver((mutations) => {
		for (const m of mutations) {
			pruneDetached();
			for (const n of m.addedNodes) {
				if (n instanceof HTMLElement) {
					if (n.classList.contains('ace_editor')) {
						ensureAceProcessed(n);
					} else if (n.closest('.ace_editor')) {
						const editor = n.closest<HTMLElement>('.ace_editor');
						if (editor) ensureAceProcessed(editor);
					} else {
						const editors = n.querySelectorAll<HTMLElement>('.ace_editor');
						for (const ed of editors) ensureAceProcessed(ed);
					}
					processScrollable(n);
					n.querySelectorAll<HTMLElement>('*').forEach((el) => {
						processScrollable(el);
					});
				}
			}
		}
	});
	observer.observe(container, { childList: true, subtree: true });

	return {
		destroy() {
			observer.disconnect();
			for (const inst of instances.values()) inst.destroy();
			instances.clear();
		}
	};
};
