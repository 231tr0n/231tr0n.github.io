<script lang="ts">
	import { fade } from 'svelte/transition';
	import { resolve } from '$app/paths';

	let { name = '', url = '', external = false, open = false, internal = true, children } = $props();

	// @ts-expect-error - resolve will accept a string variable which will always be from the defined routes
	const resolvedUrl = resolve(url);

	let summaryToggler = () => {
		open = open ? false : true;
	};
</script>

<div class="details">
	<div class="summary">
		<div class="spacer">
			<h2>{name}</h2>
			<button
				class="summary-toggler flex-middle"
				aria-label="Accordion summary toggler"
				onclick={summaryToggler}
				onkeypress={summaryToggler}>
				{#if open}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="15"
						height="15"
						fill="currentColor"
						class="bi bi-chevron-up"
						viewBox="0 0 16 16">
						<path
							fill-rule="evenodd"
							d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z" />
					</svg>
				{:else}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="15"
						height="15"
						fill="currentColor"
						class="bi bi-chevron-down"
						viewBox="0 0 16 16">
						<path
							fill-rule="evenodd"
							d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z" />
					</svg>
				{/if}
			</button>
			{#if url}
				{#if external}
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
					<a target="_blank" href={url}><button>Open</button></a>
				{:else if internal}
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
					<a href={resolvedUrl}><button>Open</button></a>
				{:else}
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
					<a href={url}><button>Open</button></a>
				{/if}
			{/if}
		</div>
	</div>
	{#if open}
		<div transition:fade>
			{#if children}
				{@render children()}
			{:else}
				<div class="error">No children to render</div>
			{/if}
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
