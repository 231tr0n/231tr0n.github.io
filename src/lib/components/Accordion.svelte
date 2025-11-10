<script lang="ts">
	import { slide, fade } from 'svelte/transition';
	import { animationDelay, animationDuration } from '$lib/animation.constants';
	import { resolve } from '$app/paths';
	import type { Snippet } from 'svelte';
	import type { RouteId } from '$app/types';

	let {
		name = '',
		url = '',
		external = false,
		open = false,
		children
	}: {
		name: string;
		url: string;
		external: boolean;
		open: boolean;
		children: Snippet | null;
	} = $props();

	const summaryToggler = () => {
		open = open ? false : true;
	};
</script>

<div class="details">
	<div class="summary">
		<div class="spacer">
			<h2>{name}</h2>
			<button
				class="summary-toggler zeltron-flex-middle"
				aria-label="Accordion summary toggler"
				onclick={summaryToggler}
				onkeypress={summaryToggler}
				type="button">
				{#if open}
					<svg
						fill="currentColor"
						height="15"
						viewBox="0 0 16 16"
						width="15"
						xmlns="http://www.w3.org/2000/svg">
						<path
							d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z"
							fill-rule="evenodd" />
					</svg>
				{:else}
					<svg
						fill="currentColor"
						height="15"
						viewBox="0 0 16 16"
						width="15"
						xmlns="http://www.w3.org/2000/svg">
						<path
							d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
							fill-rule="evenodd" />
					</svg>
				{/if}
			</button>
			{#if url}
				{#if external}
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
					<a href={url} rel="noopener noreferrer" target="_blank">
						<button type="button">Open</button>
					</a>
				{:else}
					<a href={resolve(url as RouteId)}><button type="button">Open</button></a>
				{/if}
			{/if}
		</div>
	</div>
	{#if open}
		<div
			in:slide={{ duration: animationDuration }}
			out:slide={{ delay: animationDelay, duration: animationDuration }}>
			<div
				in:fade={{ duration: animationDelay + animationDuration }}
				out:fade={{ duration: animationDuration }}>
				{@render children?.()}
			</div>
		</div>
	{/if}
</div>

<style>
	.summary-toggler {
		width: 24px;
		height: 24px;
	}

	.details {
		margin-top: 5px;
	}

	.summary {
		list-style: none;
		border-bottom: 1px solid var(--color-dark-foreground);
		margin-bottom: 5px;
	}

	a > button {
		margin-left: 5px;
		padding: 2px;
		font-size: 14px;
	}

	.spacer {
		width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	h2 {
		width: 100%;
		border: 0px;
		margin: 0px;
	}

	:global(body.dark) h2 {
		border: 0px;
	}
</style>
