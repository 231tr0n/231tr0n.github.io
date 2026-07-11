export const setupExternalLinks = () => {
	const addTarget = () => {
		document.querySelectorAll<HTMLAnchorElement>('a:not([target])').forEach((anchor) => {
			const href = anchor.getAttribute('href');
			if (href === null || href === '') return;
			if (!/^https?:\/\//.test(href) && !href.startsWith('//') && !href.startsWith('mailto:'))
				return;
			anchor.target = '_blank';
			const existingRel = anchor.getAttribute('rel') ?? '';
			const relList = existingRel.split(/\s+/).filter(Boolean);
			if (!relList.includes('noopener')) relList.push('noopener');
			if (!relList.includes('noreferrer')) relList.push('noreferrer');
			anchor.rel = relList.join(' ');
		});
	};
	addTarget();
	const observer = new MutationObserver(addTarget);
	observer.observe(document.body, { childList: true, subtree: true });
	return () => {
		observer.disconnect();
	};
};
