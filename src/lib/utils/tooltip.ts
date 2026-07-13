import { on } from 'svelte/events';
import {
	animationDelay,
	animationDuration,
	tooltipAttachSelector,
	tooltipGap,
	tooltipZIndex,
	tooltipMinMargin
} from '$lib/constants/app.constants';

const getLabel = (element: HTMLElement): string | null => {
	const anchor = element instanceof HTMLAnchorElement ? element : element.closest('a');
	if (anchor) {
		const href = anchor.getAttribute('href');
		if (href !== null) return href;
	}
	return element.getAttribute('aria-label') ?? (element.textContent.trim() || null);
};

const createTooltip = (label: string) => {
	const tip = document.createElement('div');
	tip.className = 'tooltip';
	tip.textContent = label;
	Object.assign(tip.style, {
		zIndex: tooltipZIndex,
		transition: `opacity ${String(animationDuration)}ms ease, background-color ${String(animationDuration)}ms linear, color ${String(animationDuration)}ms linear`
	});
	return tip;
};

const positionTooltip = (tip: HTMLDivElement, cx: number, cy: number) => {
	const rect = tip.getBoundingClientRect();
	let top = cy + tooltipGap,
		left = cx + tooltipGap;
	if (top + rect.height > window.innerHeight) top = cy - rect.height - tooltipGap;
	if (left + rect.width > window.innerWidth) left = cx - rect.width - tooltipGap;
	tip.style.top = `${String(Math.max(tooltipMinMargin, Math.min(top, window.innerHeight - rect.height - tooltipMinMargin)))}px`;
	tip.style.left = `${String(Math.max(tooltipMinMargin, Math.min(left, window.innerWidth - rect.width - tooltipMinMargin)))}px`;
};

const attach = (target: HTMLElement) => {
	let tip: HTMLDivElement | null = null;
	let showTimeout: ReturnType<typeof setTimeout> | null = null;
	let hideTimeout: ReturnType<typeof setTimeout> | null = null;
	let touchHideTimeout: ReturnType<typeof setTimeout> | null = null;
	let touchedResetTimeout: ReturnType<typeof setTimeout> | null = null;
	let lastX = 0,
		lastY = 0;
	let touched = false;

	const show = (cx: number, cy: number, immediate = false) => {
		const label = getLabel(target);
		if (label === null || showTimeout) return;

		if (tip) {
			if (hideTimeout) {
				clearTimeout(hideTimeout);
				hideTimeout = null;
			}
			if (touchHideTimeout) {
				clearTimeout(touchHideTimeout);
				touchHideTimeout = null;
			}
			tip.remove();
			tip = null;
		}

		lastX = cx;
		lastY = cy;
		showTimeout = setTimeout(
			() => {
				showTimeout = null;
				tip = createTooltip(label);
				const container =
					document.fullscreenElement?.contains(target) === true
						? document.fullscreenElement
						: document.body;
				container.appendChild(tip);
				positionTooltip(tip, lastX, lastY);
				requestAnimationFrame(() => {
					if (tip) tip.style.opacity = '1';
				});
			},
			immediate ? 0 : animationDelay
		);
	};

	const hide = () => {
		if (showTimeout) {
			clearTimeout(showTimeout);
			showTimeout = null;
		}
		if (!tip) return;
		if (hideTimeout) clearTimeout(hideTimeout);
		const t = tip;
		tip.style.opacity = '0';
		hideTimeout = setTimeout(() => {
			hideTimeout = null;
			t.remove();
			if (tip === t) tip = null;
		}, animationDuration);
	};

	const clearTouched = () => {
		touched = false;
		if (touchedResetTimeout) {
			clearTimeout(touchedResetTimeout);
			touchedResetTimeout = null;
		}
	};

	const handleTouchEnd = () => {
		touchHideTimeout = setTimeout(() => {
			touchHideTimeout = null;
			hide();
		}, 500);
		touchedResetTimeout = setTimeout(() => {
			touched = false;
			touchedResetTimeout = null;
		}, 1000);
	};

	const updateTipContent = () => {
		if (tip) {
			const label = getLabel(target);
			if (label !== null) tip.textContent = label;
		}
	};

	const labelObserver = new MutationObserver(updateTipContent);
	labelObserver.observe(target, { attributes: true, attributeFilter: ['aria-label'] });

	const cleanups = [
		on(target, 'mouseenter', (e: MouseEvent) => {
			if (touched) return;
			show(e.clientX, e.clientY);
		}),
		on(target, 'mousemove', (e: MouseEvent) => {
			if (touched) return;
			lastX = e.clientX;
			lastY = e.clientY;
			if (tip) positionTooltip(tip, e.clientX, e.clientY);
		}),
		on(target, 'mouseleave', () => {
			if (touched) return;
			hide();
		}),
		on(
			target,
			'touchstart',
			(e: TouchEvent) => {
				clearTouched();
				touched = true;
				const touch = e.touches[0];
				if (!touch) return;
				show(touch.clientX, touch.clientY, true);
			},
			{ passive: true }
		),
		on(
			target,
			'touchmove',
			(e: TouchEvent) => {
				const touch = e.touches[0];
				if (!touch) return;
				lastX = touch.clientX;
				lastY = touch.clientY;
				if (tip) positionTooltip(tip, touch.clientX, touch.clientY);
			},
			{ passive: true }
		),
		on(target, 'touchend', handleTouchEnd),
		on(target, 'touchcancel', handleTouchEnd)
	];

	return {
		destroy() {
			if (showTimeout) {
				clearTimeout(showTimeout);
				showTimeout = null;
			}
			if (hideTimeout) {
				clearTimeout(hideTimeout);
				hideTimeout = null;
			}
			if (touchHideTimeout) {
				clearTimeout(touchHideTimeout);
				touchHideTimeout = null;
			}
			if (touchedResetTimeout) {
				clearTimeout(touchedResetTimeout);
				touchedResetTimeout = null;
			}
			if (tip) {
				tip.remove();
				tip = null;
			}
			labelObserver.disconnect();
			cleanups.forEach((f) => {
				f();
			});
		}
	};
};

const instances = new WeakMap<HTMLElement, { destroy: () => void }>();

const attachToUnattachedElements = (mutations?: MutationRecord[]) => {
	if (mutations) {
		for (const mutation of mutations) {
			for (const node of mutation.removedNodes) {
				if (!(node instanceof HTMLElement)) continue;
				const inst = instances.get(node);
				if (inst) {
					inst.destroy();
					instances.delete(node);
				}
				node.querySelectorAll<HTMLElement>(tooltipAttachSelector).forEach((el) => {
					const childInst = instances.get(el);
					if (childInst) {
						childInst.destroy();
						instances.delete(el);
					}
				});
			}
		}
	}
	document.querySelectorAll<HTMLElement>('[title]').forEach((el) => {
		const label = el.getAttribute('title');
		if (label !== null) {
			el.setAttribute('aria-label', label);
			el.removeAttribute('title');
		}
	});
	for (const el of document.querySelectorAll<HTMLElement>(tooltipAttachSelector)) {
		if (
			instances.has(el) ||
			el.querySelector(tooltipAttachSelector) ||
			(el.closest('.ace_editor') && !el.hasAttribute('aria-label'))
		)
			continue;
		if (getLabel(el) === null) continue;
		instances.set(el, attach(el));
	}
};

if (typeof document !== 'undefined') {
	const observer = new MutationObserver(attachToUnattachedElements);
	observer.observe(document.body, {
		childList: true,
		subtree: true,
		attributes: true,
		attributeFilter: ['title']
	});
	if (document.readyState === 'loading') {
		on(document, 'DOMContentLoaded', () => {
			attachToUnattachedElements();
		});
	} else {
		attachToUnattachedElements();
	}
}
