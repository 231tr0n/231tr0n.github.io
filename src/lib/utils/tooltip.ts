import { on } from 'svelte/events';
import {
	animationDelay,
	animationDuration,
	tooltipAttachSelector as ATTACH_SELECTOR,
	tooltipGap as GAP,
	tooltipZIndex,
	tooltipFontFamily,
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
		position: 'fixed',
		padding: '4px 8px',
		borderRadius: '4px',
		fontSize: '12px',
		fontFamily: tooltipFontFamily,
		whiteSpace: 'nowrap',
		backgroundColor: 'var(--color-component-background)',
		color: 'var(--color-component-foreground)',
		zIndex: tooltipZIndex,
		pointerEvents: 'none',
		opacity: '0',
		transition: `opacity ${String(animationDuration)}ms ease, background-color ${String(animationDuration)}ms linear, color ${String(animationDuration)}ms linear`
	});
	return tip;
};

const positionTooltip = (tip: HTMLDivElement, cx: number, cy: number) => {
	const rect = tip.getBoundingClientRect();
	let top = cy + GAP,
		left = cx + GAP;
	if (top + rect.height > window.innerHeight) top = cy - rect.height - GAP;
	if (left + rect.width > window.innerWidth) left = cx - rect.width - GAP;
	tip.style.top = `${String(Math.max(tooltipMinMargin, Math.min(top, window.innerHeight - rect.height - tooltipMinMargin)))}px`;
	tip.style.left = `${String(Math.max(tooltipMinMargin, Math.min(left, window.innerWidth - rect.width - tooltipMinMargin)))}px`;
};

const attach = (target: HTMLElement) => {
	let tip: HTMLDivElement | null = null;
	let timeout: ReturnType<typeof setTimeout> | null = null;
	let lastX = 0,
		lastY = 0;

	const show = (cx: number, cy: number) => {
		const label = getLabel(target);
		if (label === null || tip || timeout) return;
		lastX = cx;
		lastY = cy;
		timeout = setTimeout(() => {
			timeout = null;
			tip = createTooltip(label);
			document.body.appendChild(tip);
			positionTooltip(tip, lastX, lastY);
			requestAnimationFrame(() => {
				if (tip) tip.style.opacity = '1';
			});
		}, animationDelay);
	};

	const hide = () => {
		if (timeout) {
			clearTimeout(timeout);
			timeout = null;
		}
		if (!tip) return;
		const t = tip;
		tip.style.opacity = '0';
		setTimeout(() => {
			t.remove();
			if (tip === t) tip = null;
		}, animationDuration);
	};

	const cleanups = [
		on(target, 'mouseenter', (e: MouseEvent) => {
			show(e.clientX, e.clientY);
		}),
		on(target, 'mousemove', (e: MouseEvent) => {
			lastX = e.clientX;
			lastY = e.clientY;
			if (tip) positionTooltip(tip, e.clientX, e.clientY);
		}),
		on(target, 'mouseleave', hide)
	];

	return {
		destroy() {
			hide();
			cleanups.forEach((f) => {
				f();
			});
		}
	};
};

const instances = new WeakMap<HTMLElement, { destroy: () => void }>();

const attachToUnattachedElements = () => {
	for (const el of document.querySelectorAll<HTMLElement>(ATTACH_SELECTOR)) {
		if (
			instances.has(el) ||
			el.querySelector(ATTACH_SELECTOR) ||
			el.hasAttribute('title') ||
			el.closest('.ace_editor')
		)
			continue;
		if (getLabel(el) === null) continue;
		instances.set(el, attach(el));
	}
};

if (typeof document !== 'undefined') {
	const observer = new MutationObserver(attachToUnattachedElements);
	observer.observe(document.body, { childList: true, subtree: true });
	if (document.readyState === 'loading') {
		on(document, 'DOMContentLoaded', attachToUnattachedElements);
	} else {
		attachToUnattachedElements();
	}
}
