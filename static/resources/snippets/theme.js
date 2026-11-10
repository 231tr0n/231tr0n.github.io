(() => {
	const apply = (dark) => {
		document.documentElement.classList.toggle('dark', dark);
		document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
	};

	apply(matchMedia('(prefers-color-scheme: dark)').matches);

	window.onmessage = (event) => {
		if (event.source !== window.parent) return;
		const data = event.data;
		if (
			typeof data === 'object' &&
			data !== null &&
			data.type === 'theme' &&
			typeof data.dark === 'boolean'
		) {
			apply(data.dark);
		}
	};
})();
