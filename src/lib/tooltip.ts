import { on } from 'svelte/events';

const getStyle = (el: Element, prop: string) => getComputedStyle(el).getPropertyValue(prop).trim();

const getLabel = (el: HTMLElement): string | null => {
	const anchor = el instanceof HTMLAnchorElement ? el : el.closest('a');
	if (anchor) {
		const href = anchor.getAttribute('href');
		if (href) return href;
	}
	const aria = el.getAttribute('aria-label');
	if (aria) return aria;
	const text = el.textContent.trim();
	if (text) return text;
	return null;
};

const ATTACH_SELECTOR = 'a, button';

const attach = (node: HTMLElement) => {
	let tip: HTMLDivElement | null = null;

	const getPosition = (clientX: number, clientY: number) => {
		if (!tip) return { top: 0, left: 0 };
		const tipRect = tip.getBoundingClientRect();
		const gap = 8;

		let top = clientY + gap;
		let left = clientX + gap;

		if (top + tipRect.height > window.innerHeight) {
			top = clientY - tipRect.height - gap;
		}
		if (left + tipRect.width > window.innerWidth) {
			left = clientX - tipRect.width - gap;
		}

		top = Math.max(4, Math.min(top, window.innerHeight - tipRect.height - 4));
		left = Math.max(4, Math.min(left, window.innerWidth - tipRect.width - 4));

		return { top, left };
	};

	const show = (clientX: number, clientY: number) => {
		const label = getLabel(node);
		if (!label || tip) return;

		const isDark = document.body.classList.contains('dark');
		const root = document.documentElement;
		const bg = isDark
			? getStyle(root, '--color-dark-component-background') || '#475258'
			: getStyle(root, '--color-light-component-background') || '#bdc3af';
		const fg = isDark
			? getStyle(root, '--color-dark-component-foreground') || '#d3c6aa'
			: getStyle(root, '--color-light-component-foreground') || '#5c6a72';

		tip = document.createElement('div');
		tip.textContent = label;
		Object.assign(tip.style, {
			position: 'fixed',
			padding: '4px 8px',
			borderRadius: '4px',
			fontSize: '12px',
			fontFamily: 'Roboto-Condensed, monospace',
			whiteSpace: 'nowrap',
			backgroundColor: bg,
			color: fg,
			zIndex: '10000',
			pointerEvents: 'none',
			opacity: '0',
			transition: 'opacity 100ms ease'
		});
		document.body.appendChild(tip);

		const { top, left } = getPosition(clientX, clientY);
		tip.style.top = `${String(top)}px`;
		tip.style.left = `${String(left)}px`;

		requestAnimationFrame(() => {
			if (tip) tip.style.opacity = '1';
		});
	};

	const updatePosition = (e: MouseEvent) => {
		if (!tip) return;
		const { top, left } = getPosition(e.clientX, e.clientY);
		tip.style.top = `${String(top)}px`;
		tip.style.left = `${String(left)}px`;
	};

	const hide = () => {
		if (tip) {
			tip.style.opacity = '0';
			setTimeout(() => {
				tip?.remove();
				tip = null;
			}, 100);
		}
	};

	const cleanups: (() => void)[] = [
		on(node, 'mouseenter', (e: MouseEvent) => {
			show(e.clientX, e.clientY);
		}),
		on(node, 'mousemove', updatePosition),
		on(node, 'mouseleave', hide)
	];

	return {
		destroy() {
			hide();
			cleanups.forEach((fn) => {
				fn();
			});
		}
	};
};

const instances = new WeakMap<HTMLElement, { destroy: () => void }>();

const init = () => {
	document.querySelectorAll<HTMLElement>(ATTACH_SELECTOR).forEach((el) => {
		if (
			!instances.has(el) &&
			!el.querySelector(ATTACH_SELECTOR) &&
			!el.hasAttribute('title') &&
			!el.closest('.ace_editor') &&
			getLabel(el)
		) {
			instances.set(el, attach(el));
		}
	});
};

if (typeof document !== 'undefined') {
	const observer = new MutationObserver(() => {
		init();
	});
	observer.observe(document.body, { childList: true, subtree: true });

	if (document.readyState === 'loading') {
		on(document, 'DOMContentLoaded', init);
	} else {
		init();
	}
}
