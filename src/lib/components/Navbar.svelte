<script>
	import { lightMode } from '$lib/store.svelte.js';

	let { theme = 'light' } = $props();

	let toggletheme = () => {
		window.document.body.classList.toggle('light-mode');
		theme = window.document.body.classList.contains('light-mode') ? 'light' : 'dark';
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

<header>
	<div class="main">
		<a href="/"><button class="strong">231tr0n</button></a>
		<a href="/"><button>Home</button></a>
		<a href="/blog"><button>Blog</button></a>
		<a href="/projects"><button>Projects</button></a>
		<a href="/misc"><button>Misc</button></a>
	</div>
	<button onclick={toggletheme} class="theme-changer">
		{#if theme == 'dark'}
			<svg
				xmlns="http://www.w3.org/2000/svg"
				xmlns:xlink="http://www.w3.org/1999/xlink"
				fill="#FDF6E3"
				version="1.1"
				id="Capa_1"
				width="800px"
				height="800px"
				viewBox="0 0 45.74 45.74"
				xml:space="preserve">
				<g>
					<g>
						<g>
							<g>
								<g>
									<path
										d="M12.2,15.267c0-3.322,0.896-6.43,2.448-9.113c0.376-0.649-0.191-1.451-0.918-1.265C5.35,7.041-0.711,14.961,0.067,24.179c0.736,8.701,7.768,15.803,16.463,16.617c6.033,0.565,11.517-1.811,15.221-5.848c0.5-0.546,0.073-1.432-0.666-1.401c-0.196,0.009-0.395,0.013-0.594,0.013C20.389,33.56,12.2,25.371,12.2,15.267z" />
								</g>
							</g>
							<g>
								<path
									d="M23.144,5.6l0.917,2.633l2.788,0.061c0.354,0.008,0.498,0.456,0.218,0.669l-2.221,1.687l0.805,2.669c0.104,0.338-0.279,0.614-0.568,0.414l-2.292-1.59l-2.29,1.59c-0.29,0.201-0.669-0.076-0.569-0.414l0.805-2.669l-2.221-1.687c-0.28-0.213-0.134-0.661,0.218-0.669l2.788-0.061L22.44,5.6C22.556,5.267,23.027,5.267,23.144,5.6z" />
							</g>
							<g>
								<path
									d="M40.26,26.44l0.881,2.53l2.679,0.057c0.389,0.009,0.549,0.502,0.24,0.737l-2.134,1.621l0.772,2.564c0.111,0.371-0.309,0.677-0.627,0.454l-2.201-1.527l-2.2,1.527c-0.318,0.223-0.739-0.083-0.626-0.454l0.772-2.564l-2.133-1.621c-0.31-0.234-0.149-0.729,0.238-0.737l2.679-0.057l0.884-2.53C39.612,26.074,40.131,26.074,40.26,26.44z" />
							</g>
							<g>
								<path
									d="M39.926,8.098l1.325,3.799l4.021,0.086c0.452,0.01,0.639,0.584,0.278,0.858l-3.204,2.434l1.162,3.853c0.131,0.433-0.356,0.788-0.729,0.529l-3.306-2.294l-3.305,2.294c-0.372,0.259-0.86-0.097-0.729-0.529l1.161-3.853l-3.205-2.434c-0.358-0.273-0.172-0.849,0.279-0.858l4.022-0.086l1.324-3.799C39.173,7.672,39.776,7.672,39.926,8.098z" />
							</g>
						</g>
					</g>
				</g>
			</svg>
		{:else}
			<svg
				xmlns="http://www.w3.org/2000/svg"
				id="Layer_1"
				data-name="Layer 1"
				viewBox="0 0 122.88 122.88">
				<defs>
					<style>
						.cls-1 {
							fill: #cb4b16;
						}
					</style>
				</defs>
				<title>sun-color</title>
				<path
					class="cls-1"
					d="M30,13.21A3.93,3.93,0,1,1,36.8,9.27L41.86,18A3.94,3.94,0,1,1,35.05,22L30,13.21Zm31.45,13A35.23,35.23,0,1,1,36.52,36.52,35.13,35.13,0,0,1,61.44,26.2ZM58.31,4A3.95,3.95,0,1,1,66.2,4V14.06a3.95,3.95,0,1,1-7.89,0V4ZM87.49,10.1A3.93,3.93,0,1,1,94.3,14l-5.06,8.76a3.93,3.93,0,1,1-6.81-3.92l5.06-8.75ZM109.67,30a3.93,3.93,0,1,1,3.94,6.81l-8.75,5.06a3.94,3.94,0,1,1-4-6.81L109.67,30Zm9.26,28.32a3.95,3.95,0,1,1,0,7.89H108.82a3.95,3.95,0,1,1,0-7.89Zm-6.15,29.18a3.93,3.93,0,1,1-3.91,6.81l-8.76-5.06A3.93,3.93,0,1,1,104,82.43l8.75,5.06ZM92.89,109.67a3.93,3.93,0,1,1-6.81,3.94L81,104.86a3.94,3.94,0,0,1,6.81-4l5.06,8.76Zm-28.32,9.26a3.95,3.95,0,1,1-7.89,0V108.82a3.95,3.95,0,1,1,7.89,0v10.11Zm-29.18-6.15a3.93,3.93,0,0,1-6.81-3.91l5.06-8.76A3.93,3.93,0,1,1,40.45,104l-5.06,8.75ZM13.21,92.89a3.93,3.93,0,1,1-3.94-6.81L18,81A3.94,3.94,0,1,1,22,87.83l-8.76,5.06ZM4,64.57a3.95,3.95,0,1,1,0-7.89H14.06a3.95,3.95,0,1,1,0,7.89ZM10.1,35.39A3.93,3.93,0,1,1,14,28.58l8.76,5.06a3.93,3.93,0,1,1-3.92,6.81L10.1,35.39Z" />
			</svg>
		{/if}
	</button>
</header>

<style>
	div.main {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	button.strong {
		font-size: 15px;
		height: 30px;
		background-color: var(--color-dark-badge-foreground);
	}

	:global(body.light-mode) button.strong {
		background-color: var(--color-light-badge-foreground);
	}

	a {
		margin-right: 5px;
	}

	header {
		position: fixed;
		top: 0px;
		left: 0px;
		right: 0px;
		height: 45px;
		padding-top: 0px;
		padding-bottom: 0px;
		padding-left: 7px;
		padding-right: 7px;
		box-sizing: border-box;
		display: flex;
		justify-content: space-between;
		align-items: center;
		z-index: 100;
		border-bottom: 1px solid var(--color-dark-foreground);
		background-color: var(--color-dark-strong-background);
	}

	:global(body.light-mode) header {
		border-bottom: 1px solid var(--color-light-foreground);
		background-color: var(--color-light-strong-background);
	}

	button.theme-changer {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 30px;
		width: 30px;
	}
</style>
