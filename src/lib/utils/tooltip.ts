import { on } from 'svelte/events';
import { animationDelay, animationDuration } from '$lib/constants/animation.constants';

const ATTACH_SELECTOR = 'a, button';
const GAP = 8;

interface ThemeColors {
	background: string;
	foreground: string;
}

const getComputedStyleValue = (element: Element, property: string) =>
	getComputedStyle(element).getPropertyValue(property).trim();

const getLabel = (element: HTMLElement): string | null => {
	const anchor = element instanceof HTMLAnchorElement ? element : element.closest('a');
	if (anchor) {
		const href = anchor.getAttribute('href');
		if (href != null) return href;
	}
	return (element.getAttribute('aria-label') ?? element.textContent.trim()) || null;
};

const createTooltip = (label: string, themeColors: ThemeColors): HTMLDivElement => {
	const tip = document.createElement('div');
	tip.textContent = label;
	Object.assign(tip.style, {
		position: 'fixed',
		padding: '4px 8px',
		borderRadius: '4px',
		fontSize: '12px',
		fontFamily: 'Roboto-Condensed, monospace',
		whiteSpace: 'nowrap',
		backgroundColor: themeColors.background,
		color: themeColors.foreground,
		zIndex: '10000',
		pointerEvents: 'none',
		opacity: '0',
		transition: `opacity ${String(animationDuration)}ms ease`
	});
	return tip;
};

const getThemeColors = (() => {
	let cachedColors: ThemeColors | null = null;
	let cachedIsDarkMode: boolean | null = null;

	return (): ThemeColors => {
		const isDarkMode = document.body.classList.contains('dark');
		if (cachedColors && cachedIsDarkMode === isDarkMode) return cachedColors;

		const rootElement = document.documentElement;
		cachedColors = {
			background: getComputedStyleValue(
				rootElement,
				isDarkMode ? '--color-dark-component-background' : '--color-light-component-background'
			),
			foreground: getComputedStyleValue(
				rootElement,
				isDarkMode ? '--color-dark-component-foreground' : '--color-light-component-foreground'
			)
		};
		cachedIsDarkMode = isDarkMode;
		return cachedColors;
	};
})();

const positionTooltip = (tooltipElement: HTMLDivElement, clientX: number, clientY: number) => {
	const tooltipRect = tooltipElement.getBoundingClientRect();
	let top = clientY + GAP;
	let left = clientX + GAP;

	if (top + tooltipRect.height > window.innerHeight) top = clientY - tooltipRect.height - GAP;
	if (left + tooltipRect.width > window.innerWidth) left = clientX - tooltipRect.width - GAP;

	tooltipElement.style.top = `${String(Math.max(4, Math.min(top, window.innerHeight - tooltipRect.height - 4)))}px`;
	tooltipElement.style.left = `${String(Math.max(4, Math.min(left, window.innerWidth - tooltipRect.width - 4)))}px`;
};

const attach = (targetElement: HTMLElement) => {
	let tip: HTMLDivElement | null = null;
	let pendingShowTimeout: ReturnType<typeof setTimeout> | null = null;
	let latestClientX = 0;
	let latestClientY = 0;

	const show = (clientX: number, clientY: number) => {
		const label = getLabel(targetElement);
		if (label == null || tip || pendingShowTimeout) return;

		latestClientX = clientX;
		latestClientY = clientY;

		pendingShowTimeout = setTimeout(() => {
			pendingShowTimeout = null;
			tip = createTooltip(label, getThemeColors());
			document.body.appendChild(tip);
			positionTooltip(tip, latestClientX, latestClientY);

			requestAnimationFrame(() => {
				if (tip) tip.style.opacity = '1';
			});
		}, animationDelay);
	};

	const hide = () => {
		if (pendingShowTimeout) {
			clearTimeout(pendingShowTimeout);
			pendingShowTimeout = null;
		}
		if (!tip) return;
		const tooltipToFade = tip;
		tip.style.opacity = '0';
		setTimeout(() => {
			tooltipToFade.remove();
			if (tip === tooltipToFade) tip = null;
		}, animationDuration);
	};

	const cleanupFunctions = [
		on(targetElement, 'mouseenter', (e: MouseEvent) => {
			show(e.clientX, e.clientY);
		}),
		on(targetElement, 'mousemove', (e: MouseEvent) => {
			latestClientX = e.clientX;
			latestClientY = e.clientY;
			if (tip) positionTooltip(tip, e.clientX, e.clientY);
		}),
		on(targetElement, 'mouseleave', hide)
	];

	return {
		destroy() {
			hide();
			cleanupFunctions.forEach((cleanup) => {
				cleanup();
			});
		}
	};
};

const instances = new WeakMap<HTMLElement, { destroy: () => void }>();

const attachToUnattachedElements = () => {
	for (const element of document.querySelectorAll<HTMLElement>(ATTACH_SELECTOR)) {
		if (instances.has(element)) continue;
		if (element.querySelector(ATTACH_SELECTOR)) continue;
		if (element.hasAttribute('title')) continue;
		if (element.closest('.ace_editor')) continue;
		if (getLabel(element) == null) continue;
		instances.set(element, attach(element));
	}
};

if (typeof document !== 'undefined') {
	const domObserver = new MutationObserver(attachToUnattachedElements);
	domObserver.observe(document.body, { childList: true, subtree: true });

	if (document.readyState === 'loading') {
		on(document, 'DOMContentLoaded', attachToUnattachedElements);
	} else {
		attachToUnattachedElements();
	}
}
