<script lang="ts">
	import { resolve } from '$app/paths';
	import { darkMode } from '#lib/utils/dark.svelte.js';
	import { themeStorageKey, themeDark, themeLight } from '#lib/constants/app.constants.js';
	import { onMount } from 'svelte';

	let mounted = $state(false);

	const toggleTheme = () => {
		const isDark = document.body.classList.toggle('dark');
		darkMode().dark = isDark;
		try {
			localStorage.setItem(themeStorageKey, isDark ? themeDark : themeLight);
		} catch (error) {
			console.error('Failed to save theme preference', error);
		}
	};

	onMount(() => {
		darkMode().dark = document.body.classList.contains('dark');
		mounted = true;
	});
</script>

<header class="zeltron-body-background">
	<div class="zeltron-flex-middle">
		<a
			class="nav-button home-button zeltron-strong-component"
			aria-label="Home"
			href={resolve('/')}>
			<svg
				class="home-icon"
				fill="currentColor"
				viewBox="0 0 16 16"
				xmlns="http://www.w3.org/2000/svg">
				<path
					d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L8 2.207l6.646 6.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293z"
				></path>

				<path d="m8 3.293 6 6V13.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 13.5V9.293z"></path>
			</svg>
			<span>Home</span>
		</a>
		<a class="nav-button zeltron-strong-component" href={resolve('blog')}>Blog</a>
		<a class="nav-button zeltron-strong-component" href={resolve('projects')}>Projects</a>
		<a class="nav-button zeltron-strong-component" href={resolve('misc')}>Misc</a>
		<a class="nav-button zeltron-strong-component" href={resolve('games')}>Games</a>
	</div>
	<button
		class="zeltron-strong-component"
		aria-label="Toggle theme"
		onclick={toggleTheme}
		type="button">
		{#if mounted}
			{#if darkMode().dark}
				<svg fill="currentColor" viewBox="0 0 45.74 45.74" xmlns="http://www.w3.org/2000/svg">
					<path
						d="M12.2,15.267c0-3.322,0.896-6.43,2.448-9.113c0.376-0.649-0.191-1.451-0.918-1.265C5.35,7.041-0.711,14.961,0.067,24.179c0.736,8.701,7.768,15.803,16.463,16.617c6.033,0.565,11.517-1.811,15.221-5.848c0.5-0.546,0.073-1.432-0.666-1.401c-0.196,0.009-0.395,0.013-0.594,0.013C20.389,33.56,12.2,25.371,12.2,15.267z"
					></path>

					<path
						d="M23.144,5.6l0.917,2.633l2.788,0.061c0.354,0.008,0.498,0.456,0.218,0.669l-2.221,1.687l0.805,2.669c0.104,0.338-0.279,0.614-0.568,0.414l-2.292-1.59l-2.29,1.59c-0.29,0.201-0.669-0.076-0.569-0.414l0.805-2.669l-2.221-1.687c-0.28-0.213-0.134-0.661,0.218-0.669l2.788-0.061L22.44,5.6C22.556,5.267,23.027,5.267,23.144,5.6z"
					></path>

					<path
						d="M40.26,26.44l0.881,2.53l2.679,0.057c0.389,0.009,0.549,0.502,0.24,0.737l-2.134,1.621l0.772,2.564c0.111,0.371-0.309,0.677-0.627,0.454l-2.201-1.527l-2.2,1.527c-0.318,0.223-0.739-0.083-0.626-0.454l0.772-2.564l-2.133-1.621c-0.31-0.234-0.149-0.729,0.238-0.737l2.679-0.057l0.884-2.53C39.612,26.074,40.131,26.074,40.26,26.44z"
					></path>

					<path
						d="M39.926,8.098l1.325,3.799l4.021,0.086c0.452,0.01,0.639,0.584,0.278,0.858l-3.204,2.434l1.162,3.853c0.131,0.433-0.356,0.788-0.729,0.529l-3.306-2.294l-3.305,2.294c-0.372,0.259-0.86-0.097-0.729-0.529l1.161-3.853l-3.205-2.434c-0.358-0.273-0.172-0.849,0.279-0.858l4.022-0.086l1.324-3.799C39.173,7.672,39.776,7.672,39.926,8.098z"
					></path>
				</svg>
			{:else}
				<svg fill="currentColor" viewBox="0 0 122.88 122.88" xmlns="http://www.w3.org/2000/svg">
					<path
						d="M30,13.21A3.93,3.93,0,1,1,36.8,9.27L41.86,18A3.94,3.94,0,1,1,35.05,22L30,13.21Zm31.45,13A35.23,35.23,0,1,1,36.52,36.52,35.13,35.13,0,0,1,61.44,26.2ZM58.31,4A3.95,3.95,0,1,1,66.2,4V14.06a3.95,3.95,0,1,1-7.89,0V4ZM87.49,10.1A3.93,3.93,0,1,1,94.3,14l-5.06,8.76a3.93,3.93,0,1,1-6.81-3.92l5.06-8.75ZM109.67,30a3.93,3.93,0,1,1,3.94,6.81l-8.75,5.06a3.94,3.94,0,1,1-4-6.81L109.67,30Zm9.26,28.32a3.95,3.95,0,1,1,0,7.89H108.82a3.95,3.95,0,1,1,0-7.89Zm-6.15,29.18a3.93,3.93,0,1,1-3.91,6.81l-8.76-5.06A3.93,3.93,0,1,1,104,82.43l8.75,5.06ZM92.89,109.67a3.93,3.93,0,1,1-6.81,3.94L81,104.86a3.94,3.94,0,0,1,6.81-4l5.06,8.76Zm-28.32,9.26a3.95,3.95,0,1,1-7.89,0V108.82a3.95,3.95,0,1,1,7.89,0v10.11Zm-29.18-6.15a3.93,3.93,0,0,1-6.81-3.91l5.06-8.76A3.93,3.93,0,1,1,40.45,104l-5.06,8.75ZM13.21,92.89a3.93,3.93,0,1,1-3.94-6.81L18,81A3.94,3.94,0,1,1,22,87.83l-8.76,5.06ZM4,64.57a3.95,3.95,0,1,1,0-7.89H14.06a3.95,3.95,0,1,1,0,7.89ZM10.1,35.39A3.93,3.93,0,1,1,14,28.58l8.76,5.06a3.93,3.93,0,1,1-3.92,6.81L10.1,35.39Z"
					></path>
				</svg>
			{/if}
		{/if}
	</button>
</header>

<style>
	button.zeltron-strong-component {
		font-size: 15px;
		display: flex;
		justify-content: center;
		align-items: center;
		box-sizing: border-box;
		height: 30px;
		width: 30px;
		padding: 3px;
		flex-shrink: 0;
	}

	a {
		margin-right: clamp(1px, 0.8vw, 5px);
	}

	.nav-button {
		display: flex;
		justify-content: center;
		align-items: center;
		box-sizing: border-box;
		height: 30px;
		padding: 3px clamp(3px, 1.2vw, 8px);
		font-size: clamp(12px, 3vw, 15px);
		font-family: Roboto-Condensed, monospace;
		white-space: nowrap;
		border: 2px solid transparent;
	}

	.nav-button:hover {
		text-decoration: none;
	}

	.home-button {
		gap: 4px;
	}

	.home-icon {
		width: 1em;
		height: 1em;
		flex-shrink: 0;
	}

	header {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: var(--layout-header-height);
		padding: 0 clamp(2px, 1vw, 7px);
		box-sizing: border-box;
		display: flex;
		justify-content: space-between;
		align-items: center;
		z-index: var(--z-index-navbar);
		border-bottom: 1px solid var(--color-component-background);
	}

	@media (max-width: 260px) {
		.nav-button {
			height: 24px;
			padding: 3px 2px;
			font-size: 11px;
		}

		a {
			margin-right: 1px;
		}

		.home-button {
			gap: 3px;
		}

		header {
			padding: 0 2px;
		}

		button.zeltron-strong-component {
			width: 24px;
			height: 24px;
			padding: 2px;
		}
	}

	@media (max-width: 220px) {
		.nav-button {
			height: 24px;
			padding: 3px 1px;
			font-size: 10px;
		}

		a {
			margin-right: 0;
		}

		header {
			padding: 0 1px;
		}

		button.zeltron-strong-component {
			width: 24px;
			height: 24px;
			padding: 1px;
		}
	}

	@media (max-width: 190px) {
		.nav-button {
			height: 24px;
			padding: 3px 0;
			font-size: 9px;
			border-width: 0;
		}

		.home-button {
			gap: 2px;
		}

		header {
			padding: 0 3px;
			overflow-x: auto;
			overflow-y: hidden;
		}

		button.zeltron-strong-component {
			width: 24px;
			height: 24px;
			padding: 1px;
			border-width: 1px;
		}
	}
</style>
