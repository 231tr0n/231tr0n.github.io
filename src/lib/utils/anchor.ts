import { externalLinkRel } from '#lib/constants/app.constants.js';

const externalLinkTokens = externalLinkRel.split(/\s+/);

const isExternalHref = (href: string): boolean => {
	const lower = href.trim().toLowerCase();
	return (
		lower.startsWith('http://') ||
		lower.startsWith('https://') ||
		lower.startsWith('//') ||
		lower.startsWith('mailto:')
	);
};

export const setupExternalLinks = () => {
	const addedTargets = new WeakSet<HTMLAnchorElement>();
	const addedRelTokens = new WeakMap<HTMLAnchorElement, string[]>();

	const applyToAnchor = (anchor: HTMLAnchorElement) => {
		const href = anchor.getAttribute('href');
		if (href !== null && isExternalHref(href)) {
			if (!anchor.hasAttribute('target')) {
				anchor.target = '_blank';
				addedTargets.add(anchor);
			}
			const relSet = new Set((anchor.getAttribute('rel') ?? '').split(/\s+/).filter(Boolean));
			const added = addedRelTokens.get(anchor) ?? [];
			for (const token of externalLinkTokens) {
				if (relSet.has(token)) continue;
				relSet.add(token);
				if (!added.includes(token)) added.push(token);
			}
			addedRelTokens.set(anchor, added);
			anchor.rel = [...relSet].join(' ');
			return;
		}

		if (addedTargets.has(anchor)) {
			anchor.removeAttribute('target');
			addedTargets.delete(anchor);
		}
		const added = addedRelTokens.get(anchor);
		if (added) {
			const remaining = (anchor.getAttribute('rel') ?? '')
				.split(/\s+/)
				.filter(Boolean)
				.filter((token) => !added.includes(token));
			if (remaining.length > 0) anchor.rel = remaining.join(' ');
			else anchor.removeAttribute('rel');
			addedRelTokens.delete(anchor);
		}
	};

	const updateLinks = () => {
		document.querySelectorAll<HTMLAnchorElement>('a').forEach(applyToAnchor);
	};

	updateLinks();
	const observer = new MutationObserver(updateLinks);
	observer.observe(document.body, {
		childList: true,
		subtree: true,
		attributes: true,
		attributeFilter: ['href']
	});
	return () => {
		observer.disconnect();
	};
};
