<script>
	import { lightMode } from '$lib/store.svelte.js';
	let dark = '/images/dark.svg';
	let light = '/images/light.svg';
	let src = $state(dark);

	let { theme = 'light' } = $props();

	let toggletheme = () => {
		window.document.body.classList.toggle('light-mode');
		src = window.document.body.classList.contains('light-mode') ? light : dark;
		window.document.body.classList.contains('light-mode')
			? lightMode.set(true)
			: lightMode.set(false);
		localStorage.setItem(
			'theme',
			window.document.body.classList.contains('light-mode') ? 'light' : 'dark'
		);
	};

	if (localStorage.getItem('theme')) {
		theme = localStorage.getItem('theme');
	}

	if (theme == 'light') {
		localStorage.setItem('theme', 'light');
		toggletheme();
	} else {
		localStorage.setItem('theme', 'dark');
	}
</script>

<button onclick={toggletheme}>
	<img alt={src == dark ? 'Dark Theme' : 'Light Theme'} {src} />
</button>

<style>
	button {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 35px;
		width: 35px;
		border-radius: 50%;
	}

	img {
		height: 20px;
		width: 20px;
	}
</style>
