(() => {
	// Shared persistence for standalone snippets: session storage for the current
	// tab, local storage as the reopen fallback. Each store fails independently.
	window.createSnippetStorage = (key) => ({
		read() {
			try {
				const session = sessionStorage.getItem(key);
				if (session !== null) return session;
			} catch {
				// Fall through to the persistent store.
			}
			try {
				return localStorage.getItem(key);
			} catch {
				return null;
			}
		},
		write(value) {
			try {
				sessionStorage.setItem(key, value);
			} catch {
				try {
					sessionStorage.removeItem(key);
				} catch {
					// Ignore unavailable storage.
				}
			}
			try {
				localStorage.setItem(key, value);
			} catch {
				try {
					localStorage.removeItem(key);
				} catch {
					// Ignore unavailable storage.
				}
			}
		},
		clear() {
			try {
				sessionStorage.removeItem(key);
			} catch {
				// Ignore unavailable storage.
			}
			try {
				localStorage.removeItem(key);
			} catch {
				// Ignore unavailable storage.
			}
		}
	});
})();
