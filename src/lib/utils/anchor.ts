import { externalLinkRel } from '#lib/constants/app.constants.js';

const isExternalHref = (href: string): boolean => {
	const lower = href.toLowerCase();
	return lower.startsWith('http://') || lower.startsWith('https://') || href.startsWith('//');
};

export const setupExternalLinks = () => {
	const addTarget = () => {
		document.querySelectorAll<HTMLAnchorElement>('a:not([target])').forEach((anchor) => {
			const href = anchor.getAttribute('href');
			if (href === null || (!isExternalHref(href) && !href.toLowerCase().startsWith('mailto:'))) {
				return;
			}
			anchor.target = '_blank';
			const existingRel = anchor.getAttribute('rel') ?? '';
			const relSet = new Set([
				...existingRel.split(/\s+/).filter(Boolean),
				...externalLinkRel.split(/\s+/)
			]);
			anchor.rel = [...relSet].join(' ');
		});
	};
	addTarget();
	const observer = new MutationObserver(addTarget);
	observer.observe(document.body, { childList: true, subtree: true });
	return () => {
		observer.disconnect();
	};
};
